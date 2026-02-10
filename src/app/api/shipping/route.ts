import { NextRequest } from "next/server";
import {
  apiSuccess,
  apiError,
  handleApiError,
  getLocaleFromHeaders,
} from "@/lib/api-helpers";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Validation schema
// ═══════════════════════════════════════════════════════════

const calculateShippingSchema = z.object({
  city: z.string().min(1, "City is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
});

// ═══════════════════════════════════════════════════════════
// SHIPPING ZONES CONFIGURATION
// ═══════════════════════════════════════════════════════════

interface ShippingZone {
  id: string;
  name: Record<string, string>;
  price: number;
  freeThreshold: number;
  estimatedDays: { min: number; max: number };
  cities: string[];
}

const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "casablanca-settat",
    name: {
      fr: "Casablanca-Settat",
      en: "Casablanca-Settat",
      es: "Casablanca-Settat",
      ar: "الدار البيضاء-سطات",
    },
    price: 50,
    freeThreshold: 1000,
    estimatedDays: { min: 1, max: 2 },
    cities: [
      "casablanca",
      "mohammedia",
      "settat",
      "berrechid",
      "benslimane",
      "el jadida",
      "azemmour",
      "nouaceur",
      "mediouna",
      "bouskoura",
      "ain harrouda",
      "tit mellil",
      "sidi bennour",
      "ouled frej",
    ],
  },
  {
    id: "rabat-sale-kenitra",
    name: {
      fr: "Rabat-Salé-Kénitra",
      en: "Rabat-Salé-Kénitra",
      es: "Rabat-Salé-Kenitra",
      ar: "الرباط-سلا-القنيطرة",
    },
    price: 60,
    freeThreshold: 1000,
    estimatedDays: { min: 1, max: 2 },
    cities: [
      "rabat",
      "sale",
      "salé",
      "kenitra",
      "kénitra",
      "temara",
      "témara",
      "skhirat",
      "sidi slimane",
      "sidi kacem",
      "souk el arbaa",
      "mechra bel ksiri",
      "ain aouda",
      "tiflet",
      "khemisset",
    ],
  },
  {
    id: "marrakech-safi",
    name: {
      fr: "Marrakech-Safi",
      en: "Marrakech-Safi",
      es: "Marrakech-Safi",
      ar: "مراكش-آسفي",
    },
    price: 70,
    freeThreshold: 1500,
    estimatedDays: { min: 2, max: 3 },
    cities: [
      "marrakech",
      "safi",
      "essaouira",
      "el kelaa des sraghna",
      "chichaoua",
      "youssoufia",
      "ben guerir",
      "tahannaout",
      "ait ourir",
      "amizmiz",
      "tahanaout",
    ],
  },
  {
    id: "fes-meknes",
    name: {
      fr: "Fès-Meknès",
      en: "Fes-Meknes",
      es: "Fez-Meknes",
      ar: "فاس-مكناس",
    },
    price: 70,
    freeThreshold: 1500,
    estimatedDays: { min: 2, max: 3 },
    cities: [
      "fes",
      "fès",
      "meknes",
      "meknès",
      "taza",
      "ifrane",
      "sefrou",
      "azrou",
      "el hajeb",
      "moulay yacoub",
      "taounate",
      "guercif",
      "boulemane",
      "missour",
    ],
  },
  {
    id: "tanger-tetouan",
    name: {
      fr: "Tanger-Tétouan-Al Hoceïma",
      en: "Tangier-Tetouan-Al Hoceima",
      es: "Tánger-Tetuán-Alhucemas",
      ar: "طنجة-تطوان-الحسيمة",
    },
    price: 80,
    freeThreshold: 1500,
    estimatedDays: { min: 2, max: 4 },
    cities: [
      "tanger",
      "tangier",
      "tetouan",
      "tétouan",
      "al hoceima",
      "al hoceïma",
      "larache",
      "ksar el kebir",
      "asilah",
      "chefchaouen",
      "fnideq",
      "mdiq",
      "martil",
      "ouezzane",
    ],
  },
  {
    id: "oriental",
    name: {
      fr: "Oriental",
      en: "Oriental",
      es: "Oriental",
      ar: "الشرق",
    },
    price: 100,
    freeThreshold: 2000,
    estimatedDays: { min: 3, max: 5 },
    cities: [
      "oujda",
      "nador",
      "berkane",
      "taourirt",
      "jerada",
      "figuig",
      "driouch",
      "ahfir",
      "saïdia",
      "saidia",
    ],
  },
  {
    id: "beni-mellal",
    name: {
      fr: "Béni Mellal-Khénifra",
      en: "Beni Mellal-Khenifra",
      es: "Beni Mellal-Jenifra",
      ar: "بني ملال-خنيفرة",
    },
    price: 100,
    freeThreshold: 2000,
    estimatedDays: { min: 2, max: 4 },
    cities: [
      "beni mellal",
      "béni mellal",
      "khenifra",
      "khénifra",
      "khouribga",
      "fquih ben salah",
      "azilal",
      "kasba tadla",
    ],
  },
  {
    id: "draa-tafilalet",
    name: {
      fr: "Drâa-Tafilalet",
      en: "Draa-Tafilalet",
      es: "Draa-Tafilalet",
      ar: "درعة-تافيلالت",
    },
    price: 100,
    freeThreshold: 2000,
    estimatedDays: { min: 3, max: 5 },
    cities: [
      "errachidia",
      "ouarzazate",
      "tinghir",
      "midelt",
      "zagora",
      "rissani",
      "erfoud",
      "merzouga",
      "goulmima",
    ],
  },
  {
    id: "souss-massa",
    name: {
      fr: "Souss-Massa",
      en: "Souss-Massa",
      es: "Sus-Masa",
      ar: "سوس-ماسة",
    },
    price: 100,
    freeThreshold: 2000,
    estimatedDays: { min: 3, max: 5 },
    cities: [
      "agadir",
      "inezgane",
      "ait melloul",
      "taroudant",
      "tiznit",
      "chtouka ait baha",
      "tata",
      "biougra",
    ],
  },
  {
    id: "guelmim-oued-noun",
    name: {
      fr: "Guelmim-Oued Noun",
      en: "Guelmim-Oued Noun",
      es: "Guelmin-Río Nun",
      ar: "كلميم-واد نون",
    },
    price: 100,
    freeThreshold: 2000,
    estimatedDays: { min: 4, max: 6 },
    cities: [
      "guelmim",
      "tan-tan",
      "sidi ifni",
      "assa-zag",
    ],
  },
  {
    id: "laayoune-sakia",
    name: {
      fr: "Laâyoune-Sakia El Hamra",
      en: "Laayoune-Sakia El Hamra",
      es: "El Aaiún-Saguía el Hamra",
      ar: "العيون-الساقية الحمراء",
    },
    price: 100,
    freeThreshold: 2000,
    estimatedDays: { min: 5, max: 7 },
    cities: [
      "laayoune",
      "laâyoune",
      "el aaiun",
      "boujdour",
      "tarfaya",
      "smara",
    ],
  },
  {
    id: "dakhla-oued-dahab",
    name: {
      fr: "Dakhla-Oued Ed-Dahab",
      en: "Dakhla-Oued Ed-Dahab",
      es: "Dajla-Río de Oro",
      ar: "الداخلة-وادي الذهب",
    },
    price: 100,
    freeThreshold: 2000,
    estimatedDays: { min: 5, max: 7 },
    cities: [
      "dakhla",
      "aousserd",
    ],
  },
];

