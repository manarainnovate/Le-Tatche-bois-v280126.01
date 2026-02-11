import { NextRequest } from "next/server";
import path from "path";
import * as nodemailer from "nodemailer";
import { apiSuccess, apiError, withAuth, handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import * as EmailTemplates from "@/lib/email-templates";

// ═══════════════════════════════════════════════════════════
// POST /api/messages/[id]/reply - Send reply email
// ═══════════════════════════════════════════════════════════

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = withAuth(
  async (req: NextRequest, context: RouteContext) => {
    try {
      const { id } = await context.params;
      const body = await req.json();

      const { to, subject, message, attachments = [] } = body;

      if (!to || !subject || !message) {
        return apiError("Missing required fields", 400);
      }

      // Get original message for template context
      const originalMessage = await prisma.message.findUnique({
        where: { id },
      });

      if (!originalMessage) {
        return apiError("Original message not found", 404);
      }

      // Get admin user info (from session or default)
      const adminName = "LE TATCHE BOIS Admin"; // TODO: Get from session
      const adminEmail = process.env.SMTP_FROM ?? "contact@letatchebois.com";

      // Get SMTP config
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT ?? "465", 10);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS; // Support both variable names
      const secure = process.env.SMTP_SECURE === "true";
      const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "contact@letatchebois.com";

      if (!host || !user || !pass) {
        console.error("[Reply Email] SMTP not configured properly");
        console.error(`[Reply Email] host=${host}, port=${port}, user=${user ? "set" : "NOT SET"}, pass=${pass ? "set" : "NOT SET"}`);

        // For development: just log and return success
        if (process.env.NODE_ENV === "development") {
          console.log(`[Reply Email] DEV MODE - Would send to ${to}: ${subject}`);
          console.log(`[Reply Email] DEV MODE - Message: ${message}`);
          console.log(`[Reply Email] DEV MODE - Attachments: ${attachments.length} files`);

          // Still save to database in dev mode
          try {
            await prisma.message.create({
              data: {
                name: adminName,
                email: adminEmail,
                subject,
                content: message,
                attachments: attachments.length > 0 ? attachments : undefined,
                type: "SENT",
                inReplyToId: id,
                read: true,
                starred: false,
                locale: "fr",
              },
            });
          } catch (dbError) {
            console.error(`[Reply Email] DEV MODE - Failed to save to database:`, dbError);
          }

          return apiSuccess({
            message: "Reply sent successfully (dev mode - email not actually sent)",
            to,
            subject,
            devMode: true,
          });
        }

        return apiError("Email system not configured. Please contact administrator.", 500);
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        logger: true, // Enable logging
        debug: process.env.NODE_ENV === "development", // Enable debug in dev
      });

      // Verify connection
      try {
        await transporter.verify();
        console.log(`[Reply Email] ✅ SMTP connection verified successfully`);
      } catch (verifyError) {
        console.error(`[Reply Email] ❌ SMTP connection failed:`, verifyError);
        return apiError("Email server connection failed. Please try again later.", 500);
      }

      // Use beautiful email template with Moroccan branding
      const htmlContent = EmailTemplates.getAdminReplyEmail(
        {
          name: originalMessage.name,
          email: originalMessage.email,
          phone: originalMessage.phone,
          subject: originalMessage.subject,
          content: originalMessage.content,
          locale: originalMessage.locale || "fr",
          createdAt: originalMessage.createdAt,
        },
        message, // The reply content
        adminName // Admin name for signature
      );

      // Prepare email with attachments
      const mailOptions: any = {
        from: `"LE TATCHE BOIS" <${fromEmail}>`,
        replyTo: fromEmail,
        to,
        subject,
        html: htmlContent,
        headers: {
          'X-Mailer': 'LE TATCHE BOIS CRM',
          'X-Priority': '3',
        },
      };

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        console.log(`[Reply Email] Processing ${attachments.length} attachments`);
        mailOptions.attachments = attachments.map((file: any) => {
          console.log(`[Reply Email] Attachment: ${file.name} (${file.size} bytes) - URL: ${file.url}`);

          // Convert relative URL to absolute file path
          // file.url is like "/api/uploads/2026/02/filename.pdf" or "/uploads/2026/02/filename.pdf"
          let filePath: string;
          if (file.url.startsWith('http://') || file.url.startsWith('https://')) {
            // External URL - nodemailer will download it
            filePath = file.url;
          } else {
            // Local file - strip /api prefix and convert to absolute path
            const normalizedUrl = file.url.replace(/^\/api/, '');
            filePath = path.join(process.cwd(), 'public', normalizedUrl);
            console.log(`[Reply Email] Converted to absolute path: ${filePath}`);
          }

          return {
            filename: file.name,
            path: filePath,
          };
        });
      }

      // Save sent message to database FIRST (so UI can update immediately)
      let savedMessageId: string | undefined;
      try {
        const savedMessage = await prisma.message.create({
          data: {
            name: adminName,
            email: adminEmail,
            subject,
            content: message,
            attachments: attachments.length > 0 ? attachments : undefined,
            type: "SENT",
            inReplyToId: id,
            read: true,
            starred: false,
            locale: "fr",
          },
        });
        savedMessageId = savedMessage.id;
        console.log(`[Reply Email] ✅ Saved to database as SENT message (ID: ${savedMessageId})`);
      } catch (dbError) {
        console.error(`[Reply Email] ⚠️  Failed to save to database:`, dbError);
        // Continue anyway - we'll still try to send the email
      }

      // Send email in background with timeout (don't block the response)
      console.log(`[Reply Email] Starting email send to ${to} via ${host}:${port}`);
      console.log(`[Reply Email] From: ${fromEmail}, User: ${user}`);
      if (attachments && attachments.length > 0) {
        console.log(`[Reply Email] Email includes ${attachments.length} attachment(s)`);
      }

      // Create a promise with timeout
      const sendEmailWithTimeout = async () => {
        const TIMEOUT_MS = 30000; // 30 seconds timeout

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Email send timeout after 30s')), TIMEOUT_MS);
        });

        try {
          const info = await Promise.race([
            transporter.sendMail(mailOptions),
            timeoutPromise
          ]);
          console.log(`[Reply Email] ✅ Successfully sent to ${to}: ${subject}`);
          console.log(`[Reply Email] Message ID: ${(info as any).messageId}`);
          return { success: true, messageId: (info as any).messageId };
        } catch (error) {
          console.error(`[Reply Email] ❌ Failed to send email:`, error);
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      };

      // Fire email send in background (don't await)
      sendEmailWithTimeout().catch(err => {
        console.error(`[Reply Email] Background email send failed:`, err);
      });

      // Return success immediately (email is being sent in background)
      return apiSuccess({
        message: "Reply queued successfully",
        to,
        subject,
        messageId: savedMessageId,
        note: "Email is being sent in the background",
      });
    } catch (error) {
      console.error(`[Reply Email] ❌ Failed to send email:`, error);

      // Log specific error details
      if (error instanceof Error) {
        console.error(`[Reply Email] Error name: ${error.name}`);
        console.error(`[Reply Email] Error message: ${error.message}`);
        console.error(`[Reply Email] Error stack:`, error.stack);
      }

      return handleApiError(error, "Message Reply POST");
    }
  },
  ["ADMIN", "EDITOR", "SALES"]
);
