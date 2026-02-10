import Stripe from "stripe";

// Stripe instance - will be null if not configured
export const stripe = process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY !== "sk_test_placeholder"
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  : null;

// Helper to check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return stripe !== null;
};

export default stripe;
