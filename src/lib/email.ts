import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import * as EmailTemplates from "./email-templates";

// ═══════════════════════════════════════════════════════════
// Transporter Setup (Zoho SMTP)
// ═══════════════════════════════════════════════════════════

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS; // Support both variable names
  const secure = process.env.SMTP_SECURE === "true"; // true for port 465

  if (!host || !user || !pass) {
    console.warn("[Email] SMTP not configured - emails will be logged only");
    console.warn(`[Email] Config: host=${host ? 'SET' : 'NOT SET'}, user=${user ? 'SET' : 'NOT SET'}, pass=${pass ? 'SET' : 'NOT SET'}`);
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    console.log(`[Email] Transporter configured: ${host}:${port} (secure: ${secure})`);
    return transporter;
  } catch (error) {
    console.error("[Email] Failed to create transporter:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// Email Configuration
// ═══════════════════════════════════════════════════════════

const FROM_EMAIL = process.env.SMTP_FROM ?? "contact@letatchebois.com";
const FROM_NAME = "LE TATCHE BOIS";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "contact@letatchebois.com";

// ═══════════════════════════════════════════════════════════
// Send Email Helper
// ═══════════════════════════════════════════════════════════

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    // Log email if transporter not configured (development)
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return true;
  }

  try {
    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// Contact Message Emails
// ═══════════════════════════════════════════════════════════

export interface MessageEmailData {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  content: string;
  locale: string;
  createdAt: Date;
}

export async function sendMessageNotificationToAdmin(
  message: MessageEmailData
): Promise<boolean> {
  const html = EmailTemplates.getAdminMessageNotificationEmail(message);
  const subject = `📩 Nouveau message de ${message.name} — LE TATCHE BOIS`;
  return sendEmail(ADMIN_EMAIL, subject, html);
}

export async function sendMessageConfirmationToVisitor(
  message: MessageEmailData
): Promise<boolean> {
  const translations = {
    fr: "Merci pour votre message — LE TATCHE BOIS",
    en: "Thank you for your message — LE TATCHE BOIS",
    es: "Gracias por su mensaje — LE TATCHE BOIS",
    ar: "شكراً لرسالتك — LE TATCHE BOIS",
  };

  const subject = translations[message.locale as keyof typeof translations] || translations.fr;
  const html = EmailTemplates.getVisitorConfirmationEmail(message);
  return sendEmail(message.email, subject, html);
}

// ═══════════════════════════════════════════════════════════
// Order Emails
// ═══════════════════════════════════════════════════════════

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  locale: string;
  createdAt: Date;
}

export async function sendOrderNotificationToAdmin(
  order: OrderEmailData
): Promise<boolean> {
  const html = EmailTemplates.getAdminOrderNotificationEmail(order);
  const subject = `🛒 Nouvelle commande ${order.orderNumber} — ${order.total.toFixed(2)} DH`;
  return sendEmail(ADMIN_EMAIL, subject, html);
}

export async function sendOrderConfirmationToCustomer(
  order: OrderEmailData
): Promise<boolean> {
  const translations = {
    fr: `Confirmation de commande ${order.orderNumber} — LE TATCHE BOIS`,
    en: `Order confirmation ${order.orderNumber} — LE TATCHE BOIS`,
    es: `Confirmación de pedido ${order.orderNumber} — LE TATCHE BOIS`,
    ar: `تأكيد الطلب ${order.orderNumber} — LE TATCHE BOIS`,
  };

  const subject = translations[order.locale as keyof typeof translations] || translations.fr;
  const html = EmailTemplates.getCustomerOrderConfirmationEmail(order);
  return sendEmail(order.customerEmail, subject, html);
}

export async function sendOrderStatusUpdateToCustomer(
  order: OrderEmailData,
  status: "CONFIRMED" | "SHIPPED" | "DELIVERED",
  trackingNumber?: string
): Promise<boolean> {
  const statusTranslations = {
    CONFIRMED: {
      fr: `Commande ${order.orderNumber} confirmée`,
      en: `Order ${order.orderNumber} confirmed`,
      es: `Pedido ${order.orderNumber} confirmado`,
      ar: `تم تأكيد الطلب ${order.orderNumber}`,
    },
    SHIPPED: {
      fr: `Commande ${order.orderNumber} expédiée — Numéro de suivi: ${trackingNumber || "N/A"}`,
      en: `Order ${order.orderNumber} shipped — Tracking: ${trackingNumber || "N/A"}`,
      es: `Pedido ${order.orderNumber} enviado — Seguimiento: ${trackingNumber || "N/A"}`,
      ar: `تم شحن الطلب ${order.orderNumber} — التتبع: ${trackingNumber || "N/A"}`,
    },
    DELIVERED: {
      fr: `Commande ${order.orderNumber} livrée`,
      en: `Order ${order.orderNumber} delivered`,
      es: `Pedido ${order.orderNumber} entregado`,
      ar: `تم توصيل الطلب ${order.orderNumber}`,
    },
  };

  const subject = statusTranslations[status][order.locale as keyof typeof statusTranslations[typeof status]] || statusTranslations[status].fr;
  const html = EmailTemplates.getOrderStatusUpdateEmail(order, status, trackingNumber);
  return sendEmail(order.customerEmail, subject, html);
}

// ═══════════════════════════════════════════════════════════
// Quote Request Emails
// ═══════════════════════════════════════════════════════════

export interface QuoteEmailData {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service: string;
  description: string;
  dimensions?: string;
  budget?: string;
  deadline?: string;
  locale: string;
  createdAt: Date;
}

export async function sendQuoteNotificationToAdmin(
  quote: QuoteEmailData
): Promise<boolean> {
  const html = EmailTemplates.getAdminQuoteNotificationEmail(quote);
  const subject = `📋 Nouvelle demande de devis ${quote.quoteNumber} — ${quote.service}`;
  return sendEmail(ADMIN_EMAIL, subject, html);
}

export async function sendQuoteConfirmationToCustomer(
  quote: QuoteEmailData
): Promise<boolean> {
  const translations = {
    fr: `Demande de devis reçue ${quote.quoteNumber} — LE TATCHE BOIS`,
    en: `Quote request received ${quote.quoteNumber} — LE TATCHE BOIS`,
    es: `Solicitud de presupuesto recibida ${quote.quoteNumber} — LE TATCHE BOIS`,
    ar: `تم استلام طلب عرض السعر ${quote.quoteNumber} — LE TATCHE BOIS`,
  };

  const subject = translations[quote.locale as keyof typeof translations] || translations.fr;
  const html = EmailTemplates.getCustomerQuoteConfirmationEmail(quote);
  return sendEmail(quote.customerEmail, subject, html);
}

// ═══════════════════════════════════════════════════════════
// Legacy Email Functions (kept for compatibility)
// ═══════════════════════════════════════════════════════════

export async function sendOrderConfirmation(order: OrderEmailData): Promise<boolean> {
  return sendOrderConfirmationToCustomer(order);
}

export async function sendOrderShipped(
  order: OrderEmailData,
  trackingNumber: string
): Promise<boolean> {
  return sendOrderStatusUpdateToCustomer(order, "SHIPPED", trackingNumber);
}

export async function sendQuoteConfirmation(quote: QuoteEmailData): Promise<boolean> {
  return sendQuoteConfirmationToCustomer(quote);
}

export async function sendMessageConfirmation(message: { name: string; email: string; subject: string; content: string }): Promise<boolean> {
  const messageData: MessageEmailData = {
    ...message,
    subject: message.subject || null,
    phone: null,
    locale: "fr",
    createdAt: new Date(),
  };
  return sendMessageConfirmationToVisitor(messageData);
}

export async function notifyAdminNewMessage(message: { name: string; email: string; subject: string; content: string }): Promise<boolean> {
  const messageData: MessageEmailData = {
    ...message,
    subject: message.subject || null,
    phone: null,
    locale: "fr",
    createdAt: new Date(),
  };
  return sendMessageNotificationToAdmin(messageData);
}

export async function notifyAdminNewOrder(order: OrderEmailData): Promise<boolean> {
  return sendOrderNotificationToAdmin(order);
}

export async function notifyAdminNewQuote(quote: QuoteEmailData): Promise<boolean> {
  return sendQuoteNotificationToAdmin(quote);
}
