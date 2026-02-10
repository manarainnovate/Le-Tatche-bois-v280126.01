import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MessageActions } from "./MessageActions";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToInbox: "Retour a la boite de reception",
    from: "De",
    subject: "Sujet",
    received: "Recu le",
    senderDetails: "Informations de l'expediteur",
    name: "Nom",
    email: "Email",
    phone: "Telephone",
    noPhone: "Non renseigne",
    messageContent: "Message",
    actions: "Actions",
    markAsUnread: "Marquer comme non lu",
    star: "Ajouter aux favoris",
    unstar: "Retirer des favoris",
    reply: "Repondre",
    delete: "Supprimer",
    previous: "Precedent",
    next: "Suivant",
    noSubject: "(Sans objet)",
  },
  en: {
    backToInbox: "Back to inbox",
    from: "From",
    subject: "Subject",
    received: "Received on",
    senderDetails: "Sender Information",
    name: "Name",
    email: "Email",
    phone: "Phone",
    noPhone: "Not provided",
    messageContent: "Message",
    actions: "Actions",
    markAsUnread: "Mark as unread",
    star: "Star",
    unstar: "Unstar",
    reply: "Reply",
    delete: "Delete",
    previous: "Previous",
    next: "Next",
    noSubject: "(No subject)",
  },
  es: {
    backToInbox: "Volver a la bandeja",
    from: "De",
    subject: "Asunto",
    received: "Recibido el",
    senderDetails: "Informacion del remitente",
    name: "Nombre",
    email: "Email",
    phone: "Telefono",
    noPhone: "No proporcionado",
    messageContent: "Mensaje",
    actions: "Acciones",
    markAsUnread: "Marcar como no leido",
    star: "Destacar",
    unstar: "Quitar destacado",
    reply: "Responder",
    delete: "Eliminar",
    previous: "Anterior",
    next: "Siguiente",
    noSubject: "(Sin asunto)",
  },
  ar: {
    backToInbox: "العودة للبريد الوارد",
    from: "من",
    subject: "الموضوع",
    received: "استلم في",
    senderDetails: "معلومات المرسل",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    noPhone: "غير متوفر",
    messageContent: "الرسالة",
    actions: "الإجراءات",
    markAsUnread: "تحديد كغير مقروء",
    star: "إضافة للمفضلة",
    unstar: "إزالة من المفضلة",
    reply: "رد",
    delete: "حذف",
    previous: "السابق",
    next: "التالي",
    noSubject: "(بدون موضوع)",
  },
};

// ═══════════════════════════════════════════════════════════
// Get Message
// ═══════════════════════════════════════════════════════════

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  content: string;
  read: boolean;
  starred: boolean;
  createdAt: Date;
}

async function getMessage(id: string): Promise<Message | null> {
  const message = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) return null;

  // Mark as read
  if (!message.read) {
    await prisma.message.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  return {
    id: message.id,
    name: message.name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    content: message.content,
    read: true, // We just marked it as read
    starred: false, // Starred field doesn't exist in schema, default to false
    createdAt: message.createdAt,
  };
}

async function getAdjacentMessages(currentId: string) {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const currentIndex = messages.findIndex((m) => m.id === currentId);

  const prevMessage = currentIndex > 0 ? messages[currentIndex - 1] : undefined;
  const nextMessage = currentIndex < messages.length - 1 ? messages[currentIndex + 1] : undefined;

  return {
    previousId: prevMessage?.id ?? null,
    nextId: nextMessage?.id ?? null,
  };
}

// ═══════════════════════════════════════════════════════════
// Message Detail Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MessageDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [message, adjacentMessages] = await Promise.all([
    getMessage(id),
    getAdjacentMessages(id),
  ]);

  if (!message) {
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
            href={`/${locale}/admin/messages`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToInbox}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {message.subject ?? t.noSubject}
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {adjacentMessages.previousId ? (
            <Link href={`/${locale}/admin/messages/${adjacentMessages.previousId}`}>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.previous}
              </button>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-300 dark:border-gray-700 dark:text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.previous}
            </button>
          )}
          {adjacentMessages.nextId ? (
            <Link href={`/${locale}/admin/messages/${adjacentMessages.nextId}`}>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {t.next}
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-300 dark:border-gray-700 dark:text-gray-600"
            >
              {t.next}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Message Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{message.name}</h2>
                  <p className="text-sm text-gray-500">{message.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                {formatDate(message.createdAt)}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
              <p className="text-sm text-gray-500">{t.subject}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {message.subject ?? t.noSubject}
              </p>
            </div>

            {/* Message Content */}
            <div>
              <p className="text-sm text-gray-500">{t.messageContent}</p>
              <div className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                {message.content}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <MessageActions
            messageId={message.id}
            isRead={message.read}
            isStarred={message.starred}
            customerEmail={message.email}
            locale={locale}
          />

          {/* Sender Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <User className="h-5 w-5 text-amber-600" />
              {t.senderDetails}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t.name}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{message.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t.email}</p>
                  <a
                    href={`mailto:${message.email}`}
                    className="font-medium text-amber-600 hover:underline"
                  >
                    {message.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t.phone}</p>
                  {message.phone ? (
                    <a
                      href={`tel:${message.phone}`}
                      className="font-medium text-gray-900 dark:text-white"
                    >
                      {message.phone}
                    </a>
                  ) : (
                    <p className="text-gray-400">{t.noPhone}</p>
                  )}
                </div>
              </div>
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

export const metadata = {
  title: "Message Details",
};
