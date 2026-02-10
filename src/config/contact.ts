// ═══════════════════════════════════════════════════════════
// LE TATCHE BOIS - CONTACT CONFIGURATION
// Central source of truth for all contact information
// ═══════════════════════════════════════════════════════════

export const CONTACT = {
  // Company Info
  companyName: "LE TATCHE BOIS",
  tagline: "Artisanat du bois de qualité",

  // Physical Address
  address: {
    street: "Lot Hamane El Fetouaki N°365",
    neighborhood: "Lamhamid",
    city: "Marrakech",
    country: "Maroc",
    full: "Lot Hamane El Fetouaki N°365, Lamhamid, Marrakech",
    fullWithCountry: "Lot Hamane El Fetouaki N°365, Lamhamid, Marrakech, Maroc",
  },

  // Phone
  phone: {
    display: "+212 698 013 468",
    link: "+212698013468",
    whatsapp: "212698013468",
  },

  // Email
  email: {
    main: "contact@letatchebois.com",
    support: "contact@letatchebois.com",
  },

  // Business Hours
  hours: {
    weekdays: "09:00 - 18:00",
    saturday: "09:00 - 18:00",
    sunday: "Fermé",
    schedule: {
      fr: {
        weekdays: "Lundi - Samedi: 09:00 - 18:00",
        sunday: "Dimanche: Fermé",
      },
      en: {
        weekdays: "Monday - Saturday: 9:00 AM - 6:00 PM",
        sunday: "Sunday: Closed",
      },
      es: {
        weekdays: "Lunes - Sábado: 09:00 - 18:00",
        sunday: "Domingo: Cerrado",
      },
      ar: {
        weekdays: "الإثنين - السبت: 09:00 - 18:00",
        sunday: "الأحد: مغلق",
      },
    },
  },

  // Social Media
  social: {
    facebook: "https://facebook.com/letatchebois",
    instagram: "https://instagram.com/letatchebois",
    youtube: "https://www.youtube.com/@letatchebois2512",
    whatsapp: "https://wa.me/212698013468",
  },

  // Google Maps
  maps: {
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1292.0278261818319!2d-8.039707400802605!3d31.60070030000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafef0bf6821573%3A0x718f0ac703f5c585!2z2YXYs9is2K8g2K3Zhdin2YYg2KfZhNmB2LfZiNin2YPZig!5e1!3m2!1sen!2sma!4v1770648289452!5m2!1sen!2sma",
    link: "https://maps.app.goo.gl/CKrdr8SVcGEXWgNM7",
  },
} as const;

// Helper to get WhatsApp link with optional message
export function getWhatsAppLink(message?: string): string {
  const baseUrl = `https://wa.me/${CONTACT.phone.whatsapp}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

// Helper to get tel: link
export function getPhoneLink(): string {
  return `tel:${CONTACT.phone.link}`;
}

// Helper to get mailto: link
export function getEmailLink(subject?: string): string {
  const baseUrl = `mailto:${CONTACT.email.main}`;
  if (subject) {
    return `${baseUrl}?subject=${encodeURIComponent(subject)}`;
  }
  return baseUrl;
}

export default CONTACT;
