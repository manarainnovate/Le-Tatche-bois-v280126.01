export const dynamic = 'force-dynamic';


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
  Paperclip,
  Download,
  FileText,
  FileImage,
  FileVideo,
  File,
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
    attachments: "Pieces jointes",
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
    attachments: "Attachments",
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
    attachments: "Archivos adjuntos",
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
    attachments: "المرفقات",
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
  attachments?: Array<{name: string; url: string; size: number; type: string}>;
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
    starred: message.starred,
    attachments: message.attachments as any,
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return FileImage;
    if (type.startsWith("video/")) return FileVideo;
    if (type.includes("pdf") || type.includes("document") || type.includes("text")) return FileText;
    return File;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin/messages`}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToInbox}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {message.subject ?? t.noSubject}
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {adjacentMessages.previousId ? (
            <Link href={`/${locale}/admin/messages/${adjacentMessages.previousId}`}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-amber-600 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.previous}
              </button>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
              {t.previous}
            </button>
          )}
          {adjacentMessages.nextId ? (
            <Link href={`/${locale}/admin/messages/${adjacentMessages.nextId}`}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-amber-600 dark:hover:bg-gray-700"
              >
                {t.next}
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-700"
            >
              {t.next}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Full Width with Horizontal Layout */}
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

          <div className="p-6 sm:p-8">
            {/* Sender Info - Horizontal Layout */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:from-amber-900/10 dark:to-orange-900/10 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-md dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t.name}
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">{message.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 dark:bg-gray-800/50">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    {message.email}
                  </a>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 dark:bg-gray-800/50">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                  {message.phone ? (
                    <a
                      href={`tel:${message.phone}`}
                      className="text-sm font-semibold text-gray-900 hover:text-amber-600 dark:text-white dark:hover:text-amber-400"
                    >
                      {message.phone}
                    </a>
                  ) : (
                    <p className="text-sm italic text-gray-400 dark:text-gray-600">{t.noPhone}</p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="whitespace-nowrap">{formatDate(message.createdAt)}</span>
              </div>
            </div>

            {/* Actions - Horizontal Layout ABOVE Content */}
            <div className="mb-6">
              <MessageActions
                messageId={message.id}
                isRead={message.read}
                isStarred={message.starred}
                customerEmail={message.email}
                customerName={message.name}
                originalSubject={message.subject}
                locale={locale}
              />
            </div>

            {/* Subject */}
            <div className="mb-6 rounded-xl bg-gray-50 p-5 dark:bg-gray-900/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t.subject}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {message.subject ?? t.noSubject}
              </p>
            </div>

            {/* Message Content */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {t.messageContent}
              </p>
              <div className="rounded-xl bg-gray-50 p-6 text-base leading-relaxed text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t.attachments} ({message.attachments.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {message.attachments.map((file, index) => {
                    const FileIcon = getFileIcon(file.type);
                    return (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-amber-600 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                            <FileIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Download className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                      </a>
                    );
                  })}
                </div>
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
  title: "Message Details",
};
