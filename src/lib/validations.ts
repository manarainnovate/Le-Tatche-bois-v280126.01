import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// COMMON SCHEMAS
// ═══════════════════════════════════════════════════════════

export const emailSchema = z.string().email("Invalid email address").min(1, "Email is required");

export const phoneSchema = z
  .string()
  .min(1, "Phone is required")
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number");

export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only");

export const localeSchema = z.enum(["fr", "en", "es", "ar"]);

export const currencySchema = z.enum(["MAD", "EUR", "USD", "GBP"]);

export const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const sortSchema = z.object({
  sort: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// QUOTE SCHEMAS
// ═══════════════════════════════════════════════════════════

export const quoteServiceTypeSchema = z.enum([
  "CUSTOM_FURNITURE",
  "INTERIOR_DESIGN",
  "RENOVATION",
  "RESTORATION",
  "DOORS_WINDOWS",
  "FLOORING",
  "OTHER",
]);

export const quoteStyleSchema = z.enum([
  "MODERN",
  "TRADITIONAL",
  "RUSTIC",
  "CONTEMPORARY",
  "CLASSIC",
  "OTHER",
]);

export const quoteBudgetSchema = z.enum([
  "LESS_5000",
  "5000_15000",
  "15000_30000",
  "30000_50000",
  "MORE_50000",
  "NOT_SPECIFIED",
]);

export const quoteStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "SENT",
  "WON",
  "LOST",
  "CANCELLED",
]);

export const createQuoteSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  customerCity: z.string().max(100).optional(),
  customerCompany: z.string().max(100).optional(),

  serviceId: z.string().cuid().optional(),
  serviceType: z.string().max(100).optional(),

  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  dimensions: z.string().max(200).optional(),
  budget: z.string().max(50).optional(),
  deadline: z.coerce.date().optional(),

  attachments: z.array(z.string().url()).max(5).optional(),
  locale: localeSchema.default("fr"),
});

export const updateQuoteSchema = z.object({
  status: quoteStatusSchema.optional(),
  assignedToId: z.string().cuid().nullable().optional(),
  customerName: z.string().min(2).max(100).optional(),
  customerEmail: emailSchema.optional(),
  customerPhone: phoneSchema.optional(),
  customerCity: z.string().max(100).optional(),
  customerCompany: z.string().max(100).optional(),
  description: z.string().min(10).max(2000).optional(),
  dimensions: z.string().max(200).optional(),
  budget: z.string().max(50).optional(),
  deadline: z.coerce.date().nullable().optional(),
});

export const quoteNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(1000),
  isPrivate: z.boolean().default(true),
});

// ═══════════════════════════════════════════════════════════
// MESSAGE SCHEMAS
// ═══════════════════════════════════════════════════════════

export const messageSubjectSchema = z.enum([
  "GENERAL",
  "QUOTE_REQUEST",
  "ORDER_INQUIRY",
  "SUPPORT",
  "PARTNERSHIP",
  "OTHER",
]);

export const createMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().max(200).optional(),
  content: z.string().min(10, "Message must be at least 10 characters").max(2000),
  locale: localeSchema.default("fr"),
});

export const updateMessageSchema = z.object({
  read: z.boolean().optional(),
  starred: z.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════
// ORDER SCHEMAS
// ═══════════════════════════════════════════════════════════

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export const paymentMethodSchema = z.enum(["STRIPE", "COD"]);

export const paymentStatusSchema = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);

export const orderItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().max(99),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: phoneSchema,
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(50).default("Morocco"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
  customerNote: z.string().max(500).optional(),
  locale: localeSchema.default("fr"),
});

export const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  trackingNumber: z.string().max(100).optional(),
  adminNote: z.string().max(500).optional(),
});

// ═══════════════════════════════════════════════════════════
// CART SCHEMAS
// ═══════════════════════════════════════════════════════════

export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().max(99).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(99),
});

// ═══════════════════════════════════════════════════════════
// PRODUCT SCHEMAS
// ═══════════════════════════════════════════════════════════

