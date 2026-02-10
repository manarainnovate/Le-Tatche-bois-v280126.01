"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { cn, hexToRgba } from "@/lib/utils";
import { useThemeSettings } from "@/stores/themeSettings";
import { HoneypotFields } from "@/components/forms/SecurityFields";
import { CONTACT, getPhoneLink, getEmailLink, getWhatsAppLink } from "@/config/contact";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ContactTranslations {
  title: string;
  subtitle: string;
  form: {
    title: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    subjectOptions: {
      general: string;
      quote: string;
      order: string;
      partnership: string;
      other: string;
    };
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    successMessage: string;
    error: string;
    errorMessage: string;
  };
  info: {
    title: string;
    address: {
      label: string;
      value: string;
      city: string;
      viewOnMap: string;
    };
    phone: {
      label: string;
      value: string;
      whatsapp: string;
    };
    email: {
      label: string;
      value: string;
    };
    hours: {
      label: string;
      weekdays: string;
      saturday: string;
      sunday: string;
    };
  };
  map: {
    title: string;
  };
  social: {
    title: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
  whatsapp: {
    button: string;
    message: string;
  };
  validation: {
    required: string;
    email: string;
    phone: string;
    minLength: string;
  };
}

interface ContactContentProps {
  locale: string;
  translations: ContactTranslations;
  mapEmbedUrl?: string;
}

// ═══════════════════════════════════════════════════════════
// FORM STATE
// ═══════════════════════════════════════════════════════════

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  // Security (honeypot)
  honeypot: string;
  _hp_name: string;
  website: string;
  _timestamp: number;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTS (using centralized config)
// ═══════════════════════════════════════════════════════════

const PHONE_NUMBER = CONTACT.phone.display;
const EMAIL_ADDRESS = CONTACT.email.main;
const GOOGLE_MAPS_EMBED_URL = CONTACT.maps.embedUrl;
const GOOGLE_MAPS_LINK = CONTACT.maps.link;
const SOCIAL_LINKS = CONTACT.social;

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function ContactContent({ locale, translations, mapEmbedUrl }: ContactContentProps) {
  const isRTL = locale === "ar";
  const theme = useThemeSettings();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    // Security (honeypot)
    honeypot: "",
    _hp_name: "",
    website: "",
    _timestamp: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Set timestamp on mount (for bot detection)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, _timestamp: Date.now() }));
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = translations.validation.required;
    }

    if (!formData.email.trim()) {
      newErrors.email = translations.validation.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = translations.validation.email;
    }

    if (formData.phone && !/^[+]?[\d\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = translations.validation.phone;
    }

    if (!formData.subject) {
      newErrors.subject = translations.validation.required;
    }

    if (!formData.message.trim()) {
      newErrors.message = translations.validation.required;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = translations.validation.minLength.replace("{min}", "10");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.subject,
          content: formData.message,
          locale,
          // Security (honeypot)
          honeypot: formData.honeypot,
          _hp_name: formData._hp_name,
          website: formData.website,
          _timestamp: formData._timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit message");
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        honeypot: "",
        _hp_name: "",
        website: "",
        _timestamp: Date.now(),
      });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp link
  const whatsappLink = getWhatsAppLink(translations.whatsapp.message);

  return (
    <main className={cn("min-h-screen bg-wood-light", isRTL && "rtl")}>
      {/* Hero Section */}
      <section
        className="relative py-20 lg:py-28"
        style={{
          ...(theme.contactHero.type === "image" && theme.contactHero.image
            ? { backgroundImage: `url(${theme.contactHero.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: theme.contactHero.color }),
        }}
      >
        {/* Overlay */}
        {theme.contactHero.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.contactHero.overlayColor, theme.contactHero.overlayOpacity / 100) }} />
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: theme.contactHero.titleColor }}
            >
              {translations.title}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl"
              style={{ color: theme.contactHero.bodyColor }}
            >
              {translations.subtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className="relative py-16 lg:py-24"
        style={{
          ...(theme.contactForm.type === "image" && theme.contactForm.image
            ? { backgroundImage: `url(${theme.contactForm.image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { backgroundColor: theme.contactForm.color }),
        }}
      >
        {theme.contactForm.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.contactForm.overlayColor, theme.contactForm.overlayOpacity / 100) }} />
        )}
        <div className="relative container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10">
                <h2 className="text-2xl lg:text-3xl font-bold text-wood-dark mb-8">
                  {translations.form.title}
                </h2>

                {/* Success Message */}
                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">
                        {translations.form.success}
                      </p>
                      <p className="text-green-700 text-sm">
                        {translations.form.successMessage}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">
                        {translations.form.error}
                      </p>
                      <p className="text-red-700 text-sm">
                        {translations.form.errorMessage}
                      </p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                  {/* Honeypot fields for bot protection */}
                  <HoneypotFields />

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-wood-dark mb-2"
                    >
                      {translations.form.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={translations.form.namePlaceholder}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl transition-all",
                        "focus:outline-none focus:ring-2 focus:ring-wood-primary/30 focus:border-wood-primary",
                        errors.name
                          ? "border-red-300 bg-red-50"
                          : "border-wood-secondary/30 bg-wood-light/50"
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-wood-dark mb-2"
                      >
                        {translations.form.email} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={translations.form.emailPlaceholder}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl transition-all",
                          "focus:outline-none focus:ring-2 focus:ring-wood-primary/30 focus:border-wood-primary",
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-wood-secondary/30 bg-wood-light/50"
                        )}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-wood-dark mb-2"
                      >
                        {translations.form.phone}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={translations.form.phonePlaceholder}
                        dir="ltr"
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl transition-all",
                          "focus:outline-none focus:ring-2 focus:ring-wood-primary/30 focus:border-wood-primary",
                          errors.phone
                            ? "border-red-300 bg-red-50"
                            : "border-wood-secondary/30 bg-wood-light/50",
                          isRTL && "text-left"
                        )}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-wood-dark mb-2"
                    >
                      {translations.form.subject} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={cn(
                          "w-full px-4 py-3 border rounded-xl transition-all appearance-none cursor-pointer",
                          "focus:outline-none focus:ring-2 focus:ring-wood-primary/30 focus:border-wood-primary",
                          errors.subject
                            ? "border-red-300 bg-red-50"
                            : "border-wood-secondary/30 bg-wood-light/50",
                          !formData.subject && "text-wood-muted"
                        )}
                      >
                        <option value="">{translations.form.subjectPlaceholder}</option>
                        <option value="general">
                          {translations.form.subjectOptions.general}
                        </option>
                        <option value="quote">
                          {translations.form.subjectOptions.quote}
                        </option>
                        <option value="order">
                          {translations.form.subjectOptions.order}
                        </option>
                        <option value="partnership">
                          {translations.form.subjectOptions.partnership}
                        </option>
                        <option value="other">
                          {translations.form.subjectOptions.other}
                        </option>
                      </select>
                      <ChevronDown
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-wood-muted pointer-events-none",
                          isRTL ? "left-4" : "right-4"
                        )}
                      />
                    </div>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-wood-dark mb-2"
                    >
                      {translations.form.message} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder={translations.form.messagePlaceholder}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl transition-all resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-wood-primary/30 focus:border-wood-primary",
                        errors.message
                          ? "border-red-300 bg-red-50"
                          : "border-wood-secondary/30 bg-wood-light/50"
                      )}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-4 rounded-xl font-semibold text-white transition-all",
                      "bg-wood-primary hover:bg-wood-dark",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {translations.form.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {translations.form.submit}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-wood-dark">
                {translations.info.title}
              </h2>

              {/* Info Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Address Card */}
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className={cn(
                      "flex items-start gap-4",
                      isRTL && "flex-row-reverse text-right"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-wood-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-wood-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-wood-dark mb-1">
                        {translations.info.address.label}
                      </h3>
                      <p className="text-wood-muted text-sm">
                        {translations.info.address.value}
                      </p>
                      <p className="text-wood-muted text-sm mb-2">
                        {translations.info.address.city}
                      </p>
                      <a
                        href={GOOGLE_MAPS_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-wood-primary hover:underline"
                      >
                        {translations.info.address.viewOnMap}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className={cn(
                      "flex items-start gap-4",
                      isRTL && "flex-row-reverse text-right"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-wood-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-wood-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-wood-dark mb-1">
                        {translations.info.phone.label}
                      </h3>
                      <a
                        href={getPhoneLink()}
                        className="text-wood-muted text-sm hover:text-wood-primary transition-colors block mb-2"
                        dir="ltr"
                      >
                        {PHONE_NUMBER}
                      </a>
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {translations.info.phone.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className={cn(
                      "flex items-start gap-4",
                      isRTL && "flex-row-reverse text-right"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-wood-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-wood-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-wood-dark mb-1">
                        {translations.info.email.label}
                      </h3>
                      <a
                        href={getEmailLink()}
                        className="text-wood-muted text-sm hover:text-wood-primary transition-colors break-all"
                      >
                        {EMAIL_ADDRESS}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className={cn(
                      "flex items-start gap-4",
                      isRTL && "flex-row-reverse text-right"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-wood-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-wood-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-wood-dark mb-1">
                        {translations.info.hours.label}
                      </h3>
                      <p className="text-wood-muted text-sm">
                        {translations.info.hours.weekdays}
                      </p>
                      <p className="text-wood-muted text-sm">
                        {translations.info.hours.saturday}
                      </p>
                      <p className="text-wood-muted text-sm">
                        {translations.info.hours.sunday}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-wood-dark mb-4">
                  {translations.social.title}
                </h3>
                <div className={cn("flex gap-4", isRTL && "justify-end")}>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                    aria-label={translations.social.facebook}
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                    aria-label={translations.social.instagram}
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                    aria-label={translations.social.youtube}
                  >
                    <Youtube className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-wood-dark text-center mb-8">
              {translations.map.title}
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-lg group">
              <iframe
                src={mapEmbedUrl || GOOGLE_MAPS_EMBED_URL}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="LE TATCHE BOIS Location"
                className="grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed bottom-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full shadow-lg transition-all hover:scale-105",
          isRTL ? "left-6" : "right-6"
        )}
        aria-label={translations.whatsapp.button}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-medium hidden sm:block">{translations.whatsapp.button}</span>
      </a>
    </main>
  );
}
