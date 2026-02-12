"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  MailOpen,
  Star,
  StarOff,
  Reply,
  Trash2,
  Loader2,
  Archive,
} from "lucide-react";
import { ReplyForm } from "./ReplyForm";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    reply: "Répondre",
    markAsUnread: "Marquer comme non lu",
    markAsRead: "Marquer comme lu",
    star: "Favoris",
    unstar: "Retirer des favoris",
    archive: "Archiver",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce message ?",
    deleting: "Suppression...",
    cancel: "Annuler",
  },
  en: {
    reply: "Reply",
    markAsUnread: "Mark as unread",
    markAsRead: "Mark as read",
    star: "Star",
    unstar: "Unstar",
    archive: "Archive",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this message?",
    deleting: "Deleting...",
    cancel: "Cancel",
  },
  es: {
    reply: "Responder",
    markAsUnread: "Marcar como no leído",
    markAsRead: "Marcar como leído",
    star: "Destacar",
    unstar: "Quitar destacado",
    archive: "Archivar",
    delete: "Eliminar",
    confirmDelete: "¿Está seguro de eliminar este mensaje?",
    deleting: "Eliminando...",
    cancel: "Cancelar",
  },
  ar: {
    reply: "رد",
    markAsUnread: "تحديد كغير مقروء",
    markAsRead: "تحديد كمقروء",
    star: "مفضلة",
    unstar: "إزالة من المفضلة",
    archive: "أرشفة",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذه الرسالة؟",
    deleting: "جاري الحذف...",
    cancel: "إلغاء",
  },
};

// ═══════════════════════════════════════════════════════════
// Message Actions Component
// ═══════════════════════════════════════════════════════════

interface MessageActionsProps {
  messageId: string;
  isRead: boolean;
  isStarred: boolean;
  customerEmail: string;
  customerName: string;
  originalSubject: string | null;
  locale: string;
}

export function MessageActions({
  messageId,
  isRead,
  isStarred,
  customerEmail,
  customerName,
  originalSubject,
  locale,
}: MessageActionsProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const [starred, setStarred] = useState(isStarred);
  const [read, setRead] = useState(isRead);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Toggle star
  const handleToggleStar = async () => {
    const newStarred = !starred;
    setStarred(newStarred); // Optimistic update
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      });
      if (!response.ok) {
        setStarred(!newStarred); // Revert on failure
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle star:", error);
      setStarred(!newStarred); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle read status
  const handleToggleRead = async () => {
    const newRead = !read;
    setRead(newRead); // Optimistic update
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: newRead }),
      });
      if (!response.ok) {
        setRead(!newRead); // Revert on failure
      }
    } catch (error) {
      console.error("Failed to toggle read:", error);
      setRead(!newRead); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  // Reply via inline form
  const handleReply = () => {
    setShowReplyForm(true);
  };

  // Delete message
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push(`/${locale}/admin/messages`);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Clean Action Button Row - NOT scattered big buttons */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        {/* Left Side: Primary + Secondary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary: Reply Button (amber-600, with Reply icon) */}
          <button
            onClick={handleReply}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md"
          >
            <Reply className="h-4 w-4" />
            {t.reply}
          </button>

          {/* Secondary: Mark as Unread (gray, subtle) */}
          <button
            onClick={() => void handleToggleRead()}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <MailOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{read ? t.markAsUnread : t.markAsRead}</span>
          </button>

          {/* Secondary: Star/Unstar (gray, subtle) */}
          <button
            onClick={() => void handleToggleStar()}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {starred ? (
              <>
                <StarOff className="h-4 w-4" />
                <span className="hidden sm:inline">{t.unstar}</span>
              </>
            ) : (
              <>
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">{t.star}</span>
              </>
            )}
          </button>

          {/* Secondary: Archive (gray, subtle) */}
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">{t.archive}</span>
          </button>
        </div>

        {/* Right Side: Delete Button (red text) */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t.delete}</span>
        </button>
      </div>

      {/* Reply Form Modal */}
      {showReplyForm && (
        <ReplyForm
          customerEmail={customerEmail}
          customerName={customerName}
          originalSubject={originalSubject}
          messageId={messageId}
          locale={locale}
          onClose={() => setShowReplyForm(false)}
          onSuccess={() => {
            setShowReplyForm(false);
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="border-b-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 dark:border-red-900/50 dark:from-red-900/10 dark:to-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t.delete}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {t.confirmDelete}
              </p>
              <div className="mt-8 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2.5 font-semibold"
                >
                  {t.cancel}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-2.5 font-semibold shadow-lg shadow-red-500/30 transition-all hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="me-2 h-5 w-5 animate-spin" />}
                  {isDeleting ? t.deleting : t.delete}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
