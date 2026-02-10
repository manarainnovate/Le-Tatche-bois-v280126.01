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
  locale: string;
}

export function MessageActions({
  messageId,
  isRead,
  isStarred,
  customerEmail,
  locale,
}: MessageActionsProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const [starred, setStarred] = useState(isStarred);
  const [read, setRead] = useState(isRead);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // Reply via email client
  const handleReply = () => {
    window.open(`mailto:${customerEmail}`, "_blank");
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
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
        <Flag className="h-5 w-5 text-amber-600" />
        {t.actions}
      </h2>
      <div className="space-y-3">
        {/* Mark as Read/Unread */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => void handleToggleRead()}
          disabled={isUpdating}
        >
          <MailOpen className="me-2 h-4 w-4" />
          {read ? t.markAsUnread : t.markAsRead}
        </Button>

        {/* Star/Unstar */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => void handleToggleStar()}
          disabled={isUpdating}
        >
          {starred ? (
            <>
              <StarOff className="me-2 h-4 w-4" />
              {t.unstar}
            </>
          ) : (
            <>
              <Star className="me-2 h-4 w-4" />
              {t.star}
            </>
          )}
        </Button>

        {/* Reply */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleReply}
        >
          <Reply className="me-2 h-4 w-4" />
          {t.reply}
        </Button>

        {/* Archive */}
        <Button
          variant="outline"
          className="w-full justify-start"
        >
          <Archive className="me-2 h-4 w-4" />
          {t.archive}
        </Button>

        {/* Delete */}
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="me-2 h-4 w-4" />
          {t.delete}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t.delete}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{t.confirmDelete}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                {t.cancel}
              </Button>
              <Button
                variant="danger"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isDeleting ? t.deleting : t.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
