import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Wrench,
  FileText,
  Clock,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { QuoteStatusBadge, type QuoteStatus } from "@/components/admin/QuoteCard";
import { QuoteActions } from "./QuoteActions";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToQuotes: "Retour aux devis",
    quoteDetails: "Details du devis",
    customerInfo: "Informations client",
    name: "Nom",
    email: "Email",
    phone: "Telephone",
    city: "Ville",
    company: "Entreprise",
    serviceRequested: "Service demande",
    service: "Service",
    serviceType: "Type de service",
    projectDetails: "Details du projet",
    description: "Description",
    dimensions: "Dimensions",
    budget: "Budget",
    deadline: "Delai souhaite",
    attachments: "Pieces jointes",
    noAttachments: "Aucune piece jointe",
    internalNotes: "Notes internes",
    noNotes: "Aucune note",
    addNote: "Ajouter une note",
    timeline: "Historique",
    createdAt: "Cree le",
    updatedAt: "Modifie le",
    actions: "Actions",
    updateStatus: "Mettre a jour le statut",
    assignTo: "Assigner a",
    sendEmail: "Envoyer un email",
    deleteQuote: "Supprimer le devis",
    confirmDelete: "Etes-vous sur de vouloir supprimer ce devis ?",
  },
  en: {
    backToQuotes: "Back to quotes",
    quoteDetails: "Quote Details",
    customerInfo: "Customer Information",
    name: "Name",
    email: "Email",
    phone: "Phone",
    city: "City",
    company: "Company",
    serviceRequested: "Service Requested",
    service: "Service",
    serviceType: "Service type",
    projectDetails: "Project Details",
    description: "Description",
    dimensions: "Dimensions",
    budget: "Budget",
    deadline: "Deadline",
    attachments: "Attachments",
    noAttachments: "No attachments",
    internalNotes: "Internal Notes",
    noNotes: "No notes",
    addNote: "Add note",
    timeline: "Timeline",
    createdAt: "Created at",
    updatedAt: "Updated at",
    actions: "Actions",
    updateStatus: "Update status",
    assignTo: "Assign to",
    sendEmail: "Send email",
    deleteQuote: "Delete quote",
    confirmDelete: "Are you sure you want to delete this quote?",
  },
  es: {
    backToQuotes: "Volver a presupuestos",
    quoteDetails: "Detalles del presupuesto",
    customerInfo: "Informacion del cliente",
    name: "Nombre",
    email: "Email",
    phone: "Telefono",
    city: "Ciudad",
    company: "Empresa",
    serviceRequested: "Servicio solicitado",
    service: "Servicio",
    serviceType: "Tipo de servicio",
    projectDetails: "Detalles del proyecto",
    description: "Descripcion",
    dimensions: "Dimensiones",
    budget: "Presupuesto",
    deadline: "Fecha limite",
    attachments: "Adjuntos",
    noAttachments: "Sin adjuntos",
    internalNotes: "Notas internas",
    noNotes: "Sin notas",
    addNote: "Agregar nota",
    timeline: "Historial",
    createdAt: "Creado el",
    updatedAt: "Modificado el",
    actions: "Acciones",
    updateStatus: "Actualizar estado",
    assignTo: "Asignar a",
    sendEmail: "Enviar email",
    deleteQuote: "Eliminar presupuesto",
    confirmDelete: "Esta seguro de que desea eliminar este presupuesto?",
  },
  ar: {
    backToQuotes: "العودة لعروض الأسعار",
    quoteDetails: "تفاصيل عرض السعر",
    customerInfo: "معلومات العميل",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    city: "المدينة",
    company: "الشركة",
    serviceRequested: "الخدمة المطلوبة",
    service: "الخدمة",
    serviceType: "نوع الخدمة",
    projectDetails: "تفاصيل المشروع",
    description: "الوصف",
    dimensions: "الأبعاد",
    budget: "الميزانية",
    deadline: "الموعد النهائي",
    attachments: "المرفقات",
    noAttachments: "لا توجد مرفقات",
    internalNotes: "ملاحظات داخلية",
    noNotes: "لا توجد ملاحظات",
    addNote: "إضافة ملاحظة",
    timeline: "السجل",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التعديل",
    actions: "الإجراءات",
    updateStatus: "تحديث الحالة",
    assignTo: "تعيين إلى",
    sendEmail: "إرسال بريد",
    deleteQuote: "حذف عرض السعر",
    confirmDelete: "هل أنت متأكد من حذف عرض السعر هذا؟",
  },
};

