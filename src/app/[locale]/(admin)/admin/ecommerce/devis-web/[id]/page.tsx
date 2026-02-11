export const dynamic = 'force-dynamic';


import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  Paperclip,
  Send,
  CheckCircle,
  XCircle,
  ArrowRightCircle,
} from "lucide-react";
import { QuoteRequestActions } from "./QuoteRequestActions";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToQuotes: "Retour aux demandes",
    quoteDetails: "Details de la demande",
    receivedOn: "Recue le",
    customerInfo: "Informations client",
    projectDetails: "Details du projet",
    projectType: "Type de projet",
    description: "Description",
    budget: "Budget",
    timeline: "Delai souhaite",
    attachments: "Pieces jointes",
    noAttachments: "Aucune piece jointe",
    notes: "Notes",
    addNote: "Ajouter une note",
    internalNote: "Note interne",
    customerNote: "Note client visible",
    quoteResponse: "Reponse",
    quotedPrice: "Prix propose",
    validUntil: "Valide jusqu'au",
    response: "Message de reponse",
    items: "Articles demandes",
    noItems: "Aucun article specifie",
    convertToLead: "Convertir en prospect CRM",
    sendQuote: "Envoyer le devis",
    accept: "Marquer accepte",
    reject: "Marquer refuse",
    status: "Statut",
  },
  en: {
    backToQuotes: "Back to requests",
    quoteDetails: "Quote Request Details",
    receivedOn: "Received on",
    customerInfo: "Customer Information",
    projectDetails: "Project Details",
    projectType: "Project Type",
    description: "Description",
    budget: "Budget",
    timeline: "Desired Timeline",
    attachments: "Attachments",
    noAttachments: "No attachments",
    notes: "Notes",
    addNote: "Add Note",
    internalNote: "Internal Note",
    customerNote: "Customer-Visible Note",
    quoteResponse: "Response",
    quotedPrice: "Quoted Price",
    validUntil: "Valid Until",
    response: "Response Message",
    items: "Requested Items",
    noItems: "No items specified",
    convertToLead: "Convert to CRM Lead",
    sendQuote: "Send Quote",
    accept: "Mark Accepted",
    reject: "Mark Rejected",
    status: "Status",
  },
  es: {
    backToQuotes: "Volver a solicitudes",
    quoteDetails: "Detalles de la Solicitud",
    receivedOn: "Recibida el",
    customerInfo: "Informacion del Cliente",
    projectDetails: "Detalles del Proyecto",
    projectType: "Tipo de Proyecto",
    description: "Descripcion",
    budget: "Presupuesto",
    timeline: "Plazo Deseado",
    attachments: "Adjuntos",
    noAttachments: "Sin adjuntos",
    notes: "Notas",
    addNote: "Agregar Nota",
    internalNote: "Nota Interna",
    customerNote: "Nota Visible al Cliente",
    quoteResponse: "Respuesta",
    quotedPrice: "Precio Cotizado",
    validUntil: "Valido Hasta",
    response: "Mensaje de Respuesta",
    items: "Articulos Solicitados",
    noItems: "Sin articulos especificados",
    convertToLead: "Convertir en Lead CRM",
    sendQuote: "Enviar Cotizacion",
    accept: "Marcar Aceptado",
    reject: "Marcar Rechazado",
    status: "Estado",
  },
  ar: {
    backToQuotes: "العودة للطلبات",
    quoteDetails: "تفاصيل طلب العرض",
    receivedOn: "تم الاستلام في",
    customerInfo: "معلومات العميل",
    projectDetails: "تفاصيل المشروع",
    projectType: "نوع المشروع",
    description: "الوصف",
    budget: "الميزانية",
    timeline: "الجدول الزمني المطلوب",
    attachments: "المرفقات",
    noAttachments: "لا توجد مرفقات",
    notes: "الملاحظات",
    addNote: "إضافة ملاحظة",
    internalNote: "ملاحظة داخلية",
    customerNote: "ملاحظة مرئية للعميل",
    quoteResponse: "الرد",
    quotedPrice: "السعر المقترح",
    validUntil: "صالح حتى",
    response: "رسالة الرد",
    items: "العناصر المطلوبة",
    noItems: "لم يتم تحديد عناصر",
    convertToLead: "تحويل إلى عميل محتمل",
    sendQuote: "إرسال العرض",
    accept: "وضع علامة مقبول",
    reject: "وضع علامة مرفوض",
    status: "الحالة",
  },
};

