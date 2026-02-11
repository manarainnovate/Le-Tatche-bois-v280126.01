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

      if (!to || !message) {
        return apiError("Missing required fields: to and message are required", 400);
      }

      // ═══════════════════════════════════════════════════════════
      // STEP 1: Find original message
      // ═══════════════════════════════════════════════════════════
      const originalMessage = await prisma.message.findUnique({
        where: { id },
      });

      if (!originalMessage) {
        return apiError("Original message not found", 404);
      }

      // ═══════════════════════════════════════════════════════════
      // STEP 2: Save reply to database FIRST (CRITICAL!)
      // ═══════════════════════════════════════════════════════════
      const adminName = "LE TATCHE BOIS Admin";
      const adminEmail = process.env.SMTP_FROM ?? "contact@letatchebois.com";

      let savedMessageId: string | undefined;
      try {
        const savedMessage = await prisma.message.create({
          data: {
            name: adminName,
            email: adminEmail,
            subject: subject || `Re: ${originalMessage.subject || "Votre message"}`,
            content: message,
            attachments: attachments.length > 0 ? attachments : undefined,
            type: "SENT",
            inReplyToId: id,
            read: true,
            starred: false,
            locale: originalMessage.locale || "fr",
          },
        });
        savedMessageId = savedMessage.id;
        console.log(`[Reply API] ✅ Reply saved to database (ID: ${savedMessageId})`);
      } catch (dbError) {
        console.error(`[Reply API] ❌ Failed to save reply to database:`, dbError);
        return apiError("Failed to save reply to database", 500);
      }

      // ═══════════════════════════════════════════════════════════
      // STEP 3: Try to send email — DON'T block the response
      // ═══════════════════════════════════════════════════════════
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT ?? "465", 10);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
      const secure = process.env.SMTP_SECURE === "true";
      const fromEmail = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "contact@letatchebois.com";

      let emailSent = false;
      let emailError: string | null = null;

      // Send email in background (non-blocking)
      if (!host || !user || !pass) {
        emailError = "SMTP not configured";
        console.warn(`[Reply API] ⚠️  SMTP not configured - reply saved but email not sent`);
      } else {
        // Fire and forget - send email in background
        const sendEmailInBackground = async () => {
          try {
            console.log(`[Reply API] 📧 Sending email to ${to} via ${host}:${port}...`);

            const transporter = nodemailer.createTransport({
              host,
              port,
              secure,
              auth: { user, pass },
            });

            // Use beautiful email template
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
              message,
              adminName
            );

            const mailOptions: any = {
              from: `"LE TATCHE BOIS" <${fromEmail}>`,
              replyTo: fromEmail,
              to,
              subject: subject || `Re: ${originalMessage.subject || "Votre message"}`,
              html: htmlContent,
              headers: {
                'X-Mailer': 'LE TATCHE BOIS CRM',
                'X-Priority': '3',
              },
            };

            // Add attachments if provided
            if (attachments && attachments.length > 0) {
              console.log(`[Reply API] 📎 Processing ${attachments.length} attachment(s)`);
              mailOptions.attachments = attachments.map((file: any) => {
                let filePath: string;
                if (file.url.startsWith('http://') || file.url.startsWith('https://')) {
                  filePath = file.url;
                } else {
                  const normalizedUrl = file.url.replace(/^\/api/, '');
                  filePath = path.join(process.cwd(), 'public', normalizedUrl);
                }
                return {
                  filename: file.name,
                  path: filePath,
                };
              });
            }

            // Send with timeout
            const TIMEOUT_MS = 30000; // 30 seconds
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Email timeout after 30s')), TIMEOUT_MS);
            });

            await Promise.race([
              transporter.sendMail(mailOptions),
              timeoutPromise
            ]);

            console.log(`[Reply API] ✅ Email sent successfully to ${to}`);
          } catch (error) {
            console.error(`[Reply API] ❌ Email failed (reply still saved):`, error);
          }
        };

        // Fire in background - don't await
        sendEmailInBackground().catch(err => {
          console.error(`[Reply API] Background email error:`, err);
        });

        emailSent = true; // Optimistic - we queued it
      }

      // ═══════════════════════════════════════════════════════════
      // STEP 4: Return success IMMEDIATELY
      // ═══════════════════════════════════════════════════════════
      return apiSuccess({
        message: emailSent
          ? "Réponse envoyée avec succès"
          : "Réponse enregistrée mais l'email n'a pas pu être envoyé (SMTP non configuré)",
        messageId: savedMessageId,
        to,
        subject: subject || `Re: ${originalMessage.subject || "Votre message"}`,
        emailQueued: emailSent,
        emailError,
      });

    } catch (error) {
      console.error(`[Reply API] ❌ Critical error:`, error);
      return handleApiError(error, "Message Reply POST");
    }
  },
  ["ADMIN", "EDITOR", "SALES"]
);