// ═══════════════════════════════════════════════════════════
// Get Quote
// ═══════════════════════════════════════════════════════════

interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string | null;
  company: string | null;
  projectType: string | null;
  description: string;
  budget: string | null;
  timeline: string | null;
  attachments: string[];
  notes: { id: string; content: string; isInternal: boolean; createdById: string | null; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

async function getQuote(id: string): Promise<Quote | null> {
  const quote = await prisma.ecomQuote.findUnique({
    where: { id },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!quote) return null;

  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    status: quote.status as QuoteStatus,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    customerPhone: quote.customerPhone,
    city: quote.city,
    company: quote.company,
    projectType: quote.projectType,
    description: quote.description,
    budget: quote.budget,
    timeline: quote.timeline,
    attachments: quote.attachments,
    notes: quote.notes.map((n) => ({
      id: n.id,
      content: n.content,
      isInternal: n.isInternal,
      createdById: n.createdById,
      createdAt: n.createdAt,
    })),
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
  };
}

async function getTeamMembers() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MANAGER", "COMMERCIAL"] } },
    select: { id: true, name: true, email: true },
  });
}

// ═══════════════════════════════════════════════════════════
// Quote Detail Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [quote, teamMembers] = await Promise.all([getQuote(id), getTeamMembers()]);

  if (!quote) {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin/devis`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToQuotes}
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quote.quoteNumber}</h1>
            <QuoteStatusBadge status={quote.status} locale={locale} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <User className="h-5 w-5 text-amber-600" />
              {t.customerInfo}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t.name}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{quote.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t.email}</p>
                  <a
                    href={`mailto:${quote.customerEmail}`}
                    className="font-medium text-amber-600 hover:underline"
                  >
                    {quote.customerEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t.phone}</p>
                  <a
                    href={`tel:${quote.customerPhone}`}
                    className="font-medium text-gray-900 dark:text-white"
                  >
                    {quote.customerPhone}
                  </a>
                </div>
              </div>
              {quote.city && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t.city}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quote.city}</p>
                  </div>
                </div>
              )}
              {quote.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t.company}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {quote.company}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service Requested */}
          {quote.projectType && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Wrench className="h-5 w-5 text-amber-600" />
                {t.serviceRequested}
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">{t.serviceType}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{quote.projectType}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <FileText className="h-5 w-5 text-amber-600" />
              {t.projectDetails}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">{t.description}</p>
                <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                  {quote.description}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {quote.budget && (
                  <div>
                    <p className="text-xs text-gray-500">{t.budget}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quote.budget}</p>
                  </div>
                )}
                {quote.timeline && (
                  <div>
                    <p className="text-xs text-gray-500">{t.deadline}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{quote.timeline}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                {t.internalNotes}
              </h2>
            </div>
            {quote.notes.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">{t.noNotes}</p>
            ) : (
              <div className="space-y-4">
                {quote.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50"
                  >
                    <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                      {note.content}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatDate(note.createdAt)}</span>
                      {note.isInternal && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600">Internal</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <QuoteActions
            quoteId={quote.id}
            currentStatus={quote.status}
            currentAssignee={null}
            customerEmail={quote.customerEmail}
            teamMembers={teamMembers}
            locale={locale}
          />

          {/* Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-amber-600" />
              {t.timeline}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t.createdAt}</span>
                <span className="text-gray-900 dark:text-white">{formatDate(quote.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t.updatedAt}</span>
                <span className="text-gray-900 dark:text-white">{formatDate(quote.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Paperclip className="h-5 w-5 text-amber-600" />
              {t.attachments}
            </h2>
            {quote.attachments.length === 0 ? (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {t.noAttachments}
              </p>
            ) : (
              <div className="space-y-2">
                {quote.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="truncate text-sm">{attachment.split("/").pop()}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Quote Details",
};
