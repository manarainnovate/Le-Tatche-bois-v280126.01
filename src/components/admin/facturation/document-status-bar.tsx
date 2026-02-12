"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  CheckCircle,
  XCircle,
  Send,
  BadgeCheck,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Eye,
  Download,
  Printer,
  Pencil,
} from "lucide-react";
import { AdminButton } from "@/components/ui/admin-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface StatusAction {
  targetStatus: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "primary" | "success" | "danger" | "outline";
  confirmMessage?: string;
  requiresReason?: boolean;
}

interface WorkflowStep {
  status: string;
  label: string;
}

interface DocumentStatusBarProps {
  document: {
    id: string;
    type: string;
    number: string;
    status: string;
    confirmedAt?: Date | null;
    sentAt?: Date | null;
    paidAt?: Date | null;
    cancelledAt?: Date | null;
    cancellationReason?: string | null;
    isDraft?: boolean;
    isLocked?: boolean;
  };
  locale: string;
  basePath: string;
  onStatusChange?: (newStatus: string) => void;
}

// ═══════════════════════════════════════════════════════════
// Workflow Steps by Document Type
// ═══════════════════════════════════════════════════════════

function getWorkflowSteps(docType: string): WorkflowStep[] {
  switch (docType) {
    case "FACTURE":
    case "FACTURE_ACOMPTE":
      return [
        { status: "DRAFT", label: "Brouillon" },
        { status: "CONFIRMED", label: "Validé" },
        { status: "SENT", label: "Envoyé" },
        { status: "PAID", label: "Payé" },
      ];
    case "DEVIS":
      return [
        { status: "DRAFT", label: "Brouillon" },
        { status: "CONFIRMED", label: "Validé" },
        { status: "SENT", label: "Envoyé" },
        { status: "ACCEPTED", label: "Accepté" },
      ];
    case "BON_COMMANDE":
      return [
        { status: "DRAFT", label: "Brouillon" },
        { status: "CONFIRMED", label: "Validé" },
        { status: "DELIVERED", label: "Livré" },
      ];
    case "BON_LIVRAISON":
      return [
        { status: "DRAFT", label: "Brouillon" },
        { status: "CONFIRMED", label: "Validé" },
        { status: "DELIVERED", label: "Livré" },
        { status: "SIGNED", label: "Signé" },
      ];
    case "PV_RECEPTION":
      return [
        { status: "DRAFT", label: "Brouillon" },
        { status: "CONFIRMED", label: "Validé" },
        { status: "SIGNED", label: "Signé" },
      ];
    case "AVOIR":
      return [
        { status: "DRAFT", label: "Brouillon" },
        { status: "CONFIRMED", label: "Validé" },
      ];
    default:
      return [
        { status: "DRAFT", label: "Brouillon" },
        { status: "CONFIRMED", label: "Validé" },
      ];
  }
}

