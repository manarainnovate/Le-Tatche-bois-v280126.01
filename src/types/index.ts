export type Locale = "fr" | "en" | "es" | "ar";
export type Currency = "MAD" | "EUR" | "USD" | "GBP";
export type UserRole = "ADMIN" | "EDITOR" | "SALES";
export type CategoryType = "PROJECT" | "PRODUCT" | "SERVICE";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "ON_ORDER";
export type QuoteStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "SENT"
  | "WON"
  | "LOST"
  | "CANCELLED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentMethod = "STRIPE" | "COD";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface TranslatedField {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  name: string;
  rate: number;
  position: "before" | "after";
}
