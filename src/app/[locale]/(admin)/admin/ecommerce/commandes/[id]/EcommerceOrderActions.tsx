"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Check, X, Truck, Package, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface EcommerceOrderActionsProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  locale: string;
}

type OrderStatus = "PENDING" | "PROCESSING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

// ═══════════════════════════════════════════════════════════
// Status Configurations
// ═══════════════════════════════════════════════════════════

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  REFUNDED: [],
};

const STATUS_LABELS: Record<string, Record<OrderStatus, string>> = {
  fr: {
    PENDING: "En attente",
    PROCESSING: "En traitement",
    CONFIRMED: "Confirmee",
    PREPARING: "En preparation",
    SHIPPED: "Expediee",
    DELIVERED: "Livree",
    COMPLETED: "Terminee",
    CANCELLED: "Annulee",
    REFUNDED: "Remboursee",
  },
  en: {
    PENDING: "Pending",
    PROCESSING: "Processing",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  },
  es: {
    PENDING: "Pendiente",
    PROCESSING: "Procesando",
    CONFIRMED: "Confirmado",
    PREPARING: "Preparando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  },
  ar: {
    PENDING: "قيد الانتظار",
    PROCESSING: "قيد المعالجة",
    CONFIRMED: "مؤكد",
    PREPARING: "قيد التحضير",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التسليم",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
    REFUNDED: "مسترد",
  },
};

const STATUS_ICONS: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: RefreshCw,
  PROCESSING: RefreshCw,
  CONFIRMED: Check,
  PREPARING: Package,
  SHIPPED: Truck,
  DELIVERED: Check,
  COMPLETED: Check,
  CANCELLED: X,
  REFUNDED: RefreshCw,
};

