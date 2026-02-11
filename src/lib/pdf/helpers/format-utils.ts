/**
 * Format utilities for PDF generation
 */

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
