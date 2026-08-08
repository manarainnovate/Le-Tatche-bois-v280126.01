/**
 * Format utilities for PDF generation
 */

/**
 * Sanitize text before drawing it with PDFKit's built-in (WinAnsi) fonts.
 *
 * Pasted text often contains characters those fonts can't encode, which comes
 * out as garbled glyphs. The biggest culprit is DECOMPOSED accents (e.g. "e" +
 * a combining accent instead of a single precomposed character): NFC
 * normalization recomposes them into single Latin-1 characters the font can
 * render. We then fold exotic spaces / quotes / dashes to ASCII and drop
 * zero-width, bidi, control and any remaining non-Latin-1 characters.
 *
 * Implemented as a code-point loop (no literal special characters in source).
 */
export function sanitizePdfText(input?: string | null): string {
  if (!input) return '';
  const s = input.normalize('NFC');
  let out = '';
  for (const ch of s) {
    const cp = ch.codePointAt(0) as number;

    // Keep normal ASCII fast-path and Latin-1 (WinAnsi renders these)
    if (cp === 0x09 || cp === 0x0a || cp === 0x0d) { out += ch; continue; } // tab/newline
    if (cp < 0x20 || cp === 0x7f) continue; // other control chars -> drop
    if (cp <= 0xff) { out += ch; continue; } // Latin-1 (incl. accented letters)

    // Exotic spaces -> normal space
    if (cp === 0x1680 || (cp >= 0x2000 && cp <= 0x200a) || cp === 0x202f || cp === 0x205f || cp === 0x3000) {
      out += ' ';
      continue;
    }
    // Curly single quotes -> '
    if (cp >= 0x2018 && cp <= 0x201b) { out += "'"; continue; }
    // Curly double quotes -> "
    if (cp >= 0x201c && cp <= 0x201f) { out += '"'; continue; }
    // Dashes & minus -> hyphen
    if ((cp >= 0x2012 && cp <= 0x2015) || cp === 0x2212) { out += '-'; continue; }
    // Ellipsis
    if (cp === 0x2026) { out += '...'; continue; }
    // Bullet
    if (cp === 0x2022) { out += '-'; continue; }

    // Zero-width, word joiner, BOM, bidi controls, and anything else outside
    // Latin-1 that the base font can't render -> drop silently.
  }
  return out;
}

/**
 * Formate un nombre en format marocain : 1 234 567,89
 * @param n - Nombre à formater
 * @returns String formaté avec espaces pour milliers et virgule pour décimales
 */
export function formatNumber(n: number, decimals: number = 2): string {
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  // Add spaces for thousands
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return decPart ? `${formattedInt},${decPart}` : formattedInt;
}

/**
 * Formate une date en format français : 05/01/2026
 * @param d - Date object ou string ISO
 * @returns String formaté DD/MM/YYYY
 */
export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formate une date en format long français : 5 janvier 2026
 * @param d - Date object ou string ISO
 * @returns String formaté en toutes lettres
 */
export function formatDateLong(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;

  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Formate un montant en devise (MAD par défaut)
 * @param amount - Montant numérique
 * @param currency - Code devise (MAD, EUR, USD, etc.)
 * @returns String formaté avec devise
 */
export function formatCurrency(amount: number, currency: string = 'MAD'): string {
  return `${formatNumber(amount)} ${currency}`;
}
