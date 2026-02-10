export interface Project {
  id: string;
  slug: string;
  title: {
    fr: string;
    en: string;
    ar: string;
    es: string;
  };
  category: string;
  location: string;
  year: number;
  featured: boolean;
  image: string;
  coverImage: string;
  description?: {
    fr: string;
    en: string;
    ar: string;
    es: string;
  };
  phases?: {
    before: ProjectPhase;
    during: ProjectPhase[];
    after: ProjectPhase;
  };
}

export type ProjectLocale = 'fr' | 'en' | 'ar' | 'es';
export type Locale = ProjectLocale;

export interface ProjectPhase {
  title: {
    fr: string;
    en: string;
    ar: string;
    es: string;
  };
  description?: {
    fr: string;
    en: string;
    ar: string;
    es: string;
  };
  images: string[];
}

export const projectCategories = [
  { id: 'all', fr: 'Tous', en: 'All', ar: 'الكل', es: 'Todos' },
  { id: 'placards', fr: 'Placards', en: 'Wardrobes', ar: 'خزائن', es: 'Armarios' },
  { id: 'cuisines', fr: 'Cuisines', en: 'Kitchens', ar: 'مطابخ', es: 'Cocinas' },
  { id: 'portes', fr: 'Portes', en: 'Doors', ar: 'أبواب', es: 'Puertas' },
  { id: 'habillage', fr: 'Habillage Mur', en: 'Wall Cladding', ar: 'تكسية الجدران', es: 'Revestimiento' },
  { id: 'escaliers', fr: 'Escaliers', en: 'Stairs', ar: 'سلالم', es: 'Escaleras' },
  { id: 'plafonds', fr: 'Toits/Plafonds', en: 'Roofs/Ceilings', ar: 'أسقف', es: 'Techos' },
  { id: 'mosquees', fr: 'Mosquées', en: 'Mosques', ar: 'مساجد', es: 'Mezquitas' },
  { id: 'decoration', fr: 'Décoration', en: 'Decoration', ar: 'ديكور', es: 'Decoración' },
  { id: 'mobilier', fr: 'Mobilier', en: 'Furniture', ar: 'أثاث', es: 'Mobiliario' },
];

