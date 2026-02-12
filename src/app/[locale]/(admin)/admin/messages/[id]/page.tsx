export const dynamic = 'force-dynamic';

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Mail,
  Phone,
  Star,
  Reply,
  MailOpen,
  Archive,
  Trash2,
  Download,
  FileText,
  FileImage,
  FileVideo,
  File,
  Paperclip,
} from "lucide-react";
import { MessageActions } from "./MessageActions";

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Fix attachment URLs for production Docker environment
 * Old attachments use /uploads/, new ones use /api/uploads/
 */
function getFileUrl(url: string): string {
  if (!url) return '';
  // Already using API route — good
  if (url.startsWith('/api/uploads/')) return url;
  // Old format — fix it
  if (url.startsWith('/uploads/')) return url.replace('/uploads/', '/api/uploads/');
  // HTTP/HTTPS URLs — return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path without leading slash
  if (!url.startsWith('/')) return '/api/uploads/' + url;
  return url;
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToInbox: "Retour a la boite de reception",
    subject: "Sujet",
    noSubject: "(Sans objet)",
    reply: "Répondre",
    markAsUnread: "Marquer comme non lu",
    star: "Favoris",
    unstar: "Retirer des favoris",
    archive: "Archiver",
    delete: "Supprimer",
    message: "Message",
    attachments: "Pièces jointes",
  },
  en: {
    backToInbox: "Back to inbox",
    subject: "Subject",
    noSubject: "(No subject)",
    reply: "Reply",
    markAsUnread: "Mark as unread",
    star: "Star",
    unstar: "Unstar",
    archive: "Archive",
    delete: "Delete",
    message: "Message",
    attachments: "Attachments",
  },
  es: {
    backToInbox: "Volver a la bandeja",
    subject: "Asunto",
    noSubject: "(Sin asunto)",
    reply: "Responder",
    markAsUnread: "Marcar como no leído",
    star: "Destacar",
    unstar: "Quitar destacado",
    archive: "Archivar",
    delete: "Eliminar",
    message: "Mensaje",
    attachments: "Archivos adjuntos",
  },
  ar: {
    backToInbox: "العودة للبريد الوارد",
    subject: "الموضوع",
    noSubject: "(بدون موضوع)",
    reply: "رد",
    markAsUnread: "تحديد كغير مقروء",
    star: "مفضلة",
    unstar: "إزالة من المفضلة",
    archive: "أرشفة",
    delete: "حذف",
    message: "الرسالة",
    attachments: "المرفقات",
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

  const message = await getMessage(id);

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
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6 lg:p-8">
      {/* Back Button */}
      <div className="mx-auto mb-6 max-w-5xl">
        <Link
          href={`/${locale}/admin/messages`}
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToInbox}
        </Link>
      </div>

      {/* Main Card */}
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
        {/* Beautiful Gradient Amber Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 dark:from-amber-900/20 dark:to-orange-900/20 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left Side: Avatar + Sender Info */}
            <div className="flex items-start gap-4">
              {/* Large Avatar Circle with Initials */}
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-white shadow-lg">
                {getInitials(message.name)}
              </div>

              {/* Sender Details */}
              <div className="flex-1">
                {/* Sender Name as h2 */}
                <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                  {message.name}
                </h2>

                {/* Email and Phone as Clickable Links with Icons */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  {/* Email Link */}
                  <a
                    href={`mailto:${message.email}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 hover:underline dark:text-amber-400 dark:hover:text-amber-300"
                  >
                    <Mail className="h-4 w-4" />
                    {message.email}
                  </a>

                  {/* Phone Link */}
                  {message.phone && (
                    <a
                      href={`tel:${message.phone}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400"
                    >
                      <Phone className="h-4 w-4" />
                      {message.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Date + Star Icon */}
            <div className="flex items-center gap-4">
              {/* Date */}
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                {formatDate(message.createdAt)}
              </div>

              {/* Star Icon if Starred */}
              {message.starred && (
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {/* Clean Action Button Row */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Primary + Secondary Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary: Reply Button */}
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
          </div>

          {/* Subject Section */}
          <div className="mb-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t.subject}
            </div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {message.subject || t.noSubject}
            </div>
          </div>

          {/* Message Body */}
          <div className="mb-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t.message}
            </div>
            <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-900/50">
              <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {message.content}
              </div>
            </div>
          </div>

          {/* Attachments as Nice Cards */}
          {message.attachments && message.attachments.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <Paperclip className="h-4 w-4" />
                {t.attachments} ({message.attachments.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {message.attachments.map((file, index) => {
                  const FileIcon = getFileIcon(file.type);
                  const fileUrl = getFileUrl(file.url);
                  const isImage = file.type.startsWith("image/");

                  return (
                    <a
                      key={index}
                      href={fileUrl}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-amber-600"
                    >
                      <div className="flex items-center gap-3">
                        {/* File Icon */}
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${
                          isImage
                            ? 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                            : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
                        }`}>
                          <FileIcon className={`h-6 w-6 ${
                            isImage
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`} />
                        </div>

                        {/* File Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {/* Download Icon on Hover */}
                        <Download className="h-5 w-5 flex-shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
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
