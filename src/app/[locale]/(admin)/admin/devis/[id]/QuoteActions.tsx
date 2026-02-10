"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QUOTE_STATUSES, getQuoteStatusLabel, type QuoteStatus } from "@/components/admin/QuoteCard";
import { Settings, Loader2, UserPlus, Send, Trash2, MessageSquare } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    actions: "Actions",
    updateStatus: "Mettre a jour le statut",
    selectStatus: "Selectionner un statut",
    reason: "Raison (optionnel)",
    update: "Mettre a jour",
    updating: "Mise a jour...",
    assignTo: "Assigner a",
    selectMember: "Selectionner un membre",
    unassigned: "Non assigne",
    assign: "Assigner",
    assigning: "Attribution...",
    sendEmail: "Envoyer un email",
    deleteQuote: "Supprimer",
    confirmDelete: "Etes-vous sur de vouloir supprimer ce devis ?",
    deleting: "Suppression...",
    addNote: "Ajouter une note",
    noteContent: "Contenu de la note",
    privateNote: "Note privee (visible uniquement par l'equipe)",
    saving: "Enregistrement...",
    save: "Enregistrer",
  },
  en: {
    actions: "Actions",
    updateStatus: "Update Status",
    selectStatus: "Select status",
    reason: "Reason (optional)",
    update: "Update",
    updating: "Updating...",
    assignTo: "Assign To",
    selectMember: "Select member",
    unassigned: "Unassigned",
    assign: "Assign",
    assigning: "Assigning...",
    sendEmail: "Send Email",
    deleteQuote: "Delete",
    confirmDelete: "Are you sure you want to delete this quote?",
    deleting: "Deleting...",
    addNote: "Add Note",
    noteContent: "Note content",
    privateNote: "Private note (visible only to team)",
    saving: "Saving...",
    save: "Save",
  },
  es: {
    actions: "Acciones",
    updateStatus: "Actualizar estado",
    selectStatus: "Seleccionar estado",
    reason: "Razon (opcional)",
    update: "Actualizar",
    updating: "Actualizando...",
    assignTo: "Asignar a",
    selectMember: "Seleccionar miembro",
    unassigned: "Sin asignar",
    assign: "Asignar",
    assigning: "Asignando...",
    sendEmail: "Enviar email",
    deleteQuote: "Eliminar",
    confirmDelete: "Esta seguro de eliminar este presupuesto?",
    deleting: "Eliminando...",
    addNote: "Agregar nota",
    noteContent: "Contenido de la nota",
    privateNote: "Nota privada (visible solo para el equipo)",
    saving: "Guardando...",
    save: "Guardar",
  },
  ar: {
    actions: "الإجراءات",
    updateStatus: "تحديث الحالة",
    selectStatus: "اختر الحالة",
    reason: "السبب (اختياري)",
    update: "تحديث",
    updating: "جاري التحديث...",
    assignTo: "تعيين إلى",
    selectMember: "اختر عضو",
    unassigned: "غير معين",
    assign: "تعيين",
    assigning: "جاري التعيين...",
    sendEmail: "إرسال بريد",
    deleteQuote: "حذف",
    confirmDelete: "هل أنت متأكد من حذف عرض السعر هذا؟",
    deleting: "جاري الحذف...",
    addNote: "إضافة ملاحظة",
    noteContent: "محتوى الملاحظة",
    privateNote: "ملاحظة خاصة (مرئية فقط للفريق)",
    saving: "جاري الحفظ...",
    save: "حفظ",
  },
};

// ═══════════════════════════════════════════════════════════
// Quote Actions Component
// ═══════════════════════════════════════════════════════════

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
}

interface QuoteActionsProps {
  quoteId: string;
  currentStatus: QuoteStatus;
  currentAssignee: string | null;
  customerEmail: string;
  teamMembers: TeamMember[];
  locale: string;
}

export function QuoteActions({
  quoteId,
  currentStatus,
  currentAssignee,
  customerEmail,
  teamMembers,
  locale,
}: QuoteActionsProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [newStatus, setNewStatus] = useState<QuoteStatus>(currentStatus);
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [selectedMember, setSelectedMember] = useState(currentAssignee ?? "");
  const [isAssigning, setIsAssigning] = useState(false);

  const [noteContent, setNoteContent] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // Update status
  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, statusReason }),
      });
      if (response.ok) {
        router.refresh();
        setShowStatusModal(false);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Assign to member
  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: selectedMember || null }),
      });
      if (response.ok) {
        router.refresh();
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error("Failed to assign:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setIsSavingNote(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent, isPrivate: isPrivateNote }),
      });
      if (response.ok) {
        router.refresh();
        setShowNoteModal(false);
        setNoteContent("");
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete quote
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push(`/${locale}/admin/devis`);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Send email
  const handleSendEmail = () => {
    window.open(`mailto:${customerEmail}`, "_blank");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
        <Settings className="h-5 w-5 text-amber-600" />
        {t.actions}
      </h2>
      <div className="space-y-3">
        {/* Update Status */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowStatusModal(true)}
        >
          <Settings className="me-2 h-4 w-4" />
          {t.updateStatus}
        </Button>

        {/* Assign To */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowAssignModal(true)}
        >
          <UserPlus className="me-2 h-4 w-4" />
          {t.assignTo}
        </Button>

        {/* Add Note */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowNoteModal(true)}
        >
          <MessageSquare className="me-2 h-4 w-4" />
          {t.addNote}
        </Button>

        {/* Send Email */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSendEmail}
        >
          <Send className="me-2 h-4 w-4" />
          {t.sendEmail}
        </Button>

        {/* Delete */}
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="me-2 h-4 w-4" />
          {t.deleteQuote}
        </Button>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t.updateStatus}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.selectStatus}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as QuoteStatus)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {QUOTE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getQuoteStatusLabel(status, locale)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.reason}
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => void handleStatusUpdate()} disabled={isUpdatingStatus}>
                {isUpdatingStatus && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isUpdatingStatus ? t.updating : t.update}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t.assignTo}
            </h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.selectMember}
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t.unassigned}</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name ?? member.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => void handleAssign()} disabled={isAssigning}>
                {isAssigning && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isAssigning ? t.assigning : t.assign}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t.addNote}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.noteContent}
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPrivateNote}
                  onChange={(e) => setIsPrivateNote(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.privateNote}</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNoteModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => void handleAddNote()} disabled={isSavingNote || !noteContent.trim()}>
                {isSavingNote && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isSavingNote ? t.saving : t.save}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {t.deleteQuote}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{t.confirmDelete}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isDeleting ? t.deleting : t.deleteQuote}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
