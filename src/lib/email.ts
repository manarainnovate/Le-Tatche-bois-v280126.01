import nodemailer from "nodemailer";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
  status?: string;
}

export interface QuoteEmailData {
  reference: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  description: string;
  status?: string;
}

export interface MessageEmailData {
  name: string;
  email: string;
  subject: string;
  content: string;
}

export interface AdminNotificationData {
  type: "new_order" | "new_quote" | "new_message" | "payment_failed";
  title: string;
  details: Record<string, string | number>;
  link?: string;
}

// ═══════════════════════════════════════════════════════════
// Transporter Setup
// ═══════════════════════════════════════════════════════════

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    // Return null if not configured - emails will be logged instead
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

const transporter = createTransporter();

// ═══════════════════════════════════════════════════════════
// Email Configuration
// ═══════════════════════════════════════════════════════════

const FROM_EMAIL = process.env.EMAIL_FROM ?? "contact@letatchebois.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "LE TATCHE BOIS";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "contact@letatchebois.com";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://letatchebois.com";

// ═══════════════════════════════════════════════════════════
// Base Template
// ═══════════════════════════════════════════════════════════

function baseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header .tagline {
      color: #D4A574;
      font-size: 14px;
      margin-top: 8px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #8B4513;
      margin-top: 0;
      font-size: 22px;
    }
    .content p {
      color: #555;
      margin-bottom: 16px;
    }
    .order-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .order-table th {
      background-color: #8B4513;
      color: #ffffff;
      padding: 12px;
      text-align: left;
      font-weight: 500;
    }
    .order-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .order-table .total-row td {
      border-top: 2px solid #8B4513;
      font-weight: bold;
      color: #8B4513;
    }
    .info-box {
      background-color: #FDF6E3;
      border-left: 4px solid #8B4513;
      padding: 15px 20px;
      margin: 20px 0;
    }
    .info-box h3 {
      color: #8B4513;
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    .info-box p {
      margin: 0;
      color: #666;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .status-pending { background-color: #FEF3CD; color: #856404; }
    .status-confirmed { background-color: #D4EDDA; color: #155724; }
    .status-processing { background-color: #CCE5FF; color: #004085; }
    .status-shipped { background-color: #D1ECF1; color: #0C5460; }
    .status-delivered { background-color: #C3E6CB; color: #155724; }
    .status-cancelled { background-color: #F8D7DA; color: #721C24; }
    .footer {
      background-color: #2C1810;
      padding: 30px;
      text-align: center;
    }
    .footer p {
      color: #999;
      font-size: 14px;
      margin: 5px 0;
    }
    .footer a {
      color: #D4A574;
      text-decoration: none;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #D4A574;
    }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 20px 15px; }
      .header { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪵 LE TATCHE BOIS</h1>
      <p class="tagline">Artisanat du bois de qualité</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>LE TATCHE BOIS</strong></p>
      <p>Lot Hamane El Fetouaki N°365, Lamhamid, Marrakech</p>
      <p>📞 +212 698 013 468 | 📧 contact@letatchebois.com</p>
      <div class="social-links">
        <a href="https://facebook.com/letatchebois">Facebook</a> |
        <a href="https://instagram.com/letatchebois">Instagram</a> |
        <a href="https://wa.me/212698013468">WhatsApp</a>
      </div>
      <p style="margin-top: 20px; font-size: 12px;">
        © ${new Date().getFullYear()} LE TATCHE BOIS. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ═══════════════════════════════════════════════════════════
// Send Email Helper
// ═══════════════════════════════════════════════════════════

async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  if (!transporter) {
    // Log email if transporter not configured (development)
    // eslint-disable-next-line no-console
    console.log("[Email] Would send email:", { to, subject });
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// Order Confirmation Email
// ═══════════════════════════════════════════════════════════

export async function sendOrderConfirmation(order: OrderEmailData): Promise<boolean> {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${item.price.toFixed(2)} DH</td>
      </tr>
    `
    )
    .join("");

  const content = `
    <h2>Confirmation de Commande</h2>
    <p>Bonjour <strong>${order.customerName}</strong>,</p>
    <p>Merci pour votre commande ! Nous l'avons bien reçue et nous la préparons avec soin.</p>

    <div class="info-box">
      <h3>📦 Numéro de commande</h3>
      <p style="font-size: 20px; font-weight: bold; color: #8B4513;">${order.orderNumber}</p>
    </div>

    <h3>Détails de votre commande</h3>
    <table class="order-table">
      <thead>
        <tr>
          <th>Produit</th>
          <th style="text-align: center;">Qté</th>
          <th style="text-align: right;">Prix</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="text-align: right;">Sous-total</td>
          <td style="text-align: right;">${order.subtotal.toFixed(2)} DH</td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: right;">Livraison</td>
          <td style="text-align: right;">${order.shippingCost > 0 ? `${order.shippingCost.toFixed(2)} DH` : "Gratuite"}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align: right;">Total</td>
          <td style="text-align: right;">${order.total.toFixed(2)} DH</td>
        </tr>
      </tbody>
    </table>

    <div class="info-box">
      <h3>📍 Adresse de livraison</h3>
      <p>${order.shippingAddress}</p>
    </div>

    <div class="info-box">
      <h3>💳 Mode de paiement</h3>
      <p>${order.paymentMethod === "STRIPE" ? "Carte bancaire" : "Paiement à la livraison"}</p>
    </div>

    <p style="text-align: center;">
      <a href="${SITE_URL}/fr/compte/commandes/${order.orderNumber}" class="cta-button">
        Suivre ma commande
      </a>
    </p>

    <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
    <p>Cordialement,<br><strong>L'équipe Le Tatche Bois</strong></p>
  `;

  const html = baseTemplate(content, `Commande ${order.orderNumber} - Le Tatche Bois`);
  return sendEmail(order.customerEmail, `Confirmation de commande #${order.orderNumber}`, html);
}

// ═══════════════════════════════════════════════════════════
// Order Shipped Email
// ═══════════════════════════════════════════════════════════

export async function sendOrderShipped(
  order: OrderEmailData,
  trackingNumber: string
): Promise<boolean> {
  const content = `
    <h2>Votre commande est en route ! 🚚</h2>
    <p>Bonjour <strong>${order.customerName}</strong>,</p>
    <p>Bonne nouvelle ! Votre commande <strong>#${order.orderNumber}</strong> a été expédiée et est en route vers vous.</p>

    <div class="info-box">
      <h3>📦 Numéro de suivi</h3>
      <p style="font-size: 18px; font-weight: bold; color: #8B4513;">${trackingNumber}</p>
    </div>

    <div class="info-box">
      <h3>📍 Adresse de livraison</h3>
      <p>${order.shippingAddress}</p>
    </div>

    <p>Vous pouvez suivre votre colis en utilisant le numéro de suivi ci-dessus.</p>

    <p style="text-align: center;">
      <a href="${SITE_URL}/fr/compte/commandes/${order.orderNumber}" class="cta-button">
        Voir les détails
      </a>
    </p>

    <p>Merci pour votre confiance !</p>
    <p>Cordialement,<br><strong>L'équipe Le Tatche Bois</strong></p>
  `;

  const html = baseTemplate(content, `Commande expédiée - Le Tatche Bois`);
  return sendEmail(order.customerEmail, `Votre commande #${order.orderNumber} est en route !`, html);
}

// ═══════════════════════════════════════════════════════════
// Order Status Update Email
// ═══════════════════════════════════════════════════════════

export async function sendOrderStatusUpdate(
  order: OrderEmailData,
  newStatus: string
): Promise<boolean> {
  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PROCESSING: "En préparation",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };

  const statusLabel = statusLabels[newStatus] ?? newStatus;
  const statusClass = `status-${newStatus.toLowerCase()}`;

  const content = `
    <h2>Mise à jour de votre commande</h2>
    <p>Bonjour <strong>${order.customerName}</strong>,</p>
    <p>Le statut de votre commande <strong>#${order.orderNumber}</strong> a été mis à jour.</p>

    <div style="text-align: center; margin: 30px 0;">
      <span class="status-badge ${statusClass}">${statusLabel}</span>
    </div>

    <p style="text-align: center;">
      <a href="${SITE_URL}/fr/compte/commandes/${order.orderNumber}" class="cta-button">
        Voir ma commande
      </a>
    </p>

    <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
    <p>Cordialement,<br><strong>L'équipe Le Tatche Bois</strong></p>
  `;

  const html = baseTemplate(content, `Commande ${order.orderNumber} - Mise à jour`);
  return sendEmail(order.customerEmail, `Commande #${order.orderNumber} - ${statusLabel}`, html);
}

// ═══════════════════════════════════════════════════════════
// Quote Confirmation Email
// ═══════════════════════════════════════════════════════════

export async function sendQuoteConfirmation(quote: QuoteEmailData): Promise<boolean> {
  const content = `
    <h2>Demande de Devis Reçue ✓</h2>
    <p>Bonjour <strong>${quote.customerName}</strong>,</p>
    <p>Nous avons bien reçu votre demande de devis et nous vous remercions de votre confiance.</p>

    <div class="info-box">
      <h3>📋 Référence de votre demande</h3>
      <p style="font-size: 20px; font-weight: bold; color: #8B4513;">${quote.reference}</p>
    </div>

    <div class="info-box">
      <h3>🪵 Service demandé</h3>
      <p><strong>${quote.serviceName}</strong></p>
      <p style="margin-top: 10px;">${quote.description}</p>
    </div>

    <h3>Prochaines étapes</h3>
    <ol style="color: #555;">
      <li>Notre équipe étudie votre demande</li>
      <li>Un artisan vous contactera sous 48h</li>
      <li>Nous vous enverrons un devis détaillé</li>
    </ol>

    <p>En attendant, n'hésitez pas à parcourir nos réalisations pour vous inspirer.</p>

    <p style="text-align: center;">
      <a href="${SITE_URL}/fr/realisations" class="cta-button">
        Voir nos réalisations
      </a>
    </p>

    <p>Si vous avez des questions, contactez-nous par téléphone ou WhatsApp.</p>
    <p>Cordialement,<br><strong>L'équipe Le Tatche Bois</strong></p>
  `;

  const html = baseTemplate(content, `Devis ${quote.reference} - Le Tatche Bois`);
  return sendEmail(quote.customerEmail, `Votre demande de devis #${quote.reference}`, html);
}

// ═══════════════════════════════════════════════════════════
// Quote Status Update Email
// ═══════════════════════════════════════════════════════════

export async function sendQuoteStatusUpdate(
  quote: QuoteEmailData,
  newStatus: string
): Promise<boolean> {
  const statusLabels: Record<string, string> = {
    NEW: "Nouvelle",
    CONTACTED: "Contacté",
    IN_PROGRESS: "En cours",
    SENT: "Devis envoyé",
    WON: "Accepté",
    LOST: "Refusé",
    CANCELLED: "Annulé",
  };

  const statusLabel = statusLabels[newStatus] ?? newStatus;

  const content = `
    <h2>Mise à jour de votre demande de devis</h2>
    <p>Bonjour <strong>${quote.customerName}</strong>,</p>
    <p>Le statut de votre demande de devis <strong>#${quote.reference}</strong> a été mis à jour.</p>

    <div class="info-box">
      <h3>📋 Nouveau statut</h3>
      <p style="font-size: 18px; font-weight: bold; color: #8B4513;">${statusLabel}</p>
    </div>

    <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
    <p>Cordialement,<br><strong>L'équipe Le Tatche Bois</strong></p>
  `;

  const html = baseTemplate(content, `Devis ${quote.reference} - Mise à jour`);
  return sendEmail(quote.customerEmail, `Devis #${quote.reference} - ${statusLabel}`, html);
}

// ═══════════════════════════════════════════════════════════
// Message Confirmation Email
// ═══════════════════════════════════════════════════════════

export async function sendMessageConfirmation(message: MessageEmailData): Promise<boolean> {
  const content = `
    <h2>Message Reçu ✓</h2>
    <p>Bonjour <strong>${message.name}</strong>,</p>
    <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contacté.</p>

    <div class="info-box">
      <h3>📧 Votre message</h3>
      <p><strong>Sujet :</strong> ${message.subject}</p>
      <p style="margin-top: 10px; white-space: pre-line;">${message.content}</p>
    </div>

    <p>Notre équipe vous répondra dans les plus brefs délais (généralement sous 24-48h).</p>

    <p>En attendant, découvrez nos créations artisanales :</p>

    <p style="text-align: center;">
      <a href="${SITE_URL}/fr/boutique" class="cta-button">
        Visiter la boutique
      </a>
    </p>

    <p>Cordialement,<br><strong>L'équipe Le Tatche Bois</strong></p>
  `;

  const html = baseTemplate(content, `Message reçu - Le Tatche Bois`);
  return sendEmail(message.email, `Nous avons bien reçu votre message`, html);
}

// ═══════════════════════════════════════════════════════════
// Admin Notification Email
// ═══════════════════════════════════════════════════════════

export async function sendAdminNotification(data: AdminNotificationData): Promise<boolean> {
  const typeIcons: Record<string, string> = {
    new_order: "🛒",
    new_quote: "📋",
    new_message: "📧",
    payment_failed: "⚠️",
  };

  const icon = typeIcons[data.type] ?? "📌";

  const detailsHtml = Object.entries(data.details)
    .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
    .join("");

  const content = `
    <h2>${icon} ${data.title}</h2>

    <div class="info-box">
      <h3>Détails</h3>
      ${detailsHtml}
    </div>

    ${data.link ? `
    <p style="text-align: center;">
      <a href="${data.link}" class="cta-button">
        Voir les détails
      </a>
    </p>
    ` : ""}

    <p style="color: #999; font-size: 12px;">
      Cette notification a été envoyée automatiquement par le système Le Tatche Bois.
    </p>
  `;

  const html = baseTemplate(content, `${data.title} - Le Tatche Bois Admin`);
  return sendEmail(ADMIN_EMAIL, `[Admin] ${data.title}`, html);
}

// ═══════════════════════════════════════════════════════════
// Password Reset Email
// ═══════════════════════════════════════════════════════════

export async function sendPasswordReset(email: string, token: string): Promise<boolean> {
  const resetUrl = `${SITE_URL}/fr/auth/reset-password?token=${token}`;

  const content = `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Bonjour,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>

    <p style="text-align: center;">
      <a href="${resetUrl}" class="cta-button">
        Réinitialiser mon mot de passe
      </a>
    </p>

    <p style="color: #999; font-size: 14px;">
      Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
    </p>

    <p style="color: #999; font-size: 12px;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
      <a href="${resetUrl}" style="color: #8B4513;">${resetUrl}</a>
    </p>

    <p>Cordialement,<br><strong>L'équipe Le Tatche Bois</strong></p>
  `;

  const html = baseTemplate(content, `Réinitialisation de mot de passe - Le Tatche Bois`);
  return sendEmail(email, `Réinitialisation de votre mot de passe`, html);
}

// ═══════════════════════════════════════════════════════════
// Convenience functions for common admin notifications
// ═══════════════════════════════════════════════════════════

export async function notifyAdminNewOrder(order: OrderEmailData): Promise<boolean> {
  return sendAdminNotification({
    type: "new_order",
    title: `Nouvelle commande #${order.orderNumber}`,
    details: {
      Client: order.customerName,
      Email: order.customerEmail,
      Total: `${order.total.toFixed(2)} DH`,
      Articles: `${order.items.length} produit(s)`,
      Paiement: order.paymentMethod === "STRIPE" ? "Carte bancaire" : "À la livraison",
    },
    link: `${SITE_URL}/admin/orders/${order.orderNumber}`,
  });
}

export async function notifyAdminNewQuote(quote: QuoteEmailData): Promise<boolean> {
  return sendAdminNotification({
    type: "new_quote",
    title: `Nouvelle demande de devis #${quote.reference}`,
    details: {
      Client: quote.customerName,
      Email: quote.customerEmail,
      Service: quote.serviceName,
      Description: quote.description.substring(0, 100) + (quote.description.length > 100 ? "..." : ""),
    },
    link: `${SITE_URL}/admin/quotes/${quote.reference}`,
  });
}

export async function notifyAdminNewMessage(message: MessageEmailData): Promise<boolean> {
  return sendAdminNotification({
    type: "new_message",
    title: `Nouveau message de ${message.name}`,
    details: {
      Nom: message.name,
      Email: message.email,
      Sujet: message.subject,
      Message: message.content.substring(0, 150) + (message.content.length > 150 ? "..." : ""),
    },
    link: `${SITE_URL}/admin/messages`,
  });
}

export async function notifyAdminPaymentFailed(order: OrderEmailData): Promise<boolean> {
  return sendAdminNotification({
    type: "payment_failed",
    title: `Échec de paiement - Commande #${order.orderNumber}`,
    details: {
      Client: order.customerName,
      Email: order.customerEmail,
      Montant: `${order.total.toFixed(2)} DH`,
    },
    link: `${SITE_URL}/admin/orders/${order.orderNumber}`,
  });
}
