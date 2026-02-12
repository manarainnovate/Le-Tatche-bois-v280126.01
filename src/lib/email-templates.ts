// ═══════════════════════════════════════════════════════════
// Email Templates for LE TATCHE BOIS
// Wood Workshop Theme (#8B4513, #FFF8DC, #C9A227)
// ═══════════════════════════════════════════════════════════

export const BASE_TEMPLATE = (content: string, locale: string = "fr") => {
  const isRTL = locale === "ar";

  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LE TATCHE BOIS</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f0;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header p {
      color: #FFF8DC;
      font-size: 14px;
      margin-top: 8px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background-color: #8B4513;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background-color: #A0522D;
    }
    .info-box {
      background-color: #FFF8DC;
      border-left: 4px solid #C9A227;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f5f5f0;
      padding: 30px 20px;
      text-align: center;
      border-top: 3px solid #8B4513;
    }
    .footer p {
      color: #666;
      font-size: 13px;
      margin: 8px 0;
    }
    .footer a {
      color: #8B4513;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 30px 0;
    }
    h2 {
      color: #8B4513;
      font-size: 22px;
      margin-bottom: 16px;
    }
    h3 {
      color: #333;
      font-size: 16px;
      margin: 16px 0 8px 0;
    }
    p {
      margin: 12px 0;
      color: #555;
    }
    ul {
      margin: 12px 0;
      padding-left: 20px;
    }
    li {
      margin: 8px 0;
      color: #555;
    }
    .text-muted {
      color: #999;
      font-size: 13px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: ${isRTL ? 'right' : 'left'};
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background-color: #FFF8DC;
      color: #8B4513;
      font-weight: 600;
    }
    .order-total {
      font-size: 18px;
      font-weight: 700;
      color: #8B4513;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .button {
        display: block;
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 20px 0;">
        <table class="container" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>LE TATCHE BOIS</h1>
              <p>Artisanat du bois marocain</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p><strong>LE TATCHE BOIS</strong></p>
              <p>Tanger, Maroc</p>
              <p>
                Téléphone / WhatsApp: <a href="tel:+212661196464">+212 661 19 64 64</a><br>
                Email: <a href="mailto:contact@letatchebois.com">contact@letatchebois.com</a><br>
                Site web: <a href="https://letatchebois.com">https://letatchebois.com</a>
              </p>
              <div class="divider" style="margin: 20px 60px;"></div>
              <p class="text-muted">© 2025 LE TATCHE BOIS — Tous droits réservés</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

// ═══════════════════════════════════════════════════════════
// Contact Message Templates
// ═══════════════════════════════════════════════════════════

interface MessageData {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  content: string;
  locale: string;
  createdAt: Date;
}

export const getAdminMessageNotificationEmail = (message: MessageData) => {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(message.createdAt);

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Modern professional email template with wood-themed design
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(74,37,17,0.1);">

          <!-- HEADER with wood brown gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#5C2E00 0%,#8B4513 50%,#6B3A1F 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#F5E6C8;font-size:28px;font-weight:bold;letter-spacing:2px;">
                LE TATCHE BOIS
              </h1>
              <p style="margin:6px 0 0;color:#D4A843;font-size:13px;letter-spacing:1px;">
                Artisanat du bois marocain
              </p>
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0;color:#4A2511;font-size:20px;font-weight:bold;">
                📩 Nouveau message de contact
              </h2>
              <p style="margin:8px 0 0;color:#888;font-size:13px;">
                Reçu le ${formattedDate}
              </p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:16px 40px;">
              <hr style="border:none;height:2px;background:linear-gradient(to right,#C4973B,#F5E6C8,#C4973B);" />
            </td>
          </tr>

          <!-- SENDER INFO CARD -->
          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF9F0;border-radius:12px;border:1px solid #F5E6C8;">
                <tr>
                  <td style="padding:20px 24px;">
                    <!-- Name -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="100" style="color:#8B6914;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;padding-top:2px;">
                          Expéditeur
                        </td>
                        <td style="color:#4A2511;font-size:15px;font-weight:bold;">
                          ${message.name}
                        </td>
                      </tr>
                    </table>
                    <!-- Email -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="100" style="color:#8B6914;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;padding-top:2px;">
                          Email
                        </td>
                        <td>
                          <a href="mailto:${message.email}" style="color:#C4973B;font-size:14px;text-decoration:none;">
                            ${message.email}
                          </a>
                        </td>
                      </tr>
                    </table>
                    ${message.phone ? `
                    <!-- Phone -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="100" style="color:#8B6914;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;padding-top:2px;">
                          Téléphone
                        </td>
                        <td>
                          <a href="tel:${message.phone}" style="color:#4A2511;font-size:14px;text-decoration:none;">
                            ${message.phone}
                          </a>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                    <!-- Subject -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="100" style="color:#8B6914;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;padding-top:2px;">
                          Sujet
                        </td>
                        <td style="color:#4A2511;font-size:14px;font-weight:600;">
                          ${message.subject || '(Sans objet)'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MESSAGE SECTION -->
          <tr>
            <td style="padding:20px 40px 0;">
              <p style="margin:0 0 10px;color:#8B6914;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">
                Message
              </p>
              <div style="background-color:#FAFAF5;border-radius:12px;border:1px solid #E8E0D0;padding:20px 24px;">
                <p style="margin:0;color:#333;font-size:15px;line-height:1.7;white-space:pre-wrap;">
${message.content}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="padding:24px 40px;" align="center">
              <a href="https://letatchebois.com/fr/admin/messages"
                 style="display:inline-block;background:linear-gradient(135deg,#C4973B,#8B6914);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:14px;font-weight:bold;letter-spacing:0.5px;">
                Voir dans le tableau de bord →
              </a>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#4A2511;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#D4A843;font-size:14px;font-weight:bold;letter-spacing:1px;">
                LE TATCHE BOIS
              </p>
              <p style="margin:0 0 8px;color:#C4973B;font-size:11px;">
                Menuiserie Artisanat - Décoration
              </p>
              <p style="margin:0;color:#A0896B;font-size:11px;">
                Tanger, Maroc
              </p>
              <p style="margin:4px 0 0;color:#A0896B;font-size:11px;">
                contact@letatchebois.com · www.letatchebois.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const getVisitorConfirmationEmail = (message: MessageData) => {
  const translations = {
    fr: {
      greeting: `Bonjour ${message.name},`,
      thanks: "Merci pour votre message !",
      received: "Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.",
      yourMessage: "Votre message",
      subject: "Sujet",
      message: "Message",
      contact: "Vous pouvez également nous contacter",
      phone: "Téléphone / WhatsApp",
      email: "Email",
      regards: "Cordialement,",
      team: "L'équipe LE TATCHE BOIS",
    },
    en: {
      greeting: `Hello ${message.name},`,
      thanks: "Thank you for your message!",
      received: "We have received your message and will respond as soon as possible.",
      yourMessage: "Your message",
      subject: "Subject",
      message: "Message",
      contact: "You can also contact us",
      phone: "Phone / WhatsApp",
      email: "Email",
      regards: "Best regards,",
      team: "The LE TATCHE BOIS Team",
    },
    es: {
      greeting: `Hola ${message.name},`,
      thanks: "¡Gracias por su mensaje!",
      received: "Hemos recibido su mensaje y le responderemos lo antes posible.",
      yourMessage: "Su mensaje",
      subject: "Asunto",
      message: "Mensaje",
      contact: "También puede contactarnos",
      phone: "Teléfono / WhatsApp",
      email: "Email",
      regards: "Atentamente,",
      team: "El equipo de LE TATCHE BOIS",
    },
    ar: {
      greeting: `مرحباً ${message.name}،`,
      thanks: "شكراً لرسالتك!",
      received: "لقد تلقينا رسالتك وسنرد عليك في أقرب وقت ممكن.",
      yourMessage: "رسالتك",
      subject: "الموضوع",
      message: "الرسالة",
      contact: "يمكنك أيضاً الاتصال بنا",
      phone: "الهاتف / واتساب",
      email: "البريد الإلكتروني",
      regards: "مع أطيب التحيات،",
      team: "فريق LE TATCHE BOIS",
    },
  };

  const t = translations[message.locale as keyof typeof translations] || translations.fr;

  const content = `
    <p>${t.greeting}</p>
    <h2 style="color: #8B4513;">✓ ${t.thanks}</h2>
    <p>${t.received}</p>

    <div class="divider"></div>

    <h3>${t.yourMessage}</h3>
    <div class="info-box">
      ${message.subject ? `<p><strong>${t.subject}:</strong> ${message.subject}</p>` : ''}
      <p><strong>${t.message}:</strong></p>
      <p style="white-space: pre-wrap;">${message.content}</p>
    </div>

    <div class="divider"></div>

    <h3>${t.contact}</h3>
    <p>
      <strong>${t.phone}:</strong> <a href="tel:+212661196464">+212 661 19 64 64</a><br>
      <strong>${t.email}:</strong> <a href="mailto:contact@letatchebois.com">contact@letatchebois.com</a>
    </p>

    <div class="divider"></div>

    <p>${t.regards}</p>
    <p><strong>${t.team}</strong></p>
  `;

  return BASE_TEMPLATE(content, message.locale);
};

// ═══════════════════════════════════════════════════════════
// Order Templates
// ═══════════════════════════════════════════════════════════

interface OrderData {
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

export const getAdminOrderNotificationEmail = (order: OrderData) => {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(order.createdAt);

  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${item.price.toFixed(2)} DH</td>
      <td style="text-align: right;">${(item.quantity * item.price).toFixed(2)} DH</td>
    </tr>
  `).join('');

  const content = `
    <h2>🛒 Nouvelle commande ${order.orderNumber}</h2>
    <p><strong>Montant total: ${order.total.toFixed(2)} DH</strong></p>

    <div class="info-box">
      <h3>Client</h3>
      <p><strong>Nom:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>
      ${order.customerPhone ? `<p><strong>Téléphone:</strong> <a href="tel:${order.customerPhone}">${order.customerPhone}</a></p>` : ''}
    </div>

    <h3>Articles commandés</h3>
    <table>
      <thead>
        <tr>
          <th>Produit</th>
          <th style="text-align: center;">Qté</th>
          <th style="text-align: right;">Prix unit.</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="border-top: 2px solid #8B4513;">
          <td colspan="3" style="text-align: right;"><strong>Sous-total:</strong></td>
          <td style="text-align: right;"><strong>${order.subtotal.toFixed(2)} DH</strong></td>
        </tr>
        <tr>
          <td colspan="3" style="text-align: right;">Livraison:</td>
          <td style="text-align: right;">${order.shipping.toFixed(2)} DH</td>
        </tr>
        <tr style="border-top: 2px solid #8B4513;">
          <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
          <td class="order-total" style="text-align: right;">${order.total.toFixed(2)} DH</td>
        </tr>
      </tbody>
    </table>

    <h3>Paiement</h3>
    <p><strong>${order.paymentMethod}</strong></p>

    <h3>Adresse de livraison</h3>
    <p style="white-space: pre-wrap;">${order.shippingAddress}</p>

    <div class="divider"></div>

    <center>
      <a href="https://letatchebois.com/fr/admin/commandes" class="button">
        Gérer la commande →
      </a>
    </center>

    <p class="text-muted" style="margin-top: 30px;">Commande reçue le ${formattedDate}</p>
  `;

  return BASE_TEMPLATE(content, 'fr');
};

export const getCustomerOrderConfirmationEmail = (order: OrderData) => {
  const translations = {
    fr: {
      greeting: `Bonjour ${order.customerName},`,
      thanks: "Merci pour votre commande !",
      confirmed: "Votre commande a été confirmée et sera traitée dans les plus brefs délais.",
      orderNumber: "Numéro de commande",
      orderDetails: "Détails de la commande",
      product: "Produit",
      quantity: "Qté",
      unitPrice: "Prix unit.",
      total: "Total",
      subtotal: "Sous-total",
      shipping: "Livraison",
      payment: "Paiement",
      shippingAddress: "Adresse de livraison",
      estimatedDelivery: "Délai de livraison estimé: 3-5 jours ouvrables",
      trackOrder: "Suivre ma commande",
      questions: "Des questions?",
      contactUs: "Contactez-nous au",
      regards: "Cordialement,",
      team: "L'équipe LE TATCHE BOIS",
    },
    en: {
      greeting: `Hello ${order.customerName},`,
      thanks: "Thank you for your order!",
      confirmed: "Your order has been confirmed and will be processed shortly.",
      orderNumber: "Order number",
      orderDetails: "Order details",
      product: "Product",
      quantity: "Qty",
      unitPrice: "Unit price",
      total: "Total",
      subtotal: "Subtotal",
      shipping: "Shipping",
      payment: "Payment",
      shippingAddress: "Shipping address",
      estimatedDelivery: "Estimated delivery: 3-5 business days",
      trackOrder: "Track my order",
      questions: "Questions?",
      contactUs: "Contact us at",
      regards: "Best regards,",
      team: "The LE TATCHE BOIS Team",
    },
    es: {
      greeting: `Hola ${order.customerName},`,
      thanks: "¡Gracias por su pedido!",
      confirmed: "Su pedido ha sido confirmado y será procesado en breve.",
      orderNumber: "Número de pedido",
      orderDetails: "Detalles del pedido",
      product: "Producto",
      quantity: "Cant.",
      unitPrice: "Precio unit.",
      total: "Total",
      subtotal: "Subtotal",
      shipping: "Envío",
      payment: "Pago",
      shippingAddress: "Dirección de envío",
      estimatedDelivery: "Entrega estimada: 3-5 días laborables",
      trackOrder: "Seguir mi pedido",
      questions: "¿Preguntas?",
      contactUs: "Contáctenos en",
      regards: "Atentamente,",
      team: "El equipo de LE TATCHE BOIS",
    },
    ar: {
      greeting: `مرحباً ${order.customerName}،`,
      thanks: "شكراً لطلبك!",
      confirmed: "تم تأكيد طلبك وسيتم معالجته قريباً.",
      orderNumber: "رقم الطلب",
      orderDetails: "تفاصيل الطلب",
      product: "المنتج",
      quantity: "الكمية",
      unitPrice: "السعر",
      total: "المجموع",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      payment: "الدفع",
      shippingAddress: "عنوان الشحن",
      estimatedDelivery: "التوصيل المتوقع: 3-5 أيام عمل",
      trackOrder: "تتبع طلبي",
      questions: "أسئلة؟",
      contactUs: "اتصل بنا على",
      regards: "مع أطيب التحيات،",
      team: "فريق LE TATCHE BOIS",
    },
  };

  const t = translations[order.locale as keyof typeof translations] || translations.fr;
  const isRTL = order.locale === 'ar';

  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: ${isRTL ? 'left' : 'right'};">${item.price.toFixed(2)} DH</td>
      <td style="text-align: ${isRTL ? 'left' : 'right'};">${(item.quantity * item.price).toFixed(2)} DH</td>
    </tr>
  `).join('');

  const content = `
    <p>${t.greeting}</p>
    <h2 style="color: #8B4513;">✓ ${t.thanks}</h2>
    <p>${t.confirmed}</p>

    <div class="info-box">
      <p><strong>${t.orderNumber}:</strong> ${order.orderNumber}</p>
    </div>

    <h3>${t.orderDetails}</h3>
    <table>
      <thead>
        <tr>
          <th>${t.product}</th>
          <th style="text-align: center;">${t.quantity}</th>
          <th style="text-align: ${isRTL ? 'left' : 'right'};">${t.unitPrice}</th>
          <th style="text-align: ${isRTL ? 'left' : 'right'};">${t.total}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="border-top: 2px solid #8B4513;">
          <td colspan="3" style="text-align: ${isRTL ? 'left' : 'right'};"><strong>${t.subtotal}:</strong></td>
          <td style="text-align: ${isRTL ? 'left' : 'right'};"><strong>${order.subtotal.toFixed(2)} DH</strong></td>
        </tr>
        <tr>
          <td colspan="3" style="text-align: ${isRTL ? 'left' : 'right'};">${t.shipping}:</td>
          <td style="text-align: ${isRTL ? 'left' : 'right'};">${order.shipping.toFixed(2)} DH</td>
        </tr>
        <tr style="border-top: 2px solid #8B4513;">
          <td colspan="3" style="text-align: ${isRTL ? 'left' : 'right'};"><strong>${t.total}:</strong></td>
          <td class="order-total" style="text-align: ${isRTL ? 'left' : 'right'};">${order.total.toFixed(2)} DH</td>
        </tr>
      </tbody>
    </table>

    <div class="info-box">
      <p><strong>${t.payment}:</strong> ${order.paymentMethod}</p>
      <p><strong>${t.shippingAddress}:</strong></p>
      <p style="white-space: pre-wrap;">${order.shippingAddress}</p>
    </div>

    <p><em>${t.estimatedDelivery}</em></p>

    <div class="divider"></div>

    <center>
      <a href="https://letatchebois.com/${order.locale}/commande/${order.orderNumber}" class="button">
        ${t.trackOrder} →
      </a>
    </center>

    <div class="divider"></div>

    <p>${t.questions} ${t.contactUs} <a href="tel:+212661196464">+212 661 19 64 64</a></p>

    <p>${t.regards}</p>
    <p><strong>${t.team}</strong></p>
  `;

  return BASE_TEMPLATE(content, order.locale);
};

// ═══════════════════════════════════════════════════════════
// Quote Request Templates
// ═══════════════════════════════════════════════════════════

interface QuoteData {
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

export const getAdminQuoteNotificationEmail = (quote: QuoteData) => {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(quote.createdAt);

  const content = `
    <h2>📋 Nouvelle demande de devis ${quote.quoteNumber}</h2>
    <p><strong>Service:</strong> ${quote.service}</p>

    <div class="info-box">
      <h3>Client</h3>
      <p><strong>Nom:</strong> ${quote.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${quote.customerEmail}">${quote.customerEmail}</a></p>
      ${quote.customerPhone ? `<p><strong>Téléphone:</strong> <a href="tel:${quote.customerPhone}">${quote.customerPhone}</a></p>` : ''}
    </div>

    <h3>Détails de la demande</h3>
    <p style="white-space: pre-wrap;">${quote.description}</p>

    ${quote.dimensions ? `
    <p><strong>Dimensions:</strong> ${quote.dimensions}</p>
    ` : ''}

    ${quote.budget ? `
    <p><strong>Budget estimé:</strong> ${quote.budget}</p>
    ` : ''}

    ${quote.deadline ? `
    <p><strong>Délai souhaité:</strong> ${quote.deadline}</p>
    ` : ''}

    <div class="divider"></div>

    <center>
      <a href="https://letatchebois.com/fr/admin/devis" class="button">
        Voir le devis →
      </a>
    </center>

    <p class="text-muted" style="margin-top: 30px;">Demande reçue le ${formattedDate}</p>
  `;

  return BASE_TEMPLATE(content, 'fr');
};

export const getCustomerQuoteConfirmationEmail = (quote: QuoteData) => {
  const translations = {
    fr: {
      greeting: `Bonjour ${quote.customerName},`,
      thanks: "Merci pour votre demande de devis !",
      received: "Nous avons bien reçu votre demande et nous vous recontacterons dans les 24-48 heures.",
      quoteNumber: "Numéro de référence",
      service: "Service demandé",
      yourRequest: "Votre demande",
      description: "Description",
      dimensions: "Dimensions",
      budget: "Budget estimé",
      deadline: "Délai souhaité",
      nextSteps: "Prochaines étapes",
      step1: "Notre équipe va étudier votre demande",
      step2: "Nous vous contacterons pour discuter des détails",
      step3: "Vous recevrez un devis personnalisé",
      questions: "Des questions?",
      contactUs: "Contactez-nous au",
      regards: "Cordialement,",
      team: "L'équipe LE TATCHE BOIS",
    },
    en: {
      greeting: `Hello ${quote.customerName},`,
      thanks: "Thank you for your quote request!",
      received: "We have received your request and will contact you within 24-48 hours.",
      quoteNumber: "Reference number",
      service: "Requested service",
      yourRequest: "Your request",
      description: "Description",
      dimensions: "Dimensions",
      budget: "Estimated budget",
      deadline: "Desired deadline",
      nextSteps: "Next steps",
      step1: "Our team will review your request",
      step2: "We will contact you to discuss the details",
      step3: "You will receive a personalized quote",
      questions: "Questions?",
      contactUs: "Contact us at",
      regards: "Best regards,",
      team: "The LE TATCHE BOIS Team",
    },
    es: {
      greeting: `Hola ${quote.customerName},`,
      thanks: "¡Gracias por su solicitud de presupuesto!",
      received: "Hemos recibido su solicitud y nos pondremos en contacto en 24-48 horas.",
      quoteNumber: "Número de referencia",
      service: "Servicio solicitado",
      yourRequest: "Su solicitud",
      description: "Descripción",
      dimensions: "Dimensiones",
      budget: "Presupuesto estimado",
      deadline: "Plazo deseado",
      nextSteps: "Próximos pasos",
      step1: "Nuestro equipo revisará su solicitud",
      step2: "Nos pondremos en contacto para discutir los detalles",
      step3: "Recibirá un presupuesto personalizado",
      questions: "¿Preguntas?",
      contactUs: "Contáctenos en",
      regards: "Atentamente,",
      team: "El equipo de LE TATCHE BOIS",
    },
    ar: {
      greeting: `مرحباً ${quote.customerName}،`,
      thanks: "شكراً لطلب عرض السعر!",
      received: "لقد تلقينا طلبك وسنتواصل معك خلال 24-48 ساعة.",
      quoteNumber: "الرقم المرجعي",
      service: "الخدمة المطلوبة",
      yourRequest: "طلبك",
      description: "الوصف",
      dimensions: "الأبعاد",
      budget: "الميزانية المقدرة",
      deadline: "الموعد المطلوب",
      nextSteps: "الخطوات التالية",
      step1: "سيقوم فريقنا بمراجعة طلبك",
      step2: "سنتواصل معك لمناقشة التفاصيل",
      step3: "ستتلقى عرض سعر مخصص",
      questions: "أسئلة؟",
      contactUs: "اتصل بنا على",
      regards: "مع أطيب التحيات،",
      team: "فريق LE TATCHE BOIS",
    },
  };

  const t = translations[quote.locale as keyof typeof translations] || translations.fr;

  const content = `
    <p>${t.greeting}</p>
    <h2 style="color: #8B4513;">✓ ${t.thanks}</h2>
    <p>${t.received}</p>

    <div class="info-box">
      <p><strong>${t.quoteNumber}:</strong> ${quote.quoteNumber}</p>
      <p><strong>${t.service}:</strong> ${quote.service}</p>
    </div>

    <h3>${t.yourRequest}</h3>
    <p><strong>${t.description}:</strong></p>
    <p style="white-space: pre-wrap;">${quote.description}</p>

    ${quote.dimensions ? `<p><strong>${t.dimensions}:</strong> ${quote.dimensions}</p>` : ''}
    ${quote.budget ? `<p><strong>${t.budget}:</strong> ${quote.budget}</p>` : ''}
    ${quote.deadline ? `<p><strong>${t.deadline}:</strong> ${quote.deadline}</p>` : ''}

    <div class="divider"></div>

    <h3>${t.nextSteps}</h3>
    <ul>
      <li>${t.step1}</li>
      <li>${t.step2}</li>
      <li>${t.step3}</li>
    </ul>

    <div class="divider"></div>

    <p>${t.questions} ${t.contactUs} <a href="tel:+212661196464">+212 661 19 64 64</a></p>

    <p>${t.regards}</p>
    <p><strong>${t.team}</strong></p>
  `;

  return BASE_TEMPLATE(content, quote.locale);
};

// ═══════════════════════════════════════════════════════════
// Order Status Update Templates
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// Admin Reply Template
// ═══════════════════════════════════════════════════════════

export const getAdminReplyEmail = (
  originalMessage: MessageData,
  replyContent: string,
  adminName: string
) => {
  const translations = {
    fr: {
      greeting: `Bonjour ${originalMessage.name},`,
      originalMessage: "Votre message original",
      regards: "Cordialement,",
      team: "LE TATCHE BOIS",
    },
    en: {
      greeting: `Hello ${originalMessage.name},`,
      originalMessage: "Your original message",
      regards: "Best regards,",
      team: "LE TATCHE BOIS",
    },
    es: {
      greeting: `Hola ${originalMessage.name},`,
      originalMessage: "Su mensaje original",
      regards: "Atentamente,",
      team: "LE TATCHE BOIS",
    },
    ar: {
      greeting: `مرحباً ${originalMessage.name}،`,
      originalMessage: "رسالتك الأصلية",
      regards: "مع أطيب التحيات،",
      team: "LE TATCHE BOIS",
    },
  };

  const t = translations[originalMessage.locale as keyof typeof translations] || translations.fr;

  const content = `
    <p>${t.greeting}</p>

    <div style="background-color: #FFF8DC; border-left: 4px solid #C9A227; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="white-space: pre-wrap; color: #333; line-height: 1.6; margin: 0;">
${replyContent}
      </p>
    </div>

    <div class="divider"></div>

    <h3>${t.originalMessage}</h3>
    <div class="info-box">
      ${originalMessage.subject ? `<p><strong>Sujet:</strong> ${originalMessage.subject}</p>` : ''}
      <p style="white-space: pre-wrap;">${originalMessage.content}</p>
    </div>

    <div class="divider"></div>

    <center>
      <a href="https://letatchebois.com/contact" class="button">
        Nous contacter →
      </a>
    </center>

    <div class="divider"></div>

    <p>${t.regards}</p>
    <p><strong>${adminName}</strong><br>
    <span style="color: #999; font-size: 13px;">${t.team}</span></p>
  `;

  return BASE_TEMPLATE(content, originalMessage.locale);
};

// ═══════════════════════════════════════════════════════════
// Order Status Update Templates
// ═══════════════════════════════════════════════════════════

export const getOrderStatusUpdateEmail = (
  order: OrderData,
  status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED',
  trackingNumber?: string
) => {
  const translations = {
    fr: {
      greeting: `Bonjour ${order.customerName},`,
      confirmed: {
        title: `Commande ${order.orderNumber} confirmée`,
        message: "Votre commande a été confirmée et est en cours de préparation.",
      },
      shipped: {
        title: `Commande ${order.orderNumber} expédiée`,
        message: "Votre commande a été expédiée !",
        tracking: "Numéro de suivi",
      },
      delivered: {
        title: `Commande ${order.orderNumber} livrée`,
        message: "Votre commande a été livrée. Nous espérons que vous en êtes satisfait !",
        feedback: "N'hésitez pas à nous faire part de votre avis.",
      },
      orderNumber: "Numéro de commande",
      trackOrder: "Suivre ma commande",
      contactUs: "Contactez-nous",
      regards: "Cordialement,",
      team: "L'équipe LE TATCHE BOIS",
    },
    en: {
      greeting: `Hello ${order.customerName},`,
      confirmed: {
        title: `Order ${order.orderNumber} confirmed`,
        message: "Your order has been confirmed and is being prepared.",
      },
      shipped: {
        title: `Order ${order.orderNumber} shipped`,
        message: "Your order has been shipped!",
        tracking: "Tracking number",
      },
      delivered: {
        title: `Order ${order.orderNumber} delivered`,
        message: "Your order has been delivered. We hope you are satisfied!",
        feedback: "Feel free to share your feedback with us.",
      },
      orderNumber: "Order number",
      trackOrder: "Track my order",
      contactUs: "Contact us",
      regards: "Best regards,",
      team: "The LE TATCHE BOIS Team",
    },
    es: {
      greeting: `Hola ${order.customerName},`,
      confirmed: {
        title: `Pedido ${order.orderNumber} confirmado`,
        message: "Su pedido ha sido confirmado y está siendo preparado.",
      },
      shipped: {
        title: `Pedido ${order.orderNumber} enviado`,
        message: "¡Su pedido ha sido enviado!",
        tracking: "Número de seguimiento",
      },
      delivered: {
        title: `Pedido ${order.orderNumber} entregado`,
        message: "Su pedido ha sido entregado. ¡Esperamos que esté satisfecho!",
        feedback: "No dude en compartir su opinión con nosotros.",
      },
      orderNumber: "Número de pedido",
      trackOrder: "Seguir mi pedido",
      contactUs: "Contáctenos",
      regards: "Atentamente,",
      team: "El equipo de LE TATCHE BOIS",
    },
    ar: {
      greeting: `مرحباً ${order.customerName}،`,
      confirmed: {
        title: `تم تأكيد الطلب ${order.orderNumber}`,
        message: "تم تأكيد طلبك وهو قيد التحضير.",
      },
      shipped: {
        title: `تم شحن الطلب ${order.orderNumber}`,
        message: "تم شحن طلبك!",
        tracking: "رقم التتبع",
      },
      delivered: {
        title: `تم توصيل الطلب ${order.orderNumber}`,
        message: "تم توصيل طلبك. نأمل أن تكون راضياً!",
        feedback: "لا تتردد في مشاركة رأيك معنا.",
      },
      orderNumber: "رقم الطلب",
      trackOrder: "تتبع طلبي",
      contactUs: "اتصل بنا",
      regards: "مع أطيب التحيات،",
      team: "فريق LE TATCHE BOIS",
    },
  };

  const t = translations[order.locale as keyof typeof translations] || translations.fr;
  const statusContent = t[status.toLowerCase() as keyof typeof t] as { title: string; message: string; tracking?: string; feedback?: string };

  const content = `
    <p>${t.greeting}</p>
    <h2 style="color: #8B4513;">${statusContent.title}</h2>
    <p>${statusContent.message}</p>

    <div class="info-box">
      <p><strong>${t.orderNumber}:</strong> ${order.orderNumber}</p>
      ${status === 'SHIPPED' && trackingNumber ? `<p><strong>${statusContent.tracking}:</strong> ${trackingNumber}</p>` : ''}
    </div>

    ${status === 'DELIVERED' && statusContent.feedback ? `
    <p>${statusContent.feedback}</p>
    ` : ''}

    <div class="divider"></div>

    <center>
      <a href="https://letatchebois.com/${order.locale}/commande/${order.orderNumber}" class="button">
        ${t.trackOrder} →
      </a>
    </center>

    <div class="divider"></div>

    <p>${t.contactUs}: <a href="tel:+212661196464">+212 661 19 64 64</a></p>

    <p>${t.regards}</p>
    <p><strong>${t.team}</strong></p>
  `;

  return BASE_TEMPLATE(content, order.locale);
};
