"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Send, Loader2, X, CheckCircle } from "lucide-react";
import { MultiFileUpload } from "@/components/admin/MultiFileUpload";

const translations = {
  fr: {
    replyTo: "Répondre à",
    subject: "Sujet",
    message: "Votre message",
    send: "Envoyer",
    sending: "Envoi en cours...",
    cancel: "Annuler",
    success: "Réponse envoyée avec succès!",
    successMessage: "Votre réponse a été envoyée à",
    close: "Fermer",
    error: "Erreur lors de l'envoi de la réponse",
    required: "Ce champ est requis",
    attachments: "Pièces jointes",
  },
  en: {
    replyTo: "Reply to",
    subject: "Subject",
    message: "Your message",
    send: "Send",
    sending: "Sending...",
    cancel: "Cancel",
    success: "Reply sent successfully!",
    successMessage: "Your reply has been sent to",
    close: "Close",
    error: "Failed to send reply",
    required: "This field is required",
    attachments: "Attachments",
  },
  es: {
    replyTo: "Responder a",
    subject: "Asunto",
    message: "Tu mensaje",
    send: "Enviar",
    sending: "Enviando...",
    cancel: "Cancelar",
    success: "¡Respuesta enviada con éxito!",
    successMessage: "Tu respuesta ha sido enviada a",
    close: "Cerrar",
    error: "Error al enviar la respuesta",
    required: "Este campo es obligatorio",
    attachments: "Archivos adjuntos",
  },
  ar: {
    replyTo: "الرد على",
    subject: "الموضوع",
    message: "رسالتك",
    send: "إرسال",
    sending: "جاري الإرسال...",
    cancel: "إلغاء",
    success: "تم إرسال الرد بنجاح!",
    successMessage: "تم إرسال ردك إلى",
    close: "إغلاق",
    error: "فشل إرسال الرد",
    required: "هذا الحقل مطلوب",
    attachments: "المرفقات",
  },
};

interface ReplyFormProps {
  customerEmail: string;
  customerName: string;
  originalSubject: string | null;
  messageId: string;
  locale: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReplyForm({
  customerEmail,
  customerName,
  originalSubject,
  messageId,
  locale,
  onClose,
  onSuccess,
}: ReplyFormProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [subject, setSubject] = useState(
    originalSubject ? `Re: ${originalSubject}` : "Re: "
  );
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Array<{name: string; url: string; size: number; type: string}>>([]);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError(t.required);
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const response = await fetch(`/api/messages/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: customerEmail,
          subject,
          message,
          attachments,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        // Close success modal after 3 seconds and call onSuccess
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess();
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || t.error);
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
      setError(t.error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-800 animate-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                {t.success}
              </h3>
              <p className="mb-2 text-gray-600 dark:text-gray-400">
                {t.successMessage}
              </p>
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                {customerEmail}
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onSuccess();
                }}
                className="mt-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Form */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200"
        >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t.replyTo}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {customerName} · {customerEmail}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/50 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} className="p-8">
          <div className="space-y-5">
            {/* To */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                To
              </label>
              <input
                type="email"
                value={customerEmail}
                disabled
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.subject}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-amber-400"
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.message}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-amber-400"
                placeholder={t.message}
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.attachments}
              </label>
              <MultiFileUpload
                value={attachments}
                onChange={setAttachments}
                maxSize={100}
                maxFiles={10}
                locale={locale}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm dark:bg-red-900/20 dark:text-red-400">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2.5 font-semibold"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSending}
              className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-2.5 font-semibold shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="me-2 h-5 w-5 animate-spin" />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send className="me-2 h-5 w-5" />
                  {t.send}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