// Default zone for cities not found
const DEFAULT_ZONE: ShippingZone = {
  id: "other",
  name: {
    fr: "Autres régions",
    en: "Other regions",
    es: "Otras regiones",
    ar: "مناطق أخرى",
  },
  price: 100,
  freeThreshold: 2000,
  estimatedDays: { min: 3, max: 5 },
  cities: [],
};

// ═══════════════════════════════════════════════════════════
// HELPER: Normalize city name for matching
// ═══════════════════════════════════════════════════════════

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[-_]/g, " ")
    .trim();
}

// ═══════════════════════════════════════════════════════════
// HELPER: Find shipping zone for a city
// ═══════════════════════════════════════════════════════════

function findZone(city: string): ShippingZone {
  const normalizedCity = normalizeCity(city);

  for (const zone of SHIPPING_ZONES) {
    const normalizedZoneCities = zone.cities.map(normalizeCity);
    if (normalizedZoneCities.includes(normalizedCity)) {
      return zone;
    }
    // Also check partial match for compound city names
    for (const zoneCity of normalizedZoneCities) {
      if (normalizedCity.includes(zoneCity) || zoneCity.includes(normalizedCity)) {
        return zone;
      }
    }
  }

  return DEFAULT_ZONE;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Calculate shipping cost
// ═══════════════════════════════════════════════════════════

function calculateShipping(zone: ShippingZone, subtotal: number) {
  const isFreeShipping = subtotal >= zone.freeThreshold;
  const shippingCost = isFreeShipping ? 0 : zone.price;
  const amountUntilFree = isFreeShipping ? 0 : zone.freeThreshold - subtotal;

  return {
    cost: shippingCost,
    isFreeShipping,
    amountUntilFree: Math.max(0, amountUntilFree),
  };
}

// ═══════════════════════════════════════════════════════════
// POST /api/shipping - Calculate shipping rates
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const locale = getLocaleFromHeaders(req.headers);
    const body: unknown = await req.json();
    const result = calculateShippingSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const { city, subtotal } = result.data;

    // Find shipping zone
    const zone = findZone(city);
    const shipping = calculateShipping(zone, subtotal);

    // Get localized zone name
    const zoneName = zone.name[locale] ?? zone.name.fr;

    return apiSuccess({
      zone: {
        id: zone.id,
        name: zoneName,
      },
      price: zone.price,
      cost: shipping.cost,
      isFreeShipping: shipping.isFreeShipping,
      freeThreshold: zone.freeThreshold,
      amountUntilFree: shipping.amountUntilFree,
      estimatedDays: zone.estimatedDays,
      estimatedDelivery: getEstimatedDeliveryText(zone.estimatedDays, locale),
      // Available shipping methods
      methods: [
        {
          id: "standard",
          name: getMethodName("standard", locale),
          price: shipping.cost,
          estimatedDays: zone.estimatedDays,
        },
      ],
    });
  } catch (error) {
    return handleApiError(error, "Shipping POST");
  }
}

