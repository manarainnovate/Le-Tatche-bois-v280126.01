"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { HoneypotFields } from "@/components/forms/SecurityFields";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Loader2,
  CheckCircle,
  Home,
  DoorOpen,
  LayoutGrid,
  Armchair,
  ArrowUpDown,
  Layers,
  Wrench,
  FileText,
  AlertCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface QuoteFormContentProps {
  locale: string;
  translations: {
    title: string;
    subtitle: string;
    free: string;
    steps: {
      service: string;
      details: string;
      dimensions: string;
      contact: string;
    };
    step1: {
      title: string;
      subtitle: string;
    };
    step2: {
      title: string;
      subtitle: string;
      projectType: string;
      woodType: string;
      style: string;
      styleOptions: {
        traditional: string;
        modern: string;
        mixed: string;
      };
      description: string;
      descriptionPlaceholder: string;
      attachments: string;
      uploadHint: string;
    };
    step3: {
      title: string;
      subtitle: string;
      width: string;
      height: string;
      depth: string;
      quantity: string;
      budget: string;
      budgetOptions: Record<string, string>;
      deadline: string;
    };
    step4: {
      title: string;
      subtitle: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      city: string;
      preferredContact: string;
      contactOptions: {
        email: string;
        phone: string;
        whatsapp: string;
      };
      newsletter: string;
    };
    submit: string;
    submitting: string;
    success: {
      title: string;
      message: string;
      reference: string;
      backHome: string;
    };
    navigation: {
      back: string;
      next: string;
    };
    services: Record<string, { title: string; description: string }>;
    validation: {
      required: string;
      email: string;
      phone: string;
      minLength: string;
    };
  };
}

interface FormData {
  // Step 1
  service: string;
  // Step 2
  woodType: string;
  style: string;
  description: string;
  attachments: File[];
  // Step 3
  width: string;
  height: string;
  depth: string;
  quantity: string;
  budget: string;
  deadline: string;
  // Step 4
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  preferredContact: string;
  newsletter: boolean;
  // Security (honeypot)
  honeypot: string;
  _hp_name: string;
  website: string;
  _timestamp: number;
}

type StepErrors = Record<string, string>;

// ═══════════════════════════════════════════════════════════
// SERVICE ICONS
// ═══════════════════════════════════════════════════════════

const serviceIcons: Record<string, typeof DoorOpen> = {
  doors: DoorOpen,
  windows: LayoutGrid,
  furniture: Armchair,
  stairs: ArrowUpDown,
  ceilings: Layers,
  restoration: Wrench,
};

// ═══════════════════════════════════════════════════════════
// WOOD TYPES
// ═══════════════════════════════════════════════════════════

const woodTypes = [
  { value: "cedre", label: "Cèdre de l'Atlas" },
  { value: "thuya", label: "Thuya" },
  { value: "noyer", label: "Noyer" },
  { value: "chene", label: "Chêne" },
  { value: "acajou", label: "Acajou" },
  { value: "autre", label: "Autre / Je ne sais pas" },
];

// ═══════════════════════════════════════════════════════════
// BUDGET OPTIONS
// ═══════════════════════════════════════════════════════════

const budgetOptions = [
  { value: "under5k", labelKey: "under5k" },
  { value: "5to10k", labelKey: "5to10k" },
  { value: "10to25k", labelKey: "10to25k" },
  { value: "25to50k", labelKey: "25to50k" },
  { value: "over50k", labelKey: "over50k" },
];

// ═══════════════════════════════════════════════════════════
// PROGRESS INDICATOR
// ═══════════════════════════════════════════════════════════

