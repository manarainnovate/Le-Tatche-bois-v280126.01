"use client";

import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════
// Honeypot Fields Component
// Hidden fields to catch bots that auto-fill all form fields
// ═══════════════════════════════════════════════════════════

interface HoneypotFieldsProps {
  register?: (name: string) => object;
}

export function HoneypotFields({ register }: HoneypotFieldsProps) {
  const [timestamp, setTimestamp] = useState<number>(0);

  useEffect(() => {
    // Set timestamp on mount (client-side only)
    setTimestamp(Date.now());
  }, []);

  return (
    <>
      {/* Honeypot field 1 - hidden visually but accessible to bots */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          opacity: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <label htmlFor="honeypot">Leave this field empty</label>
        <input
          type="text"
          id="honeypot"
          name="honeypot"
          tabIndex={-1}
          autoComplete="off"
          {...(register ? register("honeypot") : {})}
        />
      </div>

      {/* Honeypot field 2 - looks like a name field */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          opacity: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <label htmlFor="_hp_name">Your name</label>
        <input
          type="text"
          id="_hp_name"
          name="_hp_name"
          tabIndex={-1}
          autoComplete="off"
          {...(register ? register("_hp_name") : {})}
        />
      </div>

      {/* Honeypot field 3 - looks like a website field */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          opacity: 0,
          height: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input
          type="url"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          {...(register ? register("website") : {})}
        />
      </div>

      {/* Timestamp field for timing-based bot detection */}
      <input
        type="hidden"
        name="_timestamp"
        value={timestamp}
        {...(register ? register("_timestamp") : {})}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// CSRF Token Component
// ═══════════════════════════════════════════════════════════

interface CsrfFieldProps {
  token?: string;
}

export function CsrfField({ token }: CsrfFieldProps) {
  if (!token) return null;

  return <input type="hidden" name="_csrf" value={token} />;
}

// ═══════════════════════════════════════════════════════════
// CSRF Token Hook
// ═══════════════════════════════════════════════════════════

interface CsrfResponse {
  success: boolean;
  data?: {
    token: string;
    expiresAt: number;
  };
}

export function useCsrfToken() {
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch("/api/security/csrf");
        if (!response.ok) {
          throw new Error("Failed to fetch CSRF token");
        }
        const data = (await response.json()) as CsrfResponse;
        if (data.success && data.data?.token) {
          setToken(data.data.token);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch token");
      } finally {
        setLoading(false);
      }
    }

    void fetchToken();
  }, []);

  return { token, loading, error };
}

// ═══════════════════════════════════════════════════════════
// Combined Security Fields Component
// ═══════════════════════════════════════════════════════════

interface SecureFormFieldsProps {
  register?: (name: string) => object;
  includeCsrf?: boolean;
  csrfToken?: string;
}

export function SecureFormFields({
  register,
  includeCsrf = false,
  csrfToken,
}: SecureFormFieldsProps) {
  return (
    <>
      <HoneypotFields register={register} />
      {includeCsrf && <CsrfField token={csrfToken} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Export default honeypot values for form initialization
// ═══════════════════════════════════════════════════════════

export const defaultHoneypotValues = {
  honeypot: "",
  _hp_name: "",
  website: "",
  _timestamp: 0,
};

export function getHoneypotData() {
  return {
    honeypot: "",
    _hp_name: "",
    website: "",
    _timestamp: Date.now(),
  };
}
