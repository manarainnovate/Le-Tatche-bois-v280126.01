import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// COMMON SCHEMAS
// ═══════════════════════════════════════════════════════════

export const emailSchema = z.string().email("Email invalide");

export const phoneSchema = z
  .string()
  .regex(/^(\+212|0)[67]\d{8}$/, "Numéro de téléphone invalide");

export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

// ═══════════════════════════════════════════════════════════
// FORM SCHEMAS
// ═══════════════════════════════════════════════════════════

export const contactSchema = z.object({
  name: z.string().min(2, "Minimum 2 caractères"),
  email: emailSchema,
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Minimum 10 caractères"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  serviceType: z.string().min(1, "Sélectionnez un service"),
  description: z.string().min(20, "Minimum 20 caractères"),
  dimensions: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  customerName: z.string().min(2, "Minimum 2 caractères"),
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  customerCity: z.string().optional(),
  customerCompany: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Minimum 2 caractères"),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["STRIPE", "COD"]),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
