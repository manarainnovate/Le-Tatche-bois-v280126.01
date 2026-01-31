import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale, type Locale } from "./config";

type Messages = Record<string, Record<string, unknown>>;

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Validate that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  const messages: Messages = (await import(`@/messages/${locale}.json`)) as { default: Messages };

  return {
    locale,
    messages: messages.default ?? messages,
  };
});
