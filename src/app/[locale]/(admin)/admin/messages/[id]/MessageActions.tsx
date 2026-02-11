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
  Flag,
} from "lucide-react";
import { ReplyForm } from "./ReplyForm";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    actions: "Actions",
    markAsUnread: "Marquer comme non lu",
    markAsRead: "Marquer comme lu",
    star: "Ajouter aux favoris",
    unstar: "Retirer des favoris",
    reply: "Répondre",
    forward: "Transférer",
    archive: "Archiver",
    flag: "Signaler",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce message ?",
    deleting: "Suppression...",
    cancel: "Annuler",
  },
  en: {
    actions: "Actions",
    markAsUnread: "Mark as unread",
    markAsRead: "Mark as read",
    star: "Star",
    unstar: "Unstar",
    reply: "Reply",
    forward: "Forward",
    archive: "Archive",
    flag: "Flag",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this message?",
    deleting: "Deleting...",
    cancel: "Cancel",
  },
  es: {
    actions: "Acciones",
    markAsUnread: "Marcar como no leído",
    markAsRead: "Marcar como leído",
    star: "Destacar",
    unstar: "Quitar destacado",
    reply: "Responder",
    forward: "Reenviar",
    archive: "Archivar",
    flag: "Marcar",
    delete: "Eliminar",
    confirmDelete: "¿Está seguro de eliminar este mensaje?",
    deleting: "Eliminando...",
    cancel: "Cancelar",
  },
  ar: {
    actions: "الإجراءات",
    markAsUnread: "تحديد كغير مقروء",
    markAsRead: "تحديد كمقروء",
    star: "إضافة للمفضلة",
    unstar: "إزالة من المفضلة",
    reply: "رد",
    forward: "إعادة توجيه",
    archive: "أرشفة",
    flag: "تمييز",
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
      {/* Horizontal Action Buttons - Modern Design */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {/* Mark as Read/Unread */}
        <button
          onClick={() => void handleToggleRead()}
          disabled={isUpdating}
          className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 px-4 py-3 font-semibold text-gray-700 shadow-md transition-all hover:scale-105 hover:border-amber-400 hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 hover:shadow-lg disabled:opacity-50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:text-gray-300 dark:hover:border-amber-600 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 dark:hover:text-amber-400"
        >
          <MailOpen className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline">{read ? t.markAsUnread : t.markAsRead}</span>
        </button>

        {/* Star/Unstar */}
        <button
          onClick={() => void handleToggleStar()}
          disabled={isUpdating}
          className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 px-4 py-3 font-semibold text-gray-700 shadow-md transition-all hover:scale-105 hover:border-yellow-400 hover:from-yellow-50 hover:to-amber-50 hover:text-yellow-700 hover:shadow-lg disabled:opacity-50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:text-gray-300 dark:hover:border-yellow-600 dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20 dark:hover:text-yellow-400"
        >
          {starred ? (
            <>
              <StarOff className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">{t.unstar}</span>
            </>
          ) : (
            <>
              <Star className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">{t.star}</span>
            </>
          )}
        </button>

        {/* Reply - Primary Action */}
        <button
          onClick={handleReply}
          className="group flex items-center gap-2 rounded-xl border-2 border-green-500 bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-105 hover:border-green-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/40"
        >
          <Reply className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span>{t.reply}</span>
        </button>

        {/* Archive */}
        <button className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 px-4 py-3 font-semibold text-gray-700 shadow-md transition-all hover:scale-105 hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:text-gray-300 dark:hover:border-blue-600 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 dark:hover:text-blue-400">
          <Archive className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="hidden sm:inline">{t.archive}</span>
        </button>

        {/* Delete - Danger Action */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="group flex items-center gap-2 rounded-xl border-2 border-red-500 bg-gradient-to-br from-red-500 to-rose-600 px-4 py-3 font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:border-red-600 hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/40"
        >
          <Trash2 className="h-5 w-5 transition-transform group-hover:scale-110" />
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