export const stockStatusSchema = z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK", "ON_ORDER"]);

export const productTranslationSchema = z.object({
  locale: localeSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  description: z.string().max(5000).optional(),
  shortDesc: z.string().max(500).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const createProductSchema = z.object({
  slug: slugSchema.optional(),
  sku: z.string().max(50).optional(),
  categoryId: z.string().cuid(),

  priceMAD: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().positive().optional(),

  stockStatus: stockStatusSchema.default("IN_STOCK"),
  stockQty: z.coerce.number().int().min(0).default(0),

  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  status: statusSchema.default("DRAFT"),

  dimensions: z.string().max(100).optional(),
  weight: z.coerce.number().positive().optional(),
  woodType: z.string().max(100).optional(),
  finish: z.string().max(100).optional(),

  images: z.array(z.string().url()).max(10).optional(),
  specifications: z.record(z.string(), z.string()).optional(),

  translations: z.array(productTranslationSchema).min(1, "At least one translation is required"),
});

export const updateProductSchema = createProductSchema.partial().omit({ translations: true }).extend({
  translations: z.array(productTranslationSchema).optional(),
});

// ═══════════════════════════════════════════════════════════
// PROJECT SCHEMAS
// ═══════════════════════════════════════════════════════════

export const projectTranslationSchema = z.object({
  locale: localeSchema,
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().max(5000).optional(),
  challenge: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const createProjectSchema = z.object({
  slug: slugSchema.optional(),
  categoryId: z.string().cuid(),

  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  status: statusSchema.default("DRAFT"),

  client: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  duration: z.string().max(50).optional(),
  surface: z.string().max(50).optional(),
  woodType: z.string().max(100).optional(),

  images: z.array(z.string().url()).max(20).optional(),

  translations: z.array(projectTranslationSchema).min(1, "At least one translation is required"),
});

export const updateProjectSchema = createProjectSchema.partial().omit({ translations: true }).extend({
  translations: z.array(projectTranslationSchema).optional(),
});

// ═══════════════════════════════════════════════════════════
// SERVICE SCHEMAS
// ═══════════════════════════════════════════════════════════

export const serviceTranslationSchema = z.object({
  locale: localeSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  description: z.string().max(5000).optional(),
  features: z.array(z.string().max(200)).max(20).optional(),
  process: z.string().max(5000).optional(),
});

export const createServiceSchema = z.object({
  slug: slugSchema.optional(),
  categoryId: z.string().cuid().optional(),

  priceFrom: z.coerce.number().positive().optional(),
  priceTo: z.coerce.number().positive().optional(),
  priceUnit: z.string().max(50).optional(),

  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  status: statusSchema.default("DRAFT"),

  icon: z.string().max(50).optional(),
  image: z.string().url().optional(),
  duration: z.string().max(50).optional(),

  translations: z.array(serviceTranslationSchema).min(1, "At least one translation is required"),
});

export const updateServiceSchema = createServiceSchema.partial().omit({ translations: true }).extend({
  translations: z.array(serviceTranslationSchema).optional(),
});

// ═══════════════════════════════════════════════════════════
// CATEGORY SCHEMAS
// ═══════════════════════════════════════════════════════════

export const categoryTranslationSchema = z.object({
  locale: localeSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
});

export const createCategorySchema = z.object({
  slug: slugSchema.optional(),
  image: z.string().url().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  parentId: z.string().cuid().optional(),

  translations: z.array(categoryTranslationSchema).min(1, "At least one translation is required"),
});

export const updateCategorySchema = createCategorySchema.partial().omit({ translations: true }).extend({
  translations: z.array(categoryTranslationSchema).optional(),
});

// ═══════════════════════════════════════════════════════════
// USER SCHEMAS
// ═══════════════════════════════════════════════════════════

export const userRoleSchema = z.enum(["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER", "COMPTABLE", "READONLY"]);

export const createUserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2).max(100).optional(),
  role: userRoleSchema.default("COMMERCIAL"),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .optional(),
  name: z.string().min(2).max(100).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  image: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ═══════════════════════════════════════════════════════════
// ADDRESS SCHEMAS
// ═══════════════════════════════════════════════════════════

export const createAddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(2).max(100),
  phone: phoneSchema,
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(50).default("Morocco"),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

// ═══════════════════════════════════════════════════════════
// SETTINGS SCHEMAS
// ═══════════════════════════════════════════════════════════

export const updateSettingsSchema = z.object({
  group: z.string().min(1).max(50),
  key: z.string().min(1).max(50),
  value: z.unknown(),
});

export const currencySettingsSchema = z.object({
  code: z.string().length(3),
  symbol: z.string().max(5),
  name: z.string().max(50),
  rate: z.coerce.number().positive(),
  locale: z.string().max(10),
  position: z.enum(["before", "after"]).default("after"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// ═══════════════════════════════════════════════════════════
// NEWSLETTER SCHEMAS
// ═══════════════════════════════════════════════════════════

export const newsletterSubscribeSchema = z.object({
  email: emailSchema,
  locale: localeSchema.default("fr"),
  source: z.string().max(50).optional(),
});

// ═══════════════════════════════════════════════════════════
// CONSENT SCHEMAS
// ═══════════════════════════════════════════════════════════

export const consentSchema = z.object({
  visitorId: z.string().min(1),
  essential: z.boolean().default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
});

// ═══════════════════════════════════════════════════════════
// MEDIA/UPLOAD SCHEMAS
// ═══════════════════════════════════════════════════════════

export const uploadQuerySchema = z.object({
  folder: z.string().max(100).optional(),
  type: z.enum(["image", "document"]).default("image"),
});

// ═══════════════════════════════════════════════════════════
// QUERY SCHEMAS
// ═══════════════════════════════════════════════════════════

export const categoryQuerySchema = paginationSchema.extend({
  parentId: z.string().cuid().optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  locale: localeSchema.optional(),
});

export const productQuerySchema = paginationSchema.extend({
  categoryId: z.string().cuid().optional(),
  status: statusSchema.optional(),
  stockStatus: stockStatusSchema.optional(),
  featured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().max(100).optional(),
  locale: localeSchema.optional(),
  sort: z.string().optional(),
});

export const projectQuerySchema = paginationSchema.extend({
  categoryId: z.string().cuid().optional(),
  status: statusSchema.optional(),
  featured: z.coerce.boolean().optional(),
  year: z.coerce.number().int().optional(),
  search: z.string().max(100).optional(),
  locale: localeSchema.optional(),
  sort: z.string().optional(),
});

export const serviceQuerySchema = paginationSchema.extend({
  categoryId: z.string().cuid().optional(),
  status: statusSchema.optional(),
  featured: z.coerce.boolean().optional(),
  locale: localeSchema.optional(),
  sort: z.string().optional(),
});

export const quoteQuerySchema = paginationSchema.extend({
  status: quoteStatusSchema.optional(),
  assignedToId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  sort: z.string().optional(),
});

export const orderQuerySchema = paginationSchema.extend({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  userId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  sort: z.string().optional(),
});

export const messageQuerySchema = paginationSchema.extend({
  read: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sort: z.string().optional(),
});

export const userQuerySchema = paginationSchema.extend({
  role: userRoleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sort: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// LEGACY FORM SCHEMAS (Backward Compatibility)
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

export type LoginFormData = z.infer<typeof loginSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// ═══════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type QuoteNoteInput = z.infer<typeof quoteNoteSchema>;

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductTranslationInput = z.infer<typeof productTranslationSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectTranslationInput = z.infer<typeof projectTranslationSchema>;

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceTranslationInput = z.infer<typeof serviceTranslationSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryTranslationInput = z.infer<typeof categoryTranslationSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type CurrencySettingsInput = z.infer<typeof currencySettingsSchema>;

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;

export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
export type QuoteQueryInput = z.infer<typeof quoteQuerySchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type MessageQueryInput = z.infer<typeof messageQuerySchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
