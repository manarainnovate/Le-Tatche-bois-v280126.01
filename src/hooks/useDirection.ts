"use client";
import { useParams } from "next/navigation";

export function useDirection() {
  const params = useParams();
  const locale = params?.locale as string;
  const isRTL = locale === "ar";
  return { isRTL, direction: isRTL ? "rtl" : "ltr" };
}
