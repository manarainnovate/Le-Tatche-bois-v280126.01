"use client";

import { useState, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { MultiFileUpload } from "@/components/admin/MultiFileUpload";

const translations = {
  fr: {
    replyTo: "Répondre",
    recipient: "Destinataire",
    subject: "Sujet",
    message: "Votre réponse",
    messagePlaceholder: "Écrivez votre réponse ici...",
    send: "Envoyer",
    sending: "Envoi...",
    cancel: "Annuler",
    success: "Réponse envoyée avec succès!",
    successMessage: "Votre réponse a été envoyée à",
    close: "Fermer",
    error: "Erreur lors de l'envoi de la réponse",
    required: "Ce champ est requis",
    attachments: "Pièces jointes",
  },
  en: {
    replyTo: "Reply",
    recipient: "Recipient",
    subject: "Subject",
    message: "Your reply",
    messagePlaceholder: "Write your reply here...",
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
    replyTo: "Responder",
    recipient: "Destinatario",
    subject: "Asunto",
    message: "Tu respuesta",
    messagePlaceholder: "Escribe tu respuesta aquí...",
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
    replyTo: "الرد",
    recipient: "المستلم",
    subject: "الموضوع",
    message: "ردك",
    messagePlaceholder: "اكتب ردك هنا...",
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

      const data = await response.json();

      if (response.ok) {
        // Success - reply was saved (email may or may not have been sent)
        setShowSuccess(true);

        // Log warning if email wasn't sent
        if (data.emailError) {
          console.warn("[ReplyForm] Reply saved but email failed:", data.emailError);
        }

        // Close success modal after 3 seconds and call onSuccess
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess();
        }, 3000);
      } else {
        setError(data.error || t.error);
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
      setError(t.error);
    } finally {
      // ALWAYS reset loading state
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Success Body */}
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t.success}
              </h3>
              <p className="text-gray-600 mb-2">
                {t.successMessage}
              </p>
              <p className="text-lg font-semibold text-amber-600 mb-6">
                {customerEmail}
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onSuccess();
                }}
                className="w-full px-6 py-3 text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Form Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >

          {/* Header */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t.replyTo}</h2>
                  <p className="text-amber-200 text-sm truncate max-w-[300px]">
                    {customerName} · {customerEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Recipient field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.recipient}
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="text-gray-600 text-sm">{customerEmail}</span>
              </div>
            </div>

            {/* Subject field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.subject}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
              />
            </div>

            {/* Message field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.message}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder={t.messagePlaceholder}
                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm resize-y min-h-[150px]"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Footer with buttons */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {isSending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.sending}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t.send}
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