// ═══════════════════════════════════════════════════════════
// GET /api/shipping - Get all shipping zones
// ═══════════════════════════════════════════════════════════

export function GET(req: NextRequest) {
  try {
    const locale = getLocaleFromHeaders(req.headers);

    const zones = SHIPPING_ZONES.map((zone) => ({
      id: zone.id,
      name: zone.name[locale] ?? zone.name.fr,
      price: zone.price,
      freeThreshold: zone.freeThreshold,
      estimatedDays: zone.estimatedDays,
      estimatedDelivery: getEstimatedDeliveryText(zone.estimatedDays, locale),
    }));

    // Add default zone
    zones.push({
      id: DEFAULT_ZONE.id,
      name: DEFAULT_ZONE.name[locale] ?? DEFAULT_ZONE.name.fr,
      price: DEFAULT_ZONE.price,
      freeThreshold: DEFAULT_ZONE.freeThreshold,
      estimatedDays: DEFAULT_ZONE.estimatedDays,
      estimatedDelivery: getEstimatedDeliveryText(DEFAULT_ZONE.estimatedDays, locale),
    });

    return apiSuccess({
      zones,
      currency: "MAD",
    });
  } catch (error) {
    return handleApiError(error, "Shipping GET");
  }
}

// ═══════════════════════════════════════════════════════════
// HELPER: Get estimated delivery text
// ═══════════════════════════════════════════════════════════

function getEstimatedDeliveryText(
  days: { min: number; max: number },
  locale: string
): string {
  const templates = {
    fr: `${days.min}-${days.max} jours ouvrables`,
    en: `${days.min}-${days.max} business days`,
    es: `${days.min}-${days.max} días laborables`,
    ar: `${days.min}-${days.max} أيام عمل`,
  } as const;

  if (locale in templates) {
    return templates[locale as keyof typeof templates];
  }
  return templates.fr;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Get shipping method name
// ═══════════════════════════════════════════════════════════

function getMethodName(method: string, locale: string): string {
  const names = {
    standard: {
      fr: "Livraison standard",
      en: "Standard delivery",
      es: "Entrega estándar",
      ar: "التوصيل القياسي",
    },
    express: {
      fr: "Livraison express",
      en: "Express delivery",
      es: "Entrega express",
      ar: "التوصيل السريع",
    },
  } as const;

  const methodNames = names[method as keyof typeof names];
  if (methodNames && locale in methodNames) {
    return methodNames[locale as keyof typeof methodNames];
  }
  return methodNames?.fr ?? method;
}