// ═══════════════════════════════════════════════════════════
// Status Badge
// ═══════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<string, { label: Record<string, string>; color: string }> = {
  PENDING: {
    label: { fr: "En attente", en: "Pending", es: "Pendiente", ar: "قيد الانتظار" },
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  REVIEWING: {
    label: { fr: "En cours", en: "Reviewing", es: "Revisando", ar: "قيد المراجعة" },
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  QUOTED: {
    label: { fr: "Devis envoye", en: "Quoted", es: "Cotizado", ar: "تم التسعير" },
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  ACCEPTED: {
    label: { fr: "Accepte", en: "Accepted", es: "Aceptado", ar: "مقبول" },
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: { fr: "Refuse", en: "Rejected", es: "Rechazado", ar: "مرفوض" },
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  EXPIRED: {
    label: { fr: "Expire", en: "Expired", es: "Expirado", ar: "منتهي الصلاحية" },
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
  CONVERTED: {
    label: { fr: "Converti", en: "Converted", es: "Convertido", ar: "تم التحويل" },
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  },
};

// ═══════════════════════════════════════════════════════════
// Get Quote
// ═══════════════════════════════════════════════════════════

async function getQuote(id: string) {
  const quote = await prisma.ecomQuote.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              translations: true,
            },
          },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return quote;
}

// ═══════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function QuoteRequestDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const quote = await getQuote(id);

  if (!quote) {
    notFound();
  }

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusConfig = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.PENDING;
  const statusLabel = statusConfig.label[locale] ?? statusConfig.label.fr;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin/ecommerce/devis-web`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToQuotes}
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quote.quoteNumber}
            </h1>
            <span className={cn("rounded-full px-3 py-1 text-sm font-medium", statusConfig.color)}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {t.receivedOn} {formatDate(quote.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!quote.convertedToLeadId && (
            <Button variant="outline" size="sm">
              <ArrowRightCircle className="me-2 h-4 w-4" />
              {t.convertToLead}
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Send className="me-2 h-4 w-4" />
            {t.sendQuote}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Details */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <FileText className="h-5 w-5 text-amber-600" />
                {t.projectDetails}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {quote.projectType && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.projectType}</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">{quote.projectType}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{quote.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {quote.budget && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.budget}</p>
                    <p className="mt-1 flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      {quote.budget}
                    </p>
                  </div>
                )}
                {quote.timeline && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.timeline}</p>
                    <p className="mt-1 flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                      <Clock className="h-4 w-4 text-blue-600" />
                      {quote.timeline}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requested Items */}
          {quote.items.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-amber-600" />
                  {t.items}
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {quote.items.map((item) => {
                    const productName = item.product?.translations?.find(t => t.locale === locale)?.name
                      ?? item.product?.translations?.[0]?.name
                      ?? item.name;
                    return (
                      <li key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{productName}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                          {item.dimensions && (
                            <p className="text-sm text-gray-500">Dimensions: {item.dimensions}</p>
                          )}
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          x{item.quantity}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* Attachments */}
          {quote.attachments && quote.attachments.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <Paperclip className="h-5 w-5 text-amber-600" />
                  {t.attachments}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {quote.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <img
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                {t.notes}
              </h2>
            </div>
            <div className="p-6">
              {quote.notes.length > 0 ? (
                <ul className="space-y-4">
                  {quote.notes.map((note) => (
                    <li
                      key={note.id}
                      className={cn(
                        "rounded-lg border px-4 py-3",
                        note.isInternal
                          ? "border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
                          : "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                      )}
                    >
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          note.isInternal
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                        )}>
                          {note.isInternal ? t.internalNote : t.customerNote}
                        </span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{note.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">Aucune note</p>
              )}
            </div>
          </div>

          {/* Quote Response */}
          {(quote.quotedPrice || quote.response) && (
            <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
              <div className="border-b border-green-200 px-6 py-4 dark:border-green-700">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {t.quoteResponse}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {quote.quotedPrice && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.quotedPrice}</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {formatCurrency(Number(quote.quotedPrice))}
                    </p>
                  </div>
                )}
                {quote.validUntil && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.validUntil}</p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">
                      {formatDate(quote.validUntil)}
                    </p>
                  </div>
                )}
                {quote.response && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.response}</p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {quote.response}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <QuoteRequestActions
            quoteId={quote.id}
            currentStatus={quote.status}
            locale={locale}
          />

          {/* Customer Info */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-amber-600" />
                {t.customerInfo}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="font-medium text-gray-900 dark:text-white">{quote.customerName}</p>
              {quote.company && (
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building2 className="h-4 w-4" />
                  {quote.company}
                </p>
              )}
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${quote.customerEmail}`} className="text-amber-600 hover:underline">
                  {quote.customerEmail}
                </a>
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <a href={`tel:${quote.customerPhone}`} className="text-amber-600 hover:underline">
                  {quote.customerPhone}
                </a>
              </p>
              {(quote.city || quote.address) && (
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  {[quote.address, quote.city].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Calendar className="h-5 w-5 text-amber-600" />
                Informations
              </h2>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Source</span>
                <span className="font-medium text-gray-900 dark:text-white">{quote.source ?? "website"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Langue</span>
                <span className="font-medium text-gray-900 dark:text-white">{quote.locale.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Cree le</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(quote.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
              {quote.respondedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Repondu le</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(quote.respondedAt).toLocaleDateString(locale)}
                  </span>
                </div>
              )}
              {quote.convertedToLeadId && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Lead CRM</span>
                  <Link
                    href={`/${locale}/admin/crm/leads/${quote.convertedToLeadId}`}
                    className="font-medium text-amber-600 hover:underline"
                  >
                    Voir le lead
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const quote = await prisma.ecomQuote.findUnique({
    where: { id },
    select: { quoteNumber: true },
  });

  return {
    title: quote ? `Demande ${quote.quoteNumber}` : "Demande non trouvee",
  };
}
