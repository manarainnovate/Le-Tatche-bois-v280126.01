"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, Send, CheckCircle, XCircle, RefreshCw, ArrowRightCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface QuoteRequestActionsProps {
  quoteId: string;
  currentStatus: string;
  locale: string;
}

type QuoteStatus = "PENDING" | "REVIEWING" | "QUOTED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED";

// ═══════════════════════════════════════════════════════════
// Status Configurations
// ═══════════════════════════════════════════════════════════

const STATUS_FLOW: Record<QuoteStatus, QuoteStatus[]> = {
  PENDING: ["REVIEWING", "REJECTED"],
  REVIEWING: ["QUOTED", "REJECTED"],
  QUOTED: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED: ["CONVERTED"],
  REJECTED: [],
  EXPIRED: ["REVIEWING"],
  CONVERTED: [],
};

const STATUS_LABELS: Record<string, Record<QuoteStatus, string>> = {
  fr: {
    PENDING: "En attente",
    REVIEWING: "En cours",
    QUOTED: "Devis envoye",
    ACCEPTED: "Accepte",
    REJECTED: "Refuse",
    EXPIRED: "Expire",
    CONVERTED: "Converti",
  },
  en: {
    PENDING: "Pending",
    REVIEWING: "Reviewing",
    QUOTED: "Quoted",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    EXPIRED: "Expired",
    CONVERTED: "Converted",
  },
  es: {
    PENDING: "Pendiente",
    REVIEWING: "Revisando",
    QUOTED: "Cotizado",
    ACCEPTED: "Aceptado",
    REJECTED: "Rechazado",
    EXPIRED: "Expirado",
    CONVERTED: "Convertido",
  },
  ar: {
    PENDING: "قيد الانتظار",
    REVIEWING: "قيد المراجعة",
    QUOTED: "تم التسعير",
    ACCEPTED: "مقبول",
    REJECTED: "مرفوض",
    EXPIRED: "منتهي الصلاحية",
    CONVERTED: "تم التحويل",
  },
};