const translations = {
  fr: {
    updateStatus: "Mettre a jour le statut",
    currentStatus: "Statut actuel",
    nextActions: "Actions disponibles",
    trackingNumber: "Numero de suivi",
    trackingPlaceholder: "Ex: 1Z999AA10123456784",
    addTracking: "Ajouter le suivi",
    confirm: "Confirmer la commande",
    process: "Commencer le traitement",
    prepare: "Marquer en preparation",
    ship: "Marquer comme expediee",
    deliver: "Marquer comme livree",
    complete: "Terminer",
    cancel: "Annuler la commande",
    updating: "Mise a jour...",
    cancelConfirm: "Etes-vous sur de vouloir annuler cette commande?",
    adminNote: "Note administrative",
    adminNotePlaceholder: "Ajouter une note interne...",
    saveNote: "Enregistrer la note",
  },
  en: {
    updateStatus: "Update Status",
    currentStatus: "Current Status",
    nextActions: "Available Actions",
    trackingNumber: "Tracking Number",
    trackingPlaceholder: "Ex: 1Z999AA10123456784",
    addTracking: "Add Tracking",
    confirm: "Confirm Order",
    process: "Start Processing",
    prepare: "Mark as Preparing",
    ship: "Mark as Shipped",
    deliver: "Mark as Delivered",
    complete: "Complete",
    cancel: "Cancel Order",
    updating: "Updating...",
    cancelConfirm: "Are you sure you want to cancel this order?",
    adminNote: "Admin Note",
    adminNotePlaceholder: "Add an internal note...",
    saveNote: "Save Note",
  },
  es: {
    updateStatus: "Actualizar Estado",
    currentStatus: "Estado Actual",
    nextActions: "Acciones Disponibles",
    trackingNumber: "Numero de Seguimiento",
    trackingPlaceholder: "Ej: 1Z999AA10123456784",
    addTracking: "Agregar Seguimiento",
    confirm: "Confirmar Pedido",
    process: "Iniciar Procesamiento",
    prepare: "Marcar en Preparacion",
    ship: "Marcar como Enviado",
    deliver: "Marcar como Entregado",
    complete: "Completar",
    cancel: "Cancelar Pedido",
    updating: "Actualizando...",
    cancelConfirm: "Esta seguro de cancelar este pedido?",
    adminNote: "Nota Admin",
    adminNotePlaceholder: "Agregar nota interna...",
    saveNote: "Guardar Nota",
  },
  ar: {
    updateStatus: "تحديث الحالة",
    currentStatus: "الحالة الحالية",
    nextActions: "الإجراءات المتاحة",
    trackingNumber: "رقم التتبع",
    trackingPlaceholder: "مثال: 1Z999AA10123456784",
    addTracking: "إضافة التتبع",
    confirm: "تأكيد الطلب",
    process: "بدء المعالجة",
    prepare: "وضع علامة قيد التحضير",
    ship: "وضع علامة تم الشحن",
    deliver: "وضع علامة تم التسليم",
    complete: "إكمال",
    cancel: "إلغاء الطلب",
    updating: "جاري التحديث...",
    cancelConfirm: "هل أنت متأكد من إلغاء هذا الطلب؟",
    adminNote: "ملاحظة المسؤول",
    adminNotePlaceholder: "أضف ملاحظة داخلية...",
    saveNote: "حفظ الملاحظة",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function EcommerceOrderActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
  locale,
}: EcommerceOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const statusLabels = STATUS_LABELS[locale] ?? STATUS_LABELS.fr;

  const availableStatuses = STATUS_FLOW[currentStatus as OrderStatus] ?? [];
  const StatusIcon = STATUS_ICONS[currentStatus as OrderStatus] ?? RefreshCw;

  const updateOrder = async (newStatus: OrderStatus, extras?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...extras,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update order");
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === "CANCELLED") {
      if (!confirm(t.cancelConfirm)) return;
    }

    if (newStatus === "SHIPPED" && trackingNumber) {
      await updateOrder(newStatus, { trackingNumber });
    } else {
      await updateOrder(newStatus);
    }
  };

  const handleSaveNote = async () => {
    if (!adminNote.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote }),
      });

      if (response.ok) {
        router.refresh();
        setAdminNote("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      CONFIRMED: t.confirm,
      PROCESSING: t.process,
      PREPARING: t.prepare,
      SHIPPED: t.ship,
      DELIVERED: t.deliver,
      COMPLETED: t.complete,
      CANCELLED: t.cancel,
      PENDING: "",
      REFUNDED: "",
    };

    const colors: Record<OrderStatus, string> = {
      CONFIRMED: "bg-green-600 hover:bg-green-700 text-white",
      PROCESSING: "bg-blue-600 hover:bg-blue-700 text-white",
      PREPARING: "bg-amber-600 hover:bg-amber-700 text-white",
      SHIPPED: "bg-purple-600 hover:bg-purple-700 text-white",
      DELIVERED: "bg-teal-600 hover:bg-teal-700 text-white",
      COMPLETED: "bg-green-600 hover:bg-green-700 text-white",
      CANCELLED: "bg-red-600 hover:bg-red-700 text-white",
      PENDING: "",
      REFUNDED: "",
    };

    const Icon = STATUS_ICONS[status];

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
            <StatusIcon className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-gray-900 dark:text-white">
              {statusLabels[currentStatus as OrderStatus] ?? currentStatus}
            </span>
          </div>
        </div>

        {/* Tracking Number for Shipping */}
        {availableStatuses.includes("SHIPPED") && (
          <div>
            <label className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
              {t.trackingNumber}
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t.trackingPlaceholder}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}

        {/* Available Actions */}
        {availableStatuses.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">{t.nextActions}</p>
            <div className="space-y-2">
              {availableStatuses.map((status) => getActionButton(status))}
            </div>
          </div>
        )}

        {/* Admin Note */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <label className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
            {t.adminNote}
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder={t.adminNotePlaceholder}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveNote}
            disabled={loading || !adminNote.trim()}
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