function getStepIndex(status: string, docType: string): number {
  const steps = getWorkflowSteps(docType);
  const idx = steps.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

// ═══════════════════════════════════════════════════════════
// Available Actions by Status
// ═══════════════════════════════════════════════════════════

function getStatusActions(status: string, docType: string): StatusAction[] {
  const actions: StatusAction[] = [];

  switch (status) {
    case "DRAFT":
      actions.push({
        targetStatus: "CONFIRMED",
        label: "Valider",
        icon: CheckCircle,
        variant: "success",
        confirmMessage: "Valider ce document ? Un numéro officiel sera attribué.",
      });
      actions.push({
        targetStatus: "CANCELLED",
        label: "Annuler",
        icon: XCircle,
        variant: "danger",
        confirmMessage: "Annuler ce document ?",
        requiresReason: false,
      });
      break;

    case "CONFIRMED":
      actions.push({
        targetStatus: "SENT",
        label: "Marquer envoyé",
        icon: Send,
        variant: "primary",
      });
      actions.push({
        targetStatus: "CANCELLED",
        label: "Annuler",
        icon: XCircle,
        variant: "danger",
        requiresReason: true,
      });
      break;

    case "SENT":
      if (docType === "FACTURE" || docType === "FACTURE_ACOMPTE") {
        actions.push({
          targetStatus: "PAID",
          label: "Marquer payé",
          icon: BadgeCheck,
          variant: "success",
        });
      }
      if (docType === "DEVIS") {
        actions.push({
          targetStatus: "ACCEPTED",
          label: "Accepté",
          icon: ThumbsUp,
          variant: "success",
        });
        actions.push({
          targetStatus: "REJECTED",
          label: "Refusé",
          icon: ThumbsDown,
          variant: "danger",
        });
      }
      actions.push({
        targetStatus: "CANCELLED",
        label: "Annuler",
        icon: XCircle,
        variant: "danger",
        requiresReason: true,
      });
      break;

    case "ACCEPTED":
      if (docType === "DEVIS") {
        // No status action - user will create BC/Facture from UI
      }
      break;

    case "PARTIAL":
      if (docType === "FACTURE" || docType === "FACTURE_ACOMPTE") {
        actions.push({
          targetStatus: "PAID",
          label: "Marquer payé",
          icon: BadgeCheck,
          variant: "success",
        });
      }
      break;
  }

  return actions;
}

// ═══════════════════════════════════════════════════════════
// Format Date Helper
// ═══════════════════════════════════════════════════════════

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ═══════════════════════════════════════════════════════════
// DocumentStatusBar Component
// ═══════════════════════════════════════════════════════════

export function DocumentStatusBar({
  document,
  locale,
  basePath,
  onStatusChange,
}: DocumentStatusBarProps) {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusActions = getStatusActions(document.status, document.type);
  const workflowSteps = getWorkflowSteps(document.type);
  const currentStepIndex = getStepIndex(document.status, document.type);
  const isCancelled = document.status === "CANCELLED";

  const handleStatusChange = (action: StatusAction) => {
    if (action.confirmMessage || action.requiresReason) {
      setPendingAction(action);
      setShowConfirmModal(true);
    } else {
      executeStatusChange(action.targetStatus);
    }
  };

  const executeStatusChange = async (targetStatus: string, reason?: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/crm/documents/${document.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.details) {
          setError(`Validation échouée : ${data.details.join(", ")}`);
        } else {
          setError(data.error || "Erreur de mise à jour");
        }
        return;
      }

      // Success - refresh page
      if (onStatusChange) {
        onStatusChange(targetStatus);
      }
      router.refresh();
      setShowConfirmModal(false);
      setPendingAction(null);
      setCancellationReason("");
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-2">
            {workflowSteps.map((step, i, arr) => {
              const isCurrent = step.status === document.status;
              const isPast = currentStepIndex > i;
              const isCancelledStep = isCancelled && !isPast;

              return (
                <div key={step.status} className="flex items-center gap-2 flex-1">
                  {/* Step circle */}
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      isCancelledStep && "opacity-40"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0",
                        isPast &&
                          "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30",
                        isCurrent &&
                          !isCancelled &&
                          "bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-4 ring-amber-100 dark:ring-amber-900/30",
                        isCurrent &&
                          isCancelled &&
                          "bg-red-500 text-white shadow-sm shadow-red-500/30",
                        !isPast &&
                          !isCurrent &&
                          "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {isPast ? (
                        <Check className="w-4 h-4" />
                      ) : isCurrent && isCancelled ? (
                        <X className="w-4 h-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isPast && "text-emerald-700 dark:text-emerald-300",
                        isCurrent && "text-gray-900 dark:text-white",
                        !isPast && !isCurrent && "text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector line */}
                  {i < arr.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-1",
                        isPast
                          ? "bg-emerald-400 dark:bg-emerald-600"
                          : "bg-gray-200 dark:bg-gray-600"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status badge */}
            <StatusBadge status={document.status} locale={locale} />

            {/* Timestamps */}
            {document.confirmedAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Validé le {formatDate(document.confirmedAt)}
              </span>
            )}
            {document.sentAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Envoyé le {formatDate(document.sentAt)}
              </span>
            )}
            {document.paidAt && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                Payé le {formatDate(document.paidAt)}
              </span>
            )}
            {document.cancelledAt && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Annulé le {formatDate(document.cancelledAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Document actions (always available) */}
            <AdminButton
              variant="outline"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={() =>
                window.open(`/api/crm/documents/${document.id}/pdf`, "_blank")
              }
            >
              Aperçu
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() =>
                window.open(`/api/crm/documents/${document.id}/pdf?download=true`, "_blank")
              }
            >
              PDF
            </AdminButton>

            {/* Edit button — only in DRAFT */}
            {document.status === "DRAFT" && (
              <AdminButton
                variant="outline"
                size="sm"
                icon={<Pencil className="w-4 h-4" />}
                onClick={() => router.push(`${basePath}/${document.id}/edit`)}
              >
                Modifier
              </AdminButton>
            )}

            {/* Divider */}
            {statusActions.length > 0 && (
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-600" />
            )}

            {/* STATUS WORKFLOW BUTTONS */}
            {statusActions.map((action) => (
              <AdminButton
                key={action.targetStatus}
                variant={action.variant}
                size="sm"
                icon={<action.icon className="w-4 h-4" />}
                onClick={() => handleStatusChange(action)}
              >
                {action.label}
              </AdminButton>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && pendingAction && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              {/* Icon */}
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4",
                  pendingAction.variant === "danger" &&
                    "bg-red-100 dark:bg-red-900/30",
                  pendingAction.variant === "success" &&
                    "bg-emerald-100 dark:bg-emerald-900/30",
                  pendingAction.variant === "primary" &&
                    "bg-blue-100 dark:bg-blue-900/30"
                )}
              >
                <pendingAction.icon
                  className={cn(
                    "w-7 h-7",
                    pendingAction.variant === "danger" &&
                      "text-red-600 dark:text-red-400",
                    pendingAction.variant === "success" &&
                      "text-emerald-600 dark:text-emerald-400",
                    pendingAction.variant === "primary" &&
                      "text-blue-600 dark:text-blue-400"
                  )}
                />
              </div>

              <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                {pendingAction.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                {pendingAction.confirmMessage ||
                  `Êtes-vous sûr de vouloir ${pendingAction.label.toLowerCase()} ce document ?`}
              </p>

              {/* Document info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {document.number}
                </p>
              </div>

              {/* Cancellation reason */}
              {pendingAction.requiresReason && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5 block">
                    Motif d'annulation <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={3}
                    placeholder="Précisez la raison de l'annulation..."
                    className="w-full px-4 py-3 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 resize-none"
                    autoFocus
                  />
                </div>
              )}

              {/* Warning for CONFIRMED */}
              {pendingAction.targetStatus === "CONFIRMED" && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ Un numéro officiel sera attribué. Le document ne pourra plus
                    être modifié après validation.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex justify-end gap-3">
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
                  setCancellationReason("");
                }}
                disabled={isUpdating}
              >
                Annuler
              </AdminButton>
              <AdminButton
                variant={pendingAction.variant}
                size="sm"
                loading={isUpdating}
                disabled={
                  pendingAction.requiresReason && !cancellationReason.trim()
                }
                onClick={() =>
                  executeStatusChange(
                    pendingAction.targetStatus,
                    cancellationReason || undefined
                  )
                }
                icon={<pendingAction.icon className="w-4 h-4" />}
              >
                {pendingAction.label}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