// 50 sample projects
export const projects: Project[] = [
  // === CUISINES (8 projects) ===
  { id: '1', slug: 'cuisine-villa-marrakech', title: { fr: 'Cuisine Traditionnelle Marocaine', en: 'Traditional Moroccan Kitchen', ar: 'مطبخ مغربي تقليدي', es: 'Cocina Tradicional Marroquí' }, category: 'cuisines', location: 'Marrakech', year: 2024, featured: true, image: '/images/projects/cuisine-1.jpg', coverImage: '/images/projects/cuisine-1.jpg' },
  { id: '2', slug: 'cuisine-moderne-casa', title: { fr: 'Cuisine Moderne Luxe', en: 'Modern Luxury Kitchen', ar: 'مطبخ حديث فاخر', es: 'Cocina Moderna de Lujo' }, category: 'cuisines', location: 'Casablanca', year: 2024, featured: false, image: '/images/projects/cuisine-2.jpg', coverImage: '/images/projects/cuisine-2.jpg' },
  { id: '3', slug: 'cuisine-riad-fes', title: { fr: 'Cuisine de Riad', en: 'Riad Kitchen', ar: 'مطبخ رياض', es: 'Cocina de Riad' }, category: 'cuisines', location: 'Fès', year: 2023, featured: true, image: '/images/projects/cuisine-3.jpg', coverImage: '/images/projects/cuisine-3.jpg' },
  { id: '4', slug: 'cuisine-appartement-rabat', title: { fr: 'Cuisine Appartement Standing', en: 'Upscale Apartment Kitchen', ar: 'مطبخ شقة راقية', es: 'Cocina Apartamento de Lujo' }, category: 'cuisines', location: 'Rabat', year: 2023, featured: false, image: '/images/projects/cuisine-4.jpg', coverImage: '/images/projects/cuisine-4.jpg' },
  { id: '5', slug: 'cuisine-villa-tanger', title: { fr: 'Cuisine Villa Bord de Mer', en: 'Seaside Villa Kitchen', ar: 'مطبخ فيلا بحرية', es: 'Cocina Villa Costera' }, category: 'cuisines', location: 'Tanger', year: 2024, featured: false, image: '/images/projects/cuisine-5.jpg', coverImage: '/images/projects/cuisine-5.jpg' },
  { id: '6', slug: 'cuisine-hotel-agadir', title: { fr: 'Cuisine Hôtel 5 Étoiles', en: '5-Star Hotel Kitchen', ar: 'مطبخ فندق 5 نجوم', es: 'Cocina Hotel 5 Estrellas' }, category: 'cuisines', location: 'Agadir', year: 2023, featured: true, image: '/images/projects/cuisine-6.jpg', coverImage: '/images/projects/cuisine-6.jpg' },
  { id: '7', slug: 'cuisine-traditionnelle-essaouira', title: { fr: 'Cuisine Style Mogador', en: 'Mogador Style Kitchen', ar: 'مطبخ بأسلوب موكادور', es: 'Cocina Estilo Mogador' }, category: 'cuisines', location: 'Essaouira', year: 2024, featured: false, image: '/images/projects/cuisine-7.jpg', coverImage: '/images/projects/cuisine-7.jpg' },
  { id: '8', slug: 'cuisine-duplex-casa', title: { fr: 'Cuisine Duplex Contemporain', en: 'Contemporary Duplex Kitchen', ar: 'مطبخ دوبلكس معاصر', es: 'Cocina Dúplex Contemporáneo' }, category: 'cuisines', location: 'Casablanca', year: 2024, featured: false, image: '/images/projects/cuisine-8.jpg', coverImage: '/images/projects/cuisine-8.jpg' },

  // === PLACARDS (8 projects) ===
  { id: '9', slug: 'placard-chambre-marrakech', title: { fr: 'Placards Sur Mesure', en: 'Custom Wardrobes', ar: 'خزائن مخصصة', es: 'Armarios a Medida' }, category: 'placards', location: 'Essaouira', year: 2024, featured: true, image: '/images/projects/placard-1.jpg', coverImage: '/images/projects/placard-1.jpg' },
  { id: '10', slug: 'dressing-luxe-casa', title: { fr: 'Dressing Luxe', en: 'Luxury Dressing Room', ar: 'غرفة ملابس فاخرة', es: 'Vestidor de Lujo' }, category: 'placards', location: 'Casablanca', year: 2024, featured: true, image: '/images/projects/placard-2.jpg', coverImage: '/images/projects/placard-2.jpg' },
  { id: '11', slug: 'placard-entree-rabat', title: { fr: "Placard d'Entrée", en: 'Entry Wardrobe', ar: 'خزانة مدخل', es: 'Armario de Entrada' }, category: 'placards', location: 'Rabat', year: 2023, featured: false, image: '/images/projects/placard-3.jpg', coverImage: '/images/projects/placard-3.jpg' },
  { id: '12', slug: 'rangement-bureau-tanger', title: { fr: 'Rangement Bureau', en: 'Office Storage', ar: 'تخزين مكتب', es: 'Almacenamiento Oficina' }, category: 'placards', location: 'Tanger', year: 2023, featured: false, image: '/images/projects/placard-4.jpg', coverImage: '/images/projects/placard-4.jpg' },
  { id: '13', slug: 'placard-chambre-enfant', title: { fr: 'Placard Chambre Enfant', en: "Children's Room Wardrobe", ar: 'خزانة غرفة أطفال', es: 'Armario Habitación Infantil' }, category: 'placards', location: 'Marrakech', year: 2024, featured: false, image: '/images/projects/placard-5.jpg', coverImage: '/images/projects/placard-5.jpg' },
  { id: '14', slug: 'dressing-suite-parentale', title: { fr: 'Dressing Suite Parentale', en: 'Master Suite Dressing', ar: 'غرفة ملابس رئيسية', es: 'Vestidor Suite Principal' }, category: 'placards', location: 'Agadir', year: 2024, featured: true, image: '/images/projects/placard-6.jpg', coverImage: '/images/projects/placard-6.jpg' },
  { id: '15', slug: 'placard-coulissant-fes', title: { fr: 'Placard Coulissant', en: 'Sliding Wardrobe', ar: 'خزانة منزلقة', es: 'Armario Corredera' }, category: 'placards', location: 'Fès', year: 2023, featured: false, image: '/images/projects/placard-7.jpg', coverImage: '/images/projects/placard-7.jpg' },
  { id: '16', slug: 'rangement-salon-marrakech', title: { fr: 'Rangement Salon', en: 'Living Room Storage', ar: 'تخزين غرفة المعيشة', es: 'Almacenamiento Salón' }, category: 'placards', location: 'Marrakech', year: 2024, featured: false, image: '/images/projects/placard-8.jpg', coverImage: '/images/projects/placard-8.jpg' },

  // === PORTES (6 projects) ===
  { id: '17', slug: 'porte-traditionnelle-fes', title: { fr: 'Porte Traditionnelle Fassi', en: 'Traditional Fes Door', ar: 'باب فاسي تقليدي', es: 'Puerta Tradicional de Fez' }, category: 'portes', location: 'Fès', year: 2023, featured: false, image: '/images/projects/porte-1.jpg', coverImage: '/images/projects/porte-1.jpg' },
  { id: '18', slug: 'porte-riad-marrakech', title: { fr: 'Porte de Riad Sculptée', en: 'Carved Riad Door', ar: 'باب رياض منحوت', es: 'Puerta de Riad Tallada' }, category: 'portes', location: 'Marrakech', year: 2024, featured: true, image: '/images/projects/porte-2.jpg', coverImage: '/images/projects/porte-2.jpg' },
  { id: '19', slug: 'porte-entree-villa', title: { fr: "Porte d'Entrée Villa", en: 'Villa Entry Door', ar: 'باب مدخل فيلا', es: 'Puerta Entrada Villa' }, category: 'portes', location: 'Casablanca', year: 2024, featured: false, image: '/images/projects/porte-3.jpg', coverImage: '/images/projects/porte-3.jpg' },
  { id: '20', slug: 'portes-interieures-hotel', title: { fr: 'Portes Intérieures Hôtel', en: 'Hotel Interior Doors', ar: 'أبواب داخلية فندق', es: 'Puertas Interiores Hotel' }, category: 'portes', location: 'Agadir', year: 2023, featured: false, image: '/images/projects/porte-4.jpg', coverImage: '/images/projects/porte-4.jpg' },
  { id: '21', slug: 'porte-monumentale-mosquee', title: { fr: 'Porte Monumentale', en: 'Monumental Door', ar: 'باب ضخم', es: 'Puerta Monumental' }, category: 'portes', location: 'Rabat', year: 2023, featured: true, image: '/images/projects/porte-5.jpg', coverImage: '/images/projects/porte-5.jpg' },
  { id: '22', slug: 'porte-moderne-appartement', title: { fr: 'Porte Moderne Pivot', en: 'Modern Pivot Door', ar: 'باب محوري حديث', es: 'Puerta Pivotante Moderna' }, category: 'portes', location: 'Tanger', year: 2024, featured: false, image: '/images/projects/porte-6.jpg', coverImage: '/images/projects/porte-6.jpg' },

  // === ESCALIERS (5 projects) ===
  { id: '23', slug: 'escalier-monumental-casa', title: { fr: 'Escalier Monumental', en: 'Monumental Staircase', ar: 'درج ضخم', es: 'Escalera Monumental' }, category: 'escaliers', location: 'Casablanca', year: 2023, featured: true, image: '/images/projects/escalier-1.jpg', coverImage: '/images/projects/escalier-1.jpg' },
  { id: '24', slug: 'escalier-colimacon-riad', title: { fr: 'Escalier Colimaçon', en: 'Spiral Staircase', ar: 'درج حلزوني', es: 'Escalera de Caracol' }, category: 'escaliers', location: 'Marrakech', year: 2024, featured: true, image: '/images/projects/escalier-2.jpg', coverImage: '/images/projects/escalier-2.jpg' },
  { id: '25', slug: 'escalier-contemporain-villa', title: { fr: 'Escalier Contemporain', en: 'Contemporary Staircase', ar: 'درج معاصر', es: 'Escalera Contemporánea' }, category: 'escaliers', location: 'Rabat', year: 2024, featured: false, image: '/images/projects/escalier-3.jpg', coverImage: '/images/projects/escalier-3.jpg' },
  { id: '26', slug: 'escalier-traditionnel-fes', title: { fr: 'Escalier Traditionnel', en: 'Traditional Staircase', ar: 'درج تقليدي', es: 'Escalera Tradicional' }, category: 'escaliers', location: 'Fès', year: 2023, featured: false, image: '/images/projects/escalier-4.jpg', coverImage: '/images/projects/escalier-4.jpg' },
  { id: '27', slug: 'escalier-hotel-luxe', title: { fr: 'Escalier Hôtel de Luxe', en: 'Luxury Hotel Staircase', ar: 'درج فندق فاخر', es: 'Escalera Hotel de Lujo' }, category: 'escaliers', location: 'Agadir', year: 2024, featured: false, image: '/images/projects/escalier-5.jpg', coverImage: '/images/projects/escalier-5.jpg' },

  // === HABILLAGE MUR (5 projects) ===
  { id: '28', slug: 'habillage-mural-luxe', title: { fr: 'Habillage Mural Luxe', en: 'Luxury Wall Cladding', ar: 'تكسية جدران فاخرة', es: 'Revestimiento Mural de Lujo' }, category: 'habillage', location: 'Agadir', year: 2024, featured: false, image: '/images/projects/habillage-1.jpg', coverImage: '/images/projects/habillage-1.jpg' },
  { id: '29', slug: 'boiserie-salon-marrakech', title: { fr: 'Boiserie Salon', en: 'Living Room Paneling', ar: 'تلبيس خشبي لغرفة المعيشة', es: 'Revestimiento Salón' }, category: 'habillage', location: 'Marrakech', year: 2024, featured: true, image: '/images/projects/habillage-2.jpg', coverImage: '/images/projects/habillage-2.jpg' },
  { id: '30', slug: 'mur-tv-design', title: { fr: 'Mur TV Design', en: 'Designer TV Wall', ar: 'جدار تلفزيون تصميمي', es: 'Pared TV Diseño' }, category: 'habillage', location: 'Casablanca', year: 2023, featured: false, image: '/images/projects/habillage-3.jpg', coverImage: '/images/projects/habillage-3.jpg' },
  { id: '31', slug: 'habillage-bureau-direction', title: { fr: 'Habillage Bureau Direction', en: 'Executive Office Cladding', ar: 'تكسية مكتب تنفيذي', es: 'Revestimiento Oficina Dirección' }, category: 'habillage', location: 'Rabat', year: 2024, featured: false, image: '/images/projects/habillage-4.jpg', coverImage: '/images/projects/habillage-4.jpg' },
  { id: '32', slug: 'boiserie-chambre-hotel', title: { fr: 'Boiserie Chambre Hôtel', en: 'Hotel Room Paneling', ar: 'تلبيس خشبي لغرفة فندق', es: 'Revestimiento Habitación Hotel' }, category: 'habillage', location: 'Tanger', year: 2023, featured: false, image: '/images/projects/habillage-5.jpg', coverImage: '/images/projects/habillage-5.jpg' },

  // === PLAFONDS (5 projects) ===
  { id: '33', slug: 'plafond-sculpte-riad', title: { fr: 'Plafond Sculpté Riad', en: 'Carved Riad Ceiling', ar: 'سقف رياض منحوت', es: 'Techo Tallado Riad' }, category: 'plafonds', location: 'Marrakech', year: 2024, featured: true, image: '/images/projects/plafond-1.jpg', coverImage: '/images/projects/plafond-1.jpg' },
  { id: '34', slug: 'plafond-moucharabieh', title: { fr: 'Plafond Moucharabieh', en: 'Moucharabieh Ceiling', ar: 'سقف مشربية', es: 'Techo Moucharabieh' }, category: 'plafonds', location: 'Fès', year: 2023, featured: true, image: '/images/projects/plafond-2.jpg', coverImage: '/images/projects/plafond-2.jpg' },
  { id: '35', slug: 'plafond-caisson-moderne', title: { fr: 'Plafond Caisson Moderne', en: 'Modern Coffered Ceiling', ar: 'سقف صندوقي حديث', es: 'Techo Artesonado Moderno' }, category: 'plafonds', location: 'Casablanca', year: 2024, featured: false, image: '/images/projects/plafond-3.jpg', coverImage: '/images/projects/plafond-3.jpg' },
  { id: '36', slug: 'plafond-geometrique-hotel', title: { fr: 'Plafond Géométrique', en: 'Geometric Ceiling', ar: 'سقف هندسي', es: 'Techo Geométrico' }, category: 'plafonds', location: 'Agadir', year: 2023, featured: false, image: '/images/projects/plafond-4.jpg', coverImage: '/images/projects/plafond-4.jpg' },
  { id: '37', slug: 'faux-plafond-restaurant', title: { fr: 'Faux Plafond Restaurant', en: 'Restaurant False Ceiling', ar: 'سقف معلق مطعم', es: 'Falso Techo Restaurante' }, category: 'plafonds', location: 'Rabat', year: 2024, featured: false, image: '/images/projects/plafond-5.jpg', coverImage: '/images/projects/plafond-5.jpg' },

  // === MOSQUÉES (4 projects) ===
  { id: '38', slug: 'plafond-mosquee-rabat', title: { fr: 'Plafond de Mosquée', en: 'Mosque Ceiling', ar: 'سقف مسجد', es: 'Techo de Mezquita' }, category: 'mosquees', location: 'Rabat', year: 2023, featured: true, image: '/images/projects/mosquee-1.jpg', coverImage: '/images/projects/mosquee-1.jpg' },
  { id: '39', slug: 'minbar-mosquee-casa', title: { fr: 'Minbar Sculpté', en: 'Carved Minbar', ar: 'منبر منحوت', es: 'Mimbar Tallado' }, category: 'mosquees', location: 'Casablanca', year: 2024, featured: true, image: '/images/projects/mosquee-2.jpg', coverImage: '/images/projects/mosquee-2.jpg' },
  { id: '40', slug: 'portes-mosquee-fes', title: { fr: 'Portes de Mosquée', en: 'Mosque Doors', ar: 'أبواب مسجد', es: 'Puertas de Mezquita' }, category: 'mosquees', location: 'Fès', year: 2023, featured: false, image: '/images/projects/mosquee-3.jpg', coverImage: '/images/projects/mosquee-3.jpg' },
  { id: '41', slug: 'mihrab-mosquee-marrakech', title: { fr: 'Mihrab Sculpté', en: 'Carved Mihrab', ar: 'محراب منحوت', es: 'Mihrab Tallado' }, category: 'mosquees', location: 'Marrakech', year: 2024, featured: false, image: '/images/projects/mosquee-4.jpg', coverImage: '/images/projects/mosquee-4.jpg' },

  // === DÉCORATION (5 projects) ===
  { id: '42', slug: 'claustra-bois-villa', title: { fr: 'Claustra Bois Décoratif', en: 'Decorative Wood Screen', ar: 'حاجز خشبي زخرفي', es: 'Celosía Decorativa' }, category: 'decoration', location: 'Marrakech', year: 2024, featured: true, image: '/images/projects/deco-1.jpg', coverImage: '/images/projects/deco-1.jpg' },
  { id: '43', slug: 'cadres-miroirs-artisanaux', title: { fr: 'Cadres & Miroirs', en: 'Frames & Mirrors', ar: 'إطارات ومرايا', es: 'Marcos y Espejos' }, category: 'decoration', location: 'Essaouira', year: 2024, featured: false, image: '/images/projects/deco-2.jpg', coverImage: '/images/projects/deco-2.jpg' },
  { id: '44', slug: 'luminaires-bois-hotel', title: { fr: 'Luminaires en Bois', en: 'Wooden Light Fixtures', ar: 'تركيبات إضاءة خشبية', es: 'Luminarias de Madera' }, category: 'decoration', location: 'Agadir', year: 2023, featured: false, image: '/images/projects/deco-3.jpg', coverImage: '/images/projects/deco-3.jpg' },
  { id: '45', slug: 'paravent-sculpte', title: { fr: 'Paravent Sculpté', en: 'Carved Screen', ar: 'حاجز منحوت', es: 'Biombo Tallado' }, category: 'decoration', location: 'Casablanca', year: 2024, featured: false, image: '/images/projects/deco-4.jpg', coverImage: '/images/projects/deco-4.jpg' },
  { id: '46', slug: 'etageres-design', title: { fr: 'Étagères Design', en: 'Designer Shelves', ar: 'رفوف تصميمية', es: 'Estanterías de Diseño' }, category: 'decoration', location: 'Rabat', year: 2023, featured: false, image: '/images/projects/deco-5.jpg', coverImage: '/images/projects/deco-5.jpg' },

  // === MOBILIER (4 projects) ===
  { id: '47', slug: 'table-salle-manger-royale', title: { fr: 'Table Salle à Manger', en: 'Dining Table', ar: 'طاولة طعام', es: 'Mesa de Comedor' }, category: 'mobilier', location: 'Marrakech', year: 2024, featured: true, image: '/images/projects/mobilier-1.jpg', coverImage: '/images/projects/mobilier-1.jpg' },
  { id: '48', slug: 'bureau-direction-bois', title: { fr: 'Bureau de Direction', en: 'Executive Desk', ar: 'مكتب تنفيذي', es: 'Escritorio Ejecutivo' }, category: 'mobilier', location: 'Casablanca', year: 2024, featured: false, image: '/images/projects/mobilier-2.jpg', coverImage: '/images/projects/mobilier-2.jpg' },
  { id: '49', slug: 'lit-baldaquin-traditionnel', title: { fr: 'Lit Baldaquin', en: 'Canopy Bed', ar: 'سرير بمظلة', es: 'Cama con Dosel' }, category: 'mobilier', location: 'Fès', year: 2023, featured: true, image: '/images/projects/mobilier-3.jpg', coverImage: '/images/projects/mobilier-3.jpg' },
  { id: '50', slug: 'bibliotheque-sur-mesure', title: { fr: 'Bibliothèque Sur Mesure', en: 'Custom Bookshelf', ar: 'مكتبة مخصصة', es: 'Biblioteca a Medida' }, category: 'mobilier', location: 'Rabat', year: 2024, featured: false, image: '/images/projects/mobilier-4.jpg', coverImage: '/images/projects/mobilier-4.jpg' },
];

// Helper functions
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}

export function getProjectsByCategory(category: string): Project[] {
  if (category === 'all') return projects;
  return projects.filter(p => p.category === category);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured);
}

export function getPaginatedProjects(
  category: string = 'all',
  page: number = 1,
  perPage: number = 10
): { projects: Project[]; total: number; totalPages: number } {
  const filtered = category === 'all' ? projects : projects.filter(p => p.category === category);
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    projects: filtered.slice(start, end),
    total,
    totalPages
  };
}

export function getRelatedProjects(currentProject: Project, limit: number = 3): Project[] {
  return projects
    .filter(p => p.category === currentProject.category && p.id !== currentProject.id)
    .slice(0, limit);
}
