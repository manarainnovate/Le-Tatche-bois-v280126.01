"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUSES, getOrderStatusLabel } from "@/components/admin/OrderStatusBadge";
import { Settings, Loader2, Truck } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    updateStatus: "Mettre a jour le statut",
    currentStatus: "Statut actuel",
    newStatus: "Nouveau statut",
    reason: "Raison (optionnel)",
    reasonPlaceholder: "Ajouter une note...",
    update: "Mettre a jour",
    updating: "Mise a jour...",
    trackingNumber: "Numero de suivi",
    trackingPlaceholder: "Ex: TR123456789MA",
    trackingUrl: "URL de suivi",
    trackingUrlPlaceholder: "https://...",
    addTracking: "Ajouter le suivi",
    updateTracking: "Mettre a jour",
    success: "Statut mis a jour avec succes",
    error: "Erreur lors de la mise a jour",
  },
  en: {
    updateStatus: "Update Status",
    currentStatus: "Current Status",
    newStatus: "New Status",
    reason: "Reason (optional)",
    reasonPlaceholder: "Add a note...",
    update: "Update",
    updating: "Updating...",
    trackingNumber: "Tracking Number",
    trackingPlaceholder: "e.g., TR123456789MA",
    trackingUrl: "Tracking URL",
    trackingUrlPlaceholder: "https://...",
    addTracking: "Add Tracking",
    updateTracking: "Update",
    success: "Status updated successfully",
    error: "Error updating status",
  },
  es: {
    updateStatus: "Actualizar estado",
    currentStatus: "Estado actual",
    newStatus: "Nuevo estado",
    reason: "Razon (opcional)",
    reasonPlaceholder: "Agregar una nota...",
    update: "Actualizar",
    updating: "Actualizando...",
    trackingNumber: "Numero de seguimiento",
    trackingPlaceholder: "Ej: TR123456789MA",
    trackingUrl: "URL de seguimiento",
    trackingUrlPlaceholder: "https://...",
    addTracking: "Agregar seguimiento",
    updateTracking: "Actualizar",
    success: "Estado actualizado con exito",
    error: "Error al actualizar el estado",
  },
  ar: {
    updateStatus: "تحديث الحالة",
    currentStatus: "الحالة الحالية",
    newStatus: "الحالة الجديدة",
    reason: "السبب (اختياري)",
    reasonPlaceholder: "إضافة ملاحظة...",
    update: "تحديث",
    updating: "جاري التحديث...",
    trackingNumber: "رقم التتبع",
    trackingPlaceholder: "مثال: TR123456789MA",
    trackingUrl: "رابط التتبع",
    trackingUrlPlaceholder: "https://...",
    addTracking: "إضافة التتبع",
    updateTracking: "تحديث",
    success: "تم تحديث الحالة بنجاح",
    error: "خطأ في تحديث الحالة",
  },
};

// ═══════════════════════════════════════════════════════════
// Order Actions Component
// ═══════════════════════════════════════════════════════════

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  locale: string;
}

export function OrderActions({ orderId, currentStatus, locale }: OrderActionsProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  const handleStatusUpdate = async () => {
    if (status === currentStatus) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      router.refresh();
    } catch {
      setError(t.error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!trackingNumber.trim()) return;

    setIsUpdatingTracking(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tracking");
      }

      router.refresh();
      setTrackingNumber("");
      setTrackingUrl("");
    } catch {
      setError(t.error);
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Update Card */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Settings className="h-5 w-5 text-amber-600" />
            {t.updateStatus}
          </h2>
        </div>
        <div className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.newStatus}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {getOrderStatusLabel(s, locale)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.reason}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.reasonPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <Button
            onClick={() => void handleStatusUpdate()}
            disabled={isUpdating || status === currentStatus}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.updating}
              </>
            ) : (
              t.update
            )}
          </Button>
        </div>
      </div>

      {/* Tracking Update Card */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Truck className="h-5 w-5 text-amber-600" />
            {t.addTracking}
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.trackingNumber}
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t.trackingPlaceholder}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.trackingUrl}
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder={t.trackingUrlPlaceholder}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <Button
            onClick={() => void handleTrackingUpdate()}
            disabled={isUpdatingTracking || !trackingNumber.trim()}
            variant="outline"
            className="w-full"
          >
            {isUpdatingTracking ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.updating}
              </>
            ) : (
              t.updateTracking
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
