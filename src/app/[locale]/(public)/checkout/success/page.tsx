"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { CheckCircle, ArrowRight, ArrowLeft, Home, ShoppingBag, Phone, Mail, MessageCircle } from "lucide-react";
import { CONTACT, getPhoneLink, getEmailLink, getWhatsAppLink } from "@/config/contact";
import { useThemeSettings } from "@/stores/themeSettings";

export default function CheckoutSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const theme = useThemeSettings();
  const successSection = theme.boutiqueSuccess;

  const successBgStyle: React.CSSProperties = successSection.type === "color"
    ? { backgroundColor: successSection.color }
    : successSection.type === "image" && successSection.image
      ? { backgroundImage: `url(${successSection.image})`, backgroundSize: "cover", backgroundPosition: "center" }
      : {};

  // Get order ID from URL - support both "orderId" and "order" params
  const orderId = searchParams.get("orderId") ?? searchParams.get("order") ?? "N/A";
  const paymentMethod = searchParams.get("payment") ?? "cod";

  const t = {
    title: isRTL ? "شكراً لطلبك!" : locale === "es" ? "¡Gracias por tu pedido!" : locale === "en" ? "Thank you for your order!" : "Merci pour votre commande !",
    subtitle: isRTL ? "تم استلام طلبك بنجاح" : locale === "es" ? "Su pedido ha sido recibido" : locale === "en" ? "Your order has been received" : "Votre commande a bien été reçue",
    orderNumber: isRTL ? "رقم الطلب" : locale === "es" ? "Número de pedido" : locale === "en" ? "Order number" : "Numéro de commande",
    whatNext: isRTL ? "ماذا بعد؟" : locale === "es" ? "¿Qué sigue?" : locale === "en" ? "What's next?" : "Et maintenant ?",
    step1: isRTL ? "ستتلقى رسالة تأكيد بالبريد الإلكتروني" : locale === "es" ? "Recibirá un correo de confirmación" : locale === "en" ? "You will receive a confirmation email" : "Vous recevrez un email de confirmation",
    step2: isRTL ? "سنقوم بتجهيز طلبك" : locale === "es" ? "Prepararemos su pedido" : locale === "en" ? "We will prepare your order" : "Nous préparerons votre commande",
    step3: isRTL ? "سيتم التوصيل خلال 3-7 أيام عمل" : locale === "es" ? "Entrega en 3-7 días hábiles" : locale === "en" ? "Delivery within 3-7 business days" : "Livraison sous 3-7 jours ouvrés",
    continueShopping: isRTL ? "متابعة التسوق" : locale === "es" ? "Seguir comprando" : locale === "en" ? "Continue shopping" : "Continuer vos achats",
    backHome: isRTL ? "العودة للرئيسية" : locale === "es" ? "Volver al inicio" : locale === "en" ? "Back to home" : "Retour à l'accueil",
    needHelp: isRTL ? "تحتاج مساعدة؟" : locale === "es" ? "¿Necesita ayuda?" : locale === "en" ? "Need help?" : "Besoin d'aide ?",
    contactUs: isRTL ? "تواصل معنا" : locale === "es" ? "Contáctenos" : locale === "en" ? "Contact us" : "Contactez-nous",
    paidByCard: isRTL ? "تم الدفع بالبطاقة" : locale === "es" ? "Pagado con tarjeta" : locale === "en" ? "Paid by card" : "Payé par carte",
    payOnDelivery: isRTL ? "الدفع عند الاستلام" : locale === "es" ? "Pago contra reembolso" : locale === "en" ? "Cash on delivery" : "Paiement à la livraison",
    emailSent: isRTL ? "تم إرسال بريد إلكتروني للتأكيد" : locale === "es" ? "Se ha enviado un correo de confirmación" : locale === "en" ? "A confirmation email has been sent" : "Un email de confirmation a été envoyé",
  };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <main className="min-h-screen py-12 md:py-20" style={successBgStyle}>
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-wood-dark mb-3">
          {t.title}
        </h1>
        <p className="text-lg text-wood-muted mb-8">
          {t.subtitle}
        </p>

        {/* Order Number */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 mb-6">
          <p className="text-sm text-wood-muted mb-2">{t.orderNumber}</p>
          <p className="text-2xl md:text-3xl font-bold text-wood-primary font-mono tracking-wider">
            {orderId}
          </p>

          {/* Payment Status Badge */}
          <div className="mt-4">
            <span className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              paymentMethod === "stripe" || paymentMethod === "card"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            )}>
              {paymentMethod === "stripe" || paymentMethod === "card" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t.paidByCard}
                </>
              ) : (
                <>
                  <span>💵</span>
                  {t.payOnDelivery}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Email Confirmation Notice */}
        <div className="bg-blue-50 rounded-xl p-4 mb-10 flex items-center justify-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <p className="text-blue-700 text-sm">{t.emailSent}</p>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-10 text-left" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className={cn("text-lg font-semibold text-wood-dark mb-4", isRTL && "text-right")}>
            {t.whatNext}
          </h2>
          <div className="space-y-4">
            <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
              <div className="w-8 h-8 rounded-full bg-wood-cream flex items-center justify-center shrink-0">
                <span className="text-wood-primary font-bold">1</span>
              </div>
              <p className={cn("text-wood-muted pt-1", isRTL && "text-right")}>{t.step1}</p>
            </div>
            <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
              <div className="w-8 h-8 rounded-full bg-wood-cream flex items-center justify-center shrink-0">
                <span className="text-wood-primary font-bold">2</span>
              </div>
              <p className={cn("text-wood-muted pt-1", isRTL && "text-right")}>{t.step2}</p>
            </div>
            <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
              <div className="w-8 h-8 rounded-full bg-wood-cream flex items-center justify-center shrink-0">
                <span className="text-wood-primary font-bold">3</span>
              </div>
              <p className={cn("text-wood-muted pt-1", isRTL && "text-right")}>{t.step3}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={cn("flex flex-col sm:flex-row gap-4 justify-center", isRTL && "sm:flex-row-reverse")}>
          <Link
            href={`/${locale}/boutique`}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl",
              "bg-gradient-to-r from-wood-primary to-wood-secondary text-white font-medium",
              "hover:brightness-110 transition-all shadow-md",
              isRTL && "flex-row-reverse"
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            {t.continueShopping}
            <Arrow className="w-4 h-4" />
          </Link>

          <Link
            href={`/${locale}`}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl",
              "bg-wood-cream text-wood-dark font-medium",
              "hover:bg-wood-light transition-colors",
              isRTL && "flex-row-reverse"
            )}
          >
            <Home className="w-5 h-5" />
            {t.backHome}
          </Link>
        </div>

        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-wood-muted mb-4">{t.needHelp} {t.contactUs}:</p>
          <div className={cn("flex flex-wrap justify-center gap-4", isRTL && "flex-row-reverse")}>
            <a
              href={getPhoneLink()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-wood-dark hover:text-wood-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">{CONTACT.phone.display}</span>
            </a>
            <a
              href={getEmailLink()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-wood-dark hover:text-wood-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              {CONTACT.email.main}
            </a>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