const translations = {
  fr: {
    updateStatus: "Actions",
    currentStatus: "Statut actuel",
    nextActions: "Actions disponibles",
    startReview: "Commencer la revision",
    sendQuote: "Envoyer le devis",
    markAccepted: "Marquer accepte",
    markRejected: "Marquer refuse",
    markExpired: "Marquer expire",
    convertToLead: "Convertir en lead CRM",
    reopenReview: "Reouvrir",
    updating: "Mise a jour...",
    rejectConfirm: "Etes-vous sur de vouloir refuser cette demande?",
    addNote: "Ajouter une note",
    notePlaceholder: "Ajouter une note interne...",
    saveNote: "Enregistrer",
    quotedPrice: "Prix du devis (MAD)",
    pricePlaceholder: "Ex: 15000",
    validityDays: "Validite (jours)",
    responseMessage: "Message de reponse",
    responsePlaceholder: "Votre reponse au client...",
    sendQuoteBtn: "Envoyer le devis",
  },
  en: {
    updateStatus: "Actions",
    currentStatus: "Current Status",
    nextActions: "Available Actions",
    startReview: "Start Review",
    sendQuote: "Send Quote",
    markAccepted: "Mark Accepted",
    markRejected: "Mark Rejected",
    markExpired: "Mark Expired",
    convertToLead: "Convert to CRM Lead",
    reopenReview: "Reopen",
    updating: "Updating...",
    rejectConfirm: "Are you sure you want to reject this request?",
    addNote: "Add Note",
    notePlaceholder: "Add an internal note...",
    saveNote: "Save",
    quotedPrice: "Quote Price (MAD)",
    pricePlaceholder: "Ex: 15000",
    validityDays: "Validity (days)",
    responseMessage: "Response Message",
    responsePlaceholder: "Your response to the customer...",
    sendQuoteBtn: "Send Quote",
  },
  es: {
    updateStatus: "Acciones",
    currentStatus: "Estado Actual",
    nextActions: "Acciones Disponibles",
    startReview: "Iniciar Revision",
    sendQuote: "Enviar Cotizacion",
    markAccepted: "Marcar Aceptado",
    markRejected: "Marcar Rechazado",
    markExpired: "Marcar Expirado",
    convertToLead: "Convertir en Lead CRM",
    reopenReview: "Reabrir",
    updating: "Actualizando...",
    rejectConfirm: "Esta seguro de rechazar esta solicitud?",
    addNote: "Agregar Nota",
    notePlaceholder: "Agregar nota interna...",
    saveNote: "Guardar",
    quotedPrice: "Precio Cotizado (MAD)",
    pricePlaceholder: "Ej: 15000",
    validityDays: "Validez (dias)",
    responseMessage: "Mensaje de Respuesta",
    responsePlaceholder: "Su respuesta al cliente...",
    sendQuoteBtn: "Enviar Cotizacion",
  },
  ar: {
    updateStatus: "الإجراءات",
    currentStatus: "الحالة الحالية",
    nextActions: "الإجراءات المتاحة",
    startReview: "بدء المراجعة",
    sendQuote: "إرسال العرض",
    markAccepted: "وضع علامة مقبول",
    markRejected: "وضع علامة مرفوض",
    markExpired: "وضع علامة منتهي",
    convertToLead: "تحويل إلى عميل محتمل",
    reopenReview: "إعادة فتح",
    updating: "جاري التحديث...",
    rejectConfirm: "هل أنت متأكد من رفض هذا الطلب؟",
    addNote: "إضافة ملاحظة",
    notePlaceholder: "أضف ملاحظة داخلية...",
    saveNote: "حفظ",
    quotedPrice: "سعر العرض (درهم)",
    pricePlaceholder: "مثال: 15000",
    validityDays: "الصلاحية (أيام)",
    responseMessage: "رسالة الرد",
    responsePlaceholder: "ردك للعميل...",
    sendQuoteBtn: "إرسال العرض",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function QuoteRequestActions({
  quoteId,
  currentStatus,
  locale,
}: QuoteRequestActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [validityDays, setValidityDays] = useState("15");
  const [response, setResponse] = useState("");

  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const statusLabels = STATUS_LABELS[locale] ?? STATUS_LABELS.fr;

  const availableStatuses = STATUS_FLOW[currentStatus as QuoteStatus] ?? [];

  const updateQuote = async (newStatus: QuoteStatus, extras?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...extras,
        }),
      });

      if (response.ok) {
        router.refresh();
        setShowQuoteForm(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update quote");
      }
    } catch (err) {
      console.error("Failed to update quote:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (newStatus === "REJECTED") {
      if (!confirm(t.rejectConfirm)) return;
    }

    if (newStatus === "QUOTED") {
      setShowQuoteForm(true);
      return;
    }

    await updateQuote(newStatus);
  };

  const handleSendQuote = async () => {
    if (!quotedPrice) {
      alert("Please enter a quoted price");
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(validityDays, 10));

    await updateQuote("QUOTED", {
      quotedPrice: parseFloat(quotedPrice),
      validUntil: validUntil.toISOString(),
      response: response || undefined,
    });
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note, isInternal: true }),
      });

      if (response.ok) {
        router.refresh();
        setNote("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = (status: QuoteStatus) => {
    const labels: Record<QuoteStatus, string> = {
      REVIEWING: t.startReview,
      QUOTED: t.sendQuote,
      ACCEPTED: t.markAccepted,
      REJECTED: t.markRejected,
      EXPIRED: t.markExpired,
      CONVERTED: t.convertToLead,
      PENDING: "",
    };

    const icons: Record<QuoteStatus, React.ComponentType<{ className?: string }>> = {
      REVIEWING: Eye,
      QUOTED: Send,
      ACCEPTED: CheckCircle,
      REJECTED: XCircle,
      EXPIRED: RefreshCw,
      CONVERTED: ArrowRightCircle,
      PENDING: RefreshCw,
    };

    const colors: Record<QuoteStatus, string> = {
      REVIEWING: "bg-blue-600 hover:bg-blue-700 text-white",
      QUOTED: "bg-purple-600 hover:bg-purple-700 text-white",
      ACCEPTED: "bg-green-600 hover:bg-green-700 text-white",
      REJECTED: "bg-red-600 hover:bg-red-700 text-white",
      EXPIRED: "bg-gray-600 hover:bg-gray-700 text-white",
      CONVERTED: "bg-teal-600 hover:bg-teal-700 text-white",
      PENDING: "",
    };

    const Icon = icons[status];

    return (
      <button
        key={status}
        onClick={() => handleStatusChange(status)}
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          colors[status],
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Icon className="h-4 w-4" />
        {labels[status]}
      </button>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">{t.updateStatus}</h2>
      </div>
      <div className="p-6 space-y-4">
        {/* Current Status */}
        <div>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t.currentStatus}</p>
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
            <span className="font-medium text-gray-900 dark:text-white">
              {statusLabels[currentStatus as QuoteStatus] ?? currentStatus}
            </span>
          </div>
        </div>

        {/* Quote Form */}
        {showQuoteForm && (
          <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.quotedPrice}
              </label>
              <input
                type="number"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                placeholder={t.pricePlaceholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.validityDays}
              </label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.responseMessage}
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder={t.responsePlaceholder}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSendQuote}
                disabled={loading || !quotedPrice}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Send className="me-2 h-4 w-4" />
                {t.sendQuoteBtn}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQuoteForm(false)}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Available Actions */}
        {!showQuoteForm && availableStatuses.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t.nextActions}</p>
            <div className="space-y-2">
              {availableStatuses.map((status) => getActionButton(status))}
            </div>
          </div>
        )}

        {/* Add Note */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <label className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
            <MessageSquare className="me-1 inline h-4 w-4" />
            {t.addNote}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notePlaceholder}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveNote}
            disabled={loading || !note.trim()}
            className="mt-2"
          >
            {t.saveNote}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            {t.updating}
          </div>
        )}
      </div>
    </div>
  );
}
