/**
 * Convertit un nombre en mots français
 * Exemples :
 *   156180 → "Cent cinquante-six mille cent quatre-vingts"
 *   1234.56 → "Mille deux cent trente-quatre Dirhams ; 56 Cts TTC"
 *
 * Gère : millions, milliers, centaines
 * Particularités françaises : soixante-dix, quatre-vingts, quatre-vingt-dix
 */

const units = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const tens = [
  '',
  'dix',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante',
  'quatre-vingt',
  'quatre-vingt',
];

function convertUnder1000(n: number): string {
  if (n === 0) return '';
  if (n < 20) return units[n];

  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;

    // 70-79: soixante + (10-19)
    if (t === 7) {
      return tens[7] + '-' + units[10 + u];
    }

    // 90-99: quatre-vingt + (10-19)
    if (t === 9) {
      return tens[9] + '-' + units[10 + u];
    }

    // 80: quatre-vingts (avec s)
    if (t === 8 && u === 0) {
      return 'quatre-vingts';
    }

    // 81-89: quatre-vingt-un (sans s)
    if (t === 8) {
      return tens[8] + '-' + units[u];
    }

    // Autres dizaines
    if (u === 0) {
      return tens[t];
    }

    // Vingt-et-un, trente-et-un, etc. (sauf 81 et 91)
    if (u === 1 && t !== 8 && t !== 9) {
      return tens[t] + ' et un';
    }

    return tens[t] + '-' + units[u];
  }

  // 100-999
  const h = Math.floor(n / 100);
  const rest = n % 100;

  let str = h === 1 ? 'cent' : units[h] + ' cent';

  // Plural "cents" only when hundreds are exact multiple and > 100
  if (rest === 0 && h > 1) {
    str += 's';
  }

  if (rest > 0) {
    str += ' ' + convertUnder1000(rest);
  }

  return str;
}

export function numberToFrench(n: number): string {
  if (n === 0) return 'zéro';

  const parts: string[] = [];

  // Millions
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(convertUnder1000(millions) + ' millions');
    }
    n = n % 1000000;
  }

  // Milliers
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(convertUnder1000(thousands) + ' mille');
    }
    n = n % 1000;
  }

  // Centaines
  if (n > 0) {
    parts.push(convertUnder1000(n));
  }

  return parts.join(' ');
}

/**
 * Convertit un montant en format français pour facture marocaine
 * Format: "Montant en lettres Dirhams ; Centimes Cts TTC"
 *
 * @param amount - Montant numérique (ex: 156180.50)
 * @returns String formaté (ex: "Cent cinquante-six mille cent quatre-vingts Dirhams ; 50 Cts TTC")
 */
export function amountInFrench(amount: number): string {
  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);

  let result = numberToFrench(intPart) + ' Dirhams';

  if (decPart > 0) {
    result += ' ; ' + decPart.toString().padStart(2, '0') + ' Cts';
  }

  result += ' TTC';

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}