function ProgressIndicator({
  currentStep,
  steps,
  isRTL,
}: {
  currentStep: number;
  steps: string[];
  isRTL: boolean;
}) {
  return (
    <div className="mb-8">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={cn("flex items-center", index < steps.length - 1 && "flex-1")}
            >
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-wood-primary text-white ring-4 ring-wood-primary/20",
                    !isCompleted && !isCurrent && "bg-wood-light text-wood-muted"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 text-center max-w-[80px]",
                    isCurrent ? "text-wood-primary font-medium" : "text-wood-muted"
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-colors",
                    isCompleted ? "bg-green-500" : "bg-wood-light"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function QuoteFormContent({ locale, translations }: QuoteFormContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [errors, setErrors] = useState<StepErrors>({});

  const [formData, setFormData] = useState<FormData>({
    service: "",
    woodType: "",
    style: "",
    description: "",
    attachments: [],
    width: "",
    height: "",
    depth: "",
    quantity: "1",
    budget: "",
    deadline: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    preferredContact: "email",
    newsletter: false,
    // Security (honeypot)
    honeypot: "",
    _hp_name: "",
    website: "",
    _timestamp: 0,
  });

  // Set timestamp on mount (for bot detection)
  useEffect(() => {
    setFormData((prev) => ({ ...prev, _timestamp: Date.now() }));
  }, []);

  const steps = [
    translations.steps.service,
    translations.steps.details,
    translations.steps.dimensions,
    translations.steps.contact,
  ];

  // ─────────────────────────────────────────────────────────
  // FORM HANDLERS
  // ─────────────────────────────────────────────────────────

  const updateFormData = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when field is updated
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      updateFormData("attachments", [...formData.attachments, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    updateFormData(
      "attachments",
      formData.attachments.filter((_, i) => i !== index)
    );
  };

  // ─────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────

  const validateStep = (step: number): boolean => {
    const newErrors: StepErrors = {};

    switch (step) {
      case 0:
        if (!formData.service) {
          newErrors.service = translations.validation.required;
        }
        break;

      case 1:
        if (!formData.woodType) {
          newErrors.woodType = translations.validation.required;
        }
        if (!formData.style) {
          newErrors.style = translations.validation.required;
        }
        if (!formData.description || formData.description.length < 20) {
          newErrors.description = translations.validation.minLength.replace("{min}", "20");
        }
        break;

      case 2:
        if (!formData.budget) {
          newErrors.budget = translations.validation.required;
        }
        break;

      case 3:
        if (!formData.firstName) {
          newErrors.firstName = translations.validation.required;
        }
        if (!formData.lastName) {
          newErrors.lastName = translations.validation.required;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = translations.validation.email;
        }
        if (!formData.phone || formData.phone.length < 10) {
          newErrors.phone = translations.validation.phone;
        }
        if (!formData.city) {
          newErrors.city = translations.validation.required;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ─────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Prepare dimensions string
      const dimensions = [
        formData.width && `L: ${formData.width}cm`,
        formData.height && `H: ${formData.height}cm`,
        formData.depth && `P: ${formData.depth}cm`,
        formData.quantity && `Qté: ${formData.quantity}`,
      ]
        .filter(Boolean)
        .join(", ");

      // Submit to API
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Main data
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerCity: formData.city,
          serviceType: formData.service,
          description: `${formData.description}\n\nStyle: ${formData.style}\nBois: ${formData.woodType}\nContact préféré: ${formData.preferredContact}`,
          dimensions,
          budget: formData.budget,
          deadline: formData.deadline || undefined,
          locale,
          // Security (honeypot)
          honeypot: formData.honeypot,
          _hp_name: formData._hp_name,
          website: formData.website,
          _timestamp: formData._timestamp,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: { reference?: string };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit quote");
      }

      setReferenceNumber(data.data?.reference ?? `DEV-${Date.now().toString(36).toUpperCase()}`);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submit error:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <main className="min-h-screen py-12 md:py-16 bg-gradient-to-b from-green-50/50 to-white">
        <div className="max-w-lg mx-auto px-4">
          <Card className="p-8 md:p-10 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-2">
              {translations.success.title}
            </h1>
            <p className="text-wood-muted mb-6">{translations.success.message}</p>

            {/* Reference Number */}
            <div className="bg-wood-cream/50 rounded-xl p-4 mb-8">
              <span className="text-sm text-wood-muted">{translations.success.reference}</span>
              <p className="text-2xl font-mono font-bold text-wood-primary">{referenceNumber}</p>
            </div>

            {/* Back Home Button */}
            <Link
              href={`/${locale}`}
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "px-6 py-3 rounded-lg font-medium",
                "bg-gradient-to-r from-wood-primary to-wood-secondary",
                "text-white shadow-md hover:brightness-110 transition-all",
                isRTL && "flex-row-reverse"
              )}
            >
              <Home className="w-5 h-5" />
              {translations.success.backHome}
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────
  // RENDER STEPS
  // ─────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────────────────
  // STEP 1: SERVICE SELECTION
  // ─────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <div className={cn("text-center mb-8", isRTL && "font-arabic")}>
        <h2 className="text-xl font-semibold text-wood-dark mb-2">
          {translations.step1.title}
        </h2>
        <p className="text-wood-muted">{translations.step1.subtitle}</p>
      </div>

      {errors.service && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{errors.service}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(translations.services).map(([key, service]) => {
          const Icon = serviceIcons[key] ?? FileText;
          const isSelected = formData.service === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => updateFormData("service", key)}
              className={cn(
                "relative p-4 md:p-6 rounded-xl border-2 transition-all text-center",
                "hover:border-wood-primary hover:shadow-md",
                isSelected
                  ? "border-wood-primary bg-wood-cream/30 shadow-md"
                  : "border-wood-light bg-white"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                  isSelected ? "bg-wood-primary text-white" : "bg-wood-light text-wood-muted"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="font-medium text-wood-dark mb-1">{service.title}</h3>
              <p className="text-xs text-wood-muted line-clamp-2">{service.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // STEP 2: PROJECT DETAILS
  // ─────────────────────────────────────────────────────────

  const renderStep2 = () => (
    <div>
      <div className={cn("text-center mb-8", isRTL && "font-arabic")}>
        <h2 className="text-xl font-semibold text-wood-dark mb-2">
          {translations.step2.title}
        </h2>
        <p className="text-wood-muted">{translations.step2.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Wood Type */}
        <div>
          <label className="block text-sm font-medium text-wood-dark mb-2">
            {translations.step2.woodType} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {woodTypes.map((wood) => (
              <button
                key={wood.value}
                type="button"
                onClick={() => updateFormData("woodType", wood.value)}
                className={cn(
                  "p-3 rounded-lg border-2 text-sm transition-all",
                  formData.woodType === wood.value
                    ? "border-wood-primary bg-wood-cream/30 text-wood-dark"
                    : "border-wood-light hover:border-wood-muted text-wood-muted"
                )}
              >
                {wood.label}
              </button>
            ))}
          </div>
          {errors.woodType && (
            <p className="text-red-500 text-sm mt-1">{errors.woodType}</p>
          )}
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium text-wood-dark mb-2">
            {translations.step2.style} <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(translations.step2.styleOptions).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData("style", key)}
                className={cn(
                  "px-4 py-2 rounded-full border-2 text-sm transition-all",
                  formData.style === key
                    ? "border-wood-primary bg-wood-primary text-white"
                    : "border-wood-light hover:border-wood-muted text-wood-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.style && (
            <p className="text-red-500 text-sm mt-1">{errors.style}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Textarea
            label={translations.step2.description}
            placeholder={translations.step2.descriptionPlaceholder}
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={5}
            required
            error={errors.description}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-wood-dark mb-2">
            {translations.step2.attachments}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed border-wood-light rounded-xl p-6 text-center cursor-pointer",
              "hover:border-wood-primary hover:bg-wood-cream/20 transition-colors"
            )}
          >
            <Upload className="w-8 h-8 text-wood-muted mx-auto mb-2" />
            <p className="text-sm text-wood-muted">{translations.step2.uploadHint}</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Uploaded Files */}
          {formData.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-wood-light/30 rounded-lg"
                >
                  <span className="text-sm text-wood-dark truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-red-100 rounded text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // STEP 3: DIMENSIONS
  // ─────────────────────────────────────────────────────────

  const renderStep3 = () => (
    <div>
      <div className={cn("text-center mb-8", isRTL && "font-arabic")}>
        <h2 className="text-xl font-semibold text-wood-dark mb-2">
          {translations.step3.title}
        </h2>
        <p className="text-wood-muted">{translations.step3.subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label={translations.step3.width}
            type="number"
            placeholder="100"
            value={formData.width}
            onChange={(e) => updateFormData("width", e.target.value)}
            rightIcon={<span className="text-wood-muted text-sm">cm</span>}
          />
          <Input
            label={translations.step3.height}
            type="number"
            placeholder="200"
            value={formData.height}
            onChange={(e) => updateFormData("height", e.target.value)}
            rightIcon={<span className="text-wood-muted text-sm">cm</span>}
          />
          <Input
            label={translations.step3.depth}
            type="number"
            placeholder="5"
            value={formData.depth}
            onChange={(e) => updateFormData("depth", e.target.value)}
            rightIcon={<span className="text-wood-muted text-sm">cm</span>}
          />
        </div>

        {/* Quantity */}
        <Input
          label={translations.step3.quantity}
          type="number"
          min={1}
          value={formData.quantity}
          onChange={(e) => updateFormData("quantity", e.target.value)}
        />

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-wood-dark mb-2">
            {translations.step3.budget} <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {budgetOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  formData.budget === option.value
                    ? "border-wood-primary bg-wood-cream/30"
                    : "border-wood-light hover:border-wood-muted"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    formData.budget === option.value
                      ? "border-wood-primary"
                      : "border-wood-muted"
                  )}
                >
                  {formData.budget === option.value && (
                    <div className="w-3 h-3 rounded-full bg-wood-primary" />
                  )}
                </div>
                <span className="text-wood-dark">
                  {translations.step3.budgetOptions[option.labelKey]}
                </span>
                <input
                  type="radio"
                  name="budget"
                  value={option.value}
                  checked={formData.budget === option.value}
                  onChange={(e) => updateFormData("budget", e.target.value)}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
          {errors.budget && (
            <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
          )}
        </div>

        {/* Deadline */}
        <Input
          label={translations.step3.deadline}
          type="date"
          value={formData.deadline}
          onChange={(e) => updateFormData("deadline", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // STEP 4: CONTACT INFO
  // ─────────────────────────────────────────────────────────

  const renderStep4 = () => (
    <div>
      <div className={cn("text-center mb-8", isRTL && "font-arabic")}>
        <h2 className="text-xl font-semibold text-wood-dark mb-2">
          {translations.step4.title}
        </h2>
        <p className="text-wood-muted">{translations.step4.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label={translations.step4.firstName}
            value={formData.firstName}
            onChange={(e) => updateFormData("firstName", e.target.value)}
            required
            error={errors.firstName}
          />
          <Input
            label={translations.step4.lastName}
            value={formData.lastName}
            onChange={(e) => updateFormData("lastName", e.target.value)}
            required
            error={errors.lastName}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label={translations.step4.email}
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            required
            error={errors.email}
          />
          <Input
            label={translations.step4.phone}
            type="tel"
            placeholder="+212 6XX XXX XXX"
            value={formData.phone}
            onChange={(e) => updateFormData("phone", e.target.value)}
            required
            error={errors.phone}
          />
        </div>

        {/* City */}
        <Input
          label={translations.step4.city}
          value={formData.city}
          onChange={(e) => updateFormData("city", e.target.value)}
          required
          error={errors.city}
        />

        {/* Preferred Contact Method */}
        <div>
          <label className="block text-sm font-medium text-wood-dark mb-2">
            {translations.step4.preferredContact}
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(translations.step4.contactOptions).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData("preferredContact", key)}
                className={cn(
                  "px-4 py-2 rounded-full border-2 text-sm transition-all",
                  formData.preferredContact === key
                    ? "border-wood-primary bg-wood-primary text-white"
                    : "border-wood-light hover:border-wood-muted text-wood-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="pt-4">
          <Checkbox
            label={translations.step4.newsletter}
            checked={formData.newsletter}
            onChange={(checked) => updateFormData("newsletter", checked)}
          />
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen py-8 md:py-12 bg-gradient-to-b from-white to-wood-cream/20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className={cn("text-center mb-8", isRTL && "font-arabic")}>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-2">
            {translations.title}
          </h1>
          <p className="text-wood-muted">{translations.subtitle}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            {translations.free}
          </span>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} steps={steps} isRTL={isRTL} />

        {/* Form Card */}
        <Card className="p-6 md:p-8">
          {/* Honeypot fields for bot protection */}
          <HoneypotFields />

          {/* General submission error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          {renderStep()}

          {/* Navigation Buttons */}
          <div
            className={cn(
              "flex justify-between mt-8 pt-6 border-t border-wood-light",
              isRTL && "flex-row-reverse"
            )}
          >
            {/* Back Button */}
            <button
              type="button"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                "border-2 border-wood-light text-wood-dark",
                "hover:bg-wood-light/30 disabled:opacity-50 disabled:cursor-not-allowed",
                isRTL && "flex-row-reverse"
              )}
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              {translations.navigation.back}
            </button>

            {/* Next / Submit Button */}
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium",
                  "bg-gradient-to-r from-wood-primary to-wood-secondary",
                  "text-white shadow-md hover:brightness-110 transition-all",
                  isRTL && "flex-row-reverse"
                )}
              >
                {translations.navigation.next}
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium",
                  "bg-gradient-to-r from-green-500 to-green-600",
                  "text-white shadow-md hover:brightness-110 transition-all",
                  "disabled:opacity-70 disabled:cursor-not-allowed",
                  isRTL && "flex-row-reverse"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {translations.submitting}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {translations.submit}
                  </>
                )}
              </button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

QuoteFormContent.displayName = "QuoteFormContent";
