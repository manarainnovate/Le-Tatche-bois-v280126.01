// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT DATA STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

export type Locale = "fr" | "en" | "ar" | "es";

export interface LocalizedText {
  fr: string;
  en: string;
  ar: string;
  es: string;
}

export interface Product {
  id: string;
  slug: string;
  category: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  isNew: boolean;
  isSale: boolean;
  rating: number;
  reviewCount: number;
  materials: string[];
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  woodType: string;
  finishType: string;
  handcrafted: boolean;
  customizable: boolean;
  deliveryTime: string;
  tags: string[];
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export const productCategories = [
  { id: "all", fr: "Tous les produits", en: "All Products", ar: "جميع المنتجات", es: "Todos los productos" },
  { id: "tables", fr: "Tables", en: "Tables", ar: "طاولات", es: "Mesas" },
  { id: "chaises", fr: "Chaises", en: "Chairs", ar: "كراسي", es: "Sillas" },
  { id: "rangement", fr: "Rangement", en: "Storage", ar: "تخزين", es: "Almacenamiento" },
  { id: "decoration", fr: "Décoration", en: "Decoration", ar: "ديكور", es: "Decoración" },
  { id: "accessoires", fr: "Accessoires", en: "Accessories", ar: "إكسسوارات", es: "Accesorios" },
  { id: "cuisine", fr: "Cuisine", en: "Kitchen", ar: "مطبخ", es: "Cocina" },
  { id: "exterieur", fr: "Extérieur", en: "Outdoor", ar: "خارجي", es: "Exterior" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const products: Product[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // TABLES (1-4)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "1",
    slug: "table-salon-noyer",
    category: "tables",
    name: {
      fr: "Table de Salon en Noyer",
      en: "Walnut Living Room Table",
      ar: "طاولة صالون من خشب الجوز",
      es: "Mesa de Salón de Nogal",
    },
    description: {
      fr: "Magnifique table basse en noyer massif avec finition huilée naturelle. Design épuré qui s'adapte à tous les intérieurs.",
      en: "Beautiful solid walnut coffee table with natural oil finish. Clean design that adapts to all interiors.",
      ar: "طاولة قهوة رائعة من خشب الجوز الصلب بتشطيب زيتي طبيعي. تصميم نظيف يتناسب مع جميع الديكورات.",
      es: "Hermosa mesa de centro de nogal macizo con acabado de aceite natural. Diseño limpio que se adapta a todos los interiores.",
    },
    price: 4500,
    originalPrice: 5200,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80",
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 5,
    featured: true,
    isNew: false,
    isSale: true,
    rating: 4.8,
    reviewCount: 24,
    materials: ["Noyer massif", "Huile naturelle"],
    dimensions: { width: 120, height: 45, depth: 60, unit: "cm" },
    weight: { value: 25, unit: "kg" },
    woodType: "Noyer",
    finishType: "Huilé",
    handcrafted: true,
    customizable: true,
    deliveryTime: "2-3 semaines",
    tags: ["table basse", "salon", "noyer", "moderne"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    slug: "table-salle-manger-chene",
    category: "tables",
    name: {
      fr: "Table Salle à Manger Chêne",
      en: "Oak Dining Table",
      ar: "طاولة طعام من خشب البلوط",
      es: "Mesa de Comedor de Roble",
    },
    description: {
      fr: "Grande table familiale en chêne massif pouvant accueillir 8 personnes. Pieds sculptés à la main dans la tradition marocaine.",
      en: "Large family table in solid oak that can seat 8 people. Hand-carved legs in Moroccan tradition.",
      ar: "طاولة عائلية كبيرة من خشب البلوط الصلب تتسع لـ 8 أشخاص. أرجل منحوتة يدوياً بالتقاليد المغربية.",
      es: "Gran mesa familiar de roble macizo con capacidad para 8 personas. Patas talladas a mano en tradición marroquí.",
    },
    price: 12000,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 3,
    featured: true,
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewCount: 12,
    materials: ["Chêne massif", "Vernis mat"],
    dimensions: { width: 200, height: 76, depth: 100, unit: "cm" },
    weight: { value: 65, unit: "kg" },
    woodType: "Chêne",
    finishType: "Vernis mat",
    handcrafted: true,
    customizable: true,
    deliveryTime: "4-6 semaines",
    tags: ["table", "salle à manger", "chêne", "familial"],
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    slug: "table-console-cedre",
    category: "tables",
    name: {
      fr: "Console en Cèdre de l'Atlas",
      en: "Atlas Cedar Console",
      ar: "كونسول من خشب أرز الأطلس",
      es: "Consola de Cedro del Atlas",
    },
    description: {
      fr: "Console élégante en cèdre de l'Atlas avec tiroir secret. Parfum naturel du bois préservé.",
      en: "Elegant Atlas cedar console with secret drawer. Natural wood scent preserved.",
      ar: "كونسول أنيق من خشب أرز الأطلس مع درج سري. رائحة الخشب الطبيعية محفوظة.",
      es: "Elegante consola de cedro del Atlas con cajón secreto. Aroma natural de la madera preservado.",
    },
    price: 3800,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80",
      "https://images.unsplash.com/photo-1551298370-9d3d53bc4f7e?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 7,
    featured: false,
    isNew: true,
    isSale: false,
    rating: 4.6,
    reviewCount: 8,
    materials: ["Cèdre de l'Atlas", "Laiton"],
    dimensions: { width: 100, height: 85, depth: 35, unit: "cm" },
    weight: { value: 18, unit: "kg" },
    woodType: "Cèdre",
    finishType: "Ciré",
    handcrafted: true,
    customizable: false,
    deliveryTime: "2-3 semaines",
    tags: ["console", "entrée", "cèdre", "traditionnel"],
    createdAt: "2024-03-05",
  },
  {
    id: "4",
    slug: "table-basse-thuya",
    category: "tables",
    name: {
      fr: "Table Basse en Thuya",
      en: "Thuya Wood Coffee Table",
      ar: "طاولة قهوة من خشب الثويا",
      es: "Mesa de Centro de Tuya",
    },
    description: {
      fr: "Table basse unique avec plateau en loupe de thuya. Chaque pièce est unique avec ses motifs naturels.",
      en: "Unique coffee table with thuya burl top. Each piece is unique with natural patterns.",
      ar: "طاولة قهوة فريدة بسطح من خشب الثويا. كل قطعة فريدة بأنماطها الطبيعية.",
      es: "Mesa de centro única con tapa de raíz de tuya. Cada pieza es única con sus patrones naturales.",
    },
    price: 6500,
    originalPrice: 7500,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 2,
    featured: true,
    isNew: false,
    isSale: true,
    rating: 4.9,
    reviewCount: 31,
    materials: ["Thuya d'Essaouira", "Citronnier"],
    dimensions: { width: 90, height: 40, depth: 90, unit: "cm" },
    weight: { value: 22, unit: "kg" },
    woodType: "Thuya",
    finishType: "Vernis brillant",
    handcrafted: true,
    customizable: false,
    deliveryTime: "3-4 semaines",
    tags: ["table basse", "thuya", "artisanal", "luxe"],
    createdAt: "2024-01-08",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CHAISES (5-8)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "5",
    slug: "chaise-traditionnelle-sculptee",
    category: "chaises",
    name: {
      fr: "Chaise Traditionnelle Sculptée",
      en: "Traditional Carved Chair",
      ar: "كرسي تقليدي منحوت",
      es: "Silla Tradicional Tallada",
    },
    description: {
      fr: "Chaise artisanale avec dossier sculpté de motifs géométriques marocains. Assise en cuir tanné naturellement.",
      en: "Handcrafted chair with backrest carved with Moroccan geometric patterns. Naturally tanned leather seat.",
      ar: "كرسي حرفي بظهر منحوت بزخارف هندسية مغربية. مقعد من الجلد المدبوغ طبيعياً.",
      es: "Silla artesanal con respaldo tallado con patrones geométricos marroquíes. Asiento de cuero curtido naturalmente.",
    },
    price: 2200,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80",
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 12,
    featured: true,
    isNew: false,
    isSale: false,
    rating: 4.7,
    reviewCount: 19,
    materials: ["Noyer", "Cuir naturel"],
    dimensions: { width: 45, height: 95, depth: 50, unit: "cm" },
    weight: { value: 8, unit: "kg" },
    woodType: "Noyer",
    finishType: "Ciré",
    handcrafted: true,
    customizable: true,
    deliveryTime: "2-3 semaines",
    tags: ["chaise", "traditionnel", "sculpté", "cuir"],
    createdAt: "2024-02-01",
  },
  {
    id: "6",
    slug: "tabouret-bar-moderne",
    category: "chaises",
    name: {
      fr: "Tabouret de Bar Moderne",
      en: "Modern Bar Stool",
      ar: "مقعد بار حديث",
      es: "Taburete de Bar Moderno",
    },
    description: {
      fr: "Tabouret de bar design alliant bois et métal. Hauteur ajustable et repose-pieds intégré.",
      en: "Design bar stool combining wood and metal. Adjustable height with integrated footrest.",
      ar: "مقعد بار بتصميم يجمع بين الخشب والمعدن. ارتفاع قابل للتعديل مع مسند قدم مدمج.",
      es: "Taburete de bar de diseño que combina madera y metal. Altura ajustable con reposapiés integrado.",
    },
    price: 1800,
    originalPrice: 2100,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1549497538-303791108f95?w=800&q=80",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 8,
    featured: false,
    isNew: true,
    isSale: true,
    rating: 4.5,
    reviewCount: 14,
    materials: ["Chêne", "Acier noir"],
    dimensions: { width: 40, height: 75, depth: 40, unit: "cm" },
    weight: { value: 6, unit: "kg" },
    woodType: "Chêne",
    finishType: "Laqué",
    handcrafted: true,
    customizable: true,
    deliveryTime: "1-2 semaines",
    tags: ["tabouret", "bar", "moderne", "métal"],
    createdAt: "2024-03-10",
  },
  {
    id: "7",
    slug: "fauteuil-lecture-cuir",
    category: "chaises",
    name: {
      fr: "Fauteuil de Lecture en Cuir",
      en: "Leather Reading Chair",
      ar: "كرسي قراءة جلدي",
      es: "Sillón de Lectura de Cuero",
    },
    description: {
      fr: "Fauteuil confortable parfait pour la lecture. Structure en chêne, assise et dossier en cuir pleine fleur.",
      en: "Comfortable reading chair. Oak frame with full grain leather seat and backrest.",
      ar: "كرسي مريح مثالي للقراءة. هيكل من البلوط، مقعد وظهر من الجلد الكامل.",
      es: "Sillón cómodo perfecto para la lectura. Estructura de roble, asiento y respaldo de cuero de plena flor.",
    },
    price: 5500,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 4,
    featured: true,
    isNew: false,
    isSale: false,
    rating: 4.9,
    reviewCount: 27,
    materials: ["Chêne massif", "Cuir pleine fleur"],
    dimensions: { width: 70, height: 100, depth: 75, unit: "cm" },
    weight: { value: 18, unit: "kg" },
    woodType: "Chêne",
    finishType: "Huilé",
    handcrafted: true,
    customizable: true,
    deliveryTime: "3-4 semaines",
    tags: ["fauteuil", "lecture", "cuir", "confort"],
    createdAt: "2024-01-25",
  },
  {
    id: "8",
    slug: "banc-entree-rangement",
    category: "chaises",
    name: {
      fr: "Banc d'Entrée avec Rangement",
      en: "Entryway Bench with Storage",
      ar: "مقعد مدخل مع تخزين",
      es: "Banco de Entrada con Almacenamiento",
    },
    description: {
      fr: "Banc pratique pour l'entrée avec espace de rangement pour chaussures. Design minimaliste en hêtre.",
      en: "Practical entryway bench with shoe storage space. Minimalist beech design.",
      ar: "مقعد عملي للمدخل مع مساحة تخزين للأحذية. تصميم بسيط من خشب الزان.",
      es: "Banco práctico para la entrada con espacio de almacenamiento para zapatos. Diseño minimalista en haya.",
    },
    price: 2800,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 6,
    featured: false,
    isNew: true,
    isSale: false,
    rating: 4.4,
    reviewCount: 11,
    materials: ["Hêtre", "Tissu coton"],
    dimensions: { width: 100, height: 50, depth: 40, unit: "cm" },
    weight: { value: 12, unit: "kg" },
    woodType: "Hêtre",
    finishType: "Vernis mat",
    handcrafted: true,
    customizable: true,
    deliveryTime: "2-3 semaines",
    tags: ["banc", "entrée", "rangement", "minimaliste"],
    createdAt: "2024-03-15",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // RANGEMENT (9-12)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "9",
    slug: "bibliotheque-murale-modulaire",
    category: "rangement",
    name: {
      fr: "Bibliothèque Murale Modulaire",
      en: "Modular Wall Bookcase",
      ar: "مكتبة حائط معيارية",
      es: "Biblioteca de Pared Modular",
    },
    description: {
      fr: "Système de bibliothèque modulaire personnalisable. Modules combinables selon vos besoins et votre espace.",
      en: "Customizable modular bookcase system. Combinable modules according to your needs and space.",
      ar: "نظام مكتبة معياري قابل للتخصيص. وحدات قابلة للدمج حسب احتياجاتك ومساحتك.",
      es: "Sistema de biblioteca modular personalizable. Módulos combinables según sus necesidades y espacio.",
    },
    price: 8500,
    originalPrice: 9500,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 3,
    featured: true,
    isNew: false,
    isSale: true,
    rating: 4.8,
    reviewCount: 22,
    materials: ["Chêne", "Acier"],
    dimensions: { width: 180, height: 220, depth: 35, unit: "cm" },
    weight: { value: 85, unit: "kg" },
    woodType: "Chêne",
    finishType: "Laqué mat",
    handcrafted: true,
    customizable: true,
    deliveryTime: "4-6 semaines",
    tags: ["bibliothèque", "modulaire", "rangement", "bureau"],
    createdAt: "2024-01-12",
  },
  {
    id: "10",
    slug: "armoire-cedre-traditionnelle",
    category: "rangement",
    name: {
      fr: "Armoire en Cèdre Traditionnelle",
      en: "Traditional Cedar Wardrobe",
      ar: "خزانة أرز تقليدية",
      es: "Armario de Cedro Tradicional",
    },
    description: {
      fr: "Armoire majestueuse en cèdre de l'Atlas avec portes sculptées. Protection naturelle contre les mites.",
      en: "Majestic Atlas cedar wardrobe with carved doors. Natural moth protection.",
      ar: "خزانة فخمة من أرز الأطلس مع أبواب منحوتة. حماية طبيعية ضد العث.",
      es: "Armario majestuoso de cedro del Atlas con puertas talladas. Protección natural contra polillas.",
    },
    price: 15000,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 2,
    featured: true,
    isNew: false,
    isSale: false,
    rating: 5.0,
    reviewCount: 18,
    materials: ["Cèdre de l'Atlas", "Laiton ancien"],
    dimensions: { width: 150, height: 200, depth: 60, unit: "cm" },
    weight: { value: 120, unit: "kg" },
    woodType: "Cèdre",
    finishType: "Ciré naturel",
    handcrafted: true,
    customizable: true,
    deliveryTime: "6-8 semaines",
    tags: ["armoire", "cèdre", "traditionnel", "chambre"],
    createdAt: "2024-02-08",
  },
  {
    id: "11",
    slug: "buffet-salle-manger",
    category: "rangement",
    name: {
      fr: "Buffet de Salle à Manger",
      en: "Dining Room Sideboard",
      ar: "بوفيه غرفة الطعام",
      es: "Aparador de Comedor",
    },
    description: {
      fr: "Buffet élégant avec portes coulissantes et tiroirs à couverts. Design contemporain en noyer.",
      en: "Elegant sideboard with sliding doors and cutlery drawers. Contemporary walnut design.",
      ar: "بوفيه أنيق مع أبواب منزلقة وأدراج للأدوات. تصميم معاصر من الجوز.",
      es: "Aparador elegante con puertas correderas y cajones para cubiertos. Diseño contemporáneo en nogal.",
    },
    price: 7200,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=800&q=80",
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 4,
    featured: false,
    isNew: true,
    isSale: false,
    rating: 4.6,
    reviewCount: 9,
    materials: ["Noyer", "Verre fumé"],
    dimensions: { width: 160, height: 85, depth: 45, unit: "cm" },
    weight: { value: 55, unit: "kg" },
    woodType: "Noyer",
    finishType: "Vernis satiné",
    handcrafted: true,
    customizable: true,
    deliveryTime: "3-4 semaines",
    tags: ["buffet", "salle à manger", "rangement", "contemporain"],
    createdAt: "2024-03-01",
  },
  {
    id: "12",
    slug: "coffre-rangement-sculpte",
    category: "rangement",
    name: {
      fr: "Coffre de Rangement Sculpté",
      en: "Carved Storage Chest",
      ar: "صندوق تخزين منحوت",
      es: "Cofre de Almacenamiento Tallado",
    },
    description: {
      fr: "Coffre traditionnel marocain avec sculptures géométriques. Idéal en bout de lit ou comme table basse.",
      en: "Traditional Moroccan chest with geometric carvings. Ideal at foot of bed or as coffee table.",
      ar: "صندوق مغربي تقليدي بنقوش هندسية. مثالي في نهاية السرير أو كطاولة قهوة.",
      es: "Cofre tradicional marroquí con tallas geométricas. Ideal al pie de la cama o como mesa de centro.",
    },
    price: 3200,
    originalPrice: 3800,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1616464916356-3a777b2b60b1?w=800&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 6,
    featured: false,
    isNew: false,
    isSale: true,
    rating: 4.5,
    reviewCount: 16,
    materials: ["Thuya", "Fer forgé"],
    dimensions: { width: 100, height: 50, depth: 45, unit: "cm" },
    weight: { value: 20, unit: "kg" },
    woodType: "Thuya",
    finishType: "Ciré",
    handcrafted: true,
    customizable: false,
    deliveryTime: "2-3 semaines",
    tags: ["coffre", "rangement", "traditionnel", "sculpté"],
    createdAt: "2024-01-20",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // DÉCORATION (13-16)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "13",
    slug: "miroir-cadre-sculpte",
    category: "decoration",
    name: {
      fr: "Miroir Cadre Sculpté",
      en: "Carved Frame Mirror",
      ar: "مرآة بإطار منحوت",
      es: "Espejo con Marco Tallado",
    },
    description: {
      fr: "Grand miroir avec cadre en bois sculpté de motifs floraux. Pièce maîtresse pour votre intérieur.",
      en: "Large mirror with carved wood frame with floral patterns. Statement piece for your interior.",
      ar: "مرآة كبيرة بإطار خشبي منحوت بزخارف نباتية. قطعة مميزة لديكورك الداخلي.",
      es: "Espejo grande con marco de madera tallado con motivos florales. Pieza central para su interior.",
    },
    price: 2800,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=800&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 5,
    featured: true,
    isNew: false,
    isSale: false,
    rating: 4.7,
    reviewCount: 21,
    materials: ["Tilleul", "Miroir biseauté"],
    dimensions: { width: 80, height: 120, depth: 5, unit: "cm" },
    weight: { value: 15, unit: "kg" },
    woodType: "Tilleul",
    finishType: "Doré à la feuille",
    handcrafted: true,
    customizable: true,
    deliveryTime: "2-3 semaines",
    tags: ["miroir", "décoration", "sculpté", "salon"],
    createdAt: "2024-02-12",
  },
  {
    id: "14",
    slug: "horloge-murale-bois",
    category: "decoration",
    name: {
      fr: "Horloge Murale en Bois",
      en: "Wooden Wall Clock",
      ar: "ساعة حائط خشبية",
      es: "Reloj de Pared de Madera",
    },
    description: {
      fr: "Horloge murale artisanale avec cadran en marqueterie. Mouvement silencieux haute qualité.",
      en: "Handcrafted wall clock with marquetry dial. High quality silent movement.",
      ar: "ساعة حائط حرفية بقرص من الترصيع. حركة صامتة عالية الجودة.",
      es: "Reloj de pared artesanal con esfera de marquetería. Movimiento silencioso de alta calidad.",
    },
    price: 1500,
    originalPrice: 1800,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 10,
    featured: false,
    isNew: true,
    isSale: true,
    rating: 4.4,
    reviewCount: 13,
    materials: ["Noyer", "Citronnier", "Ébène"],
    dimensions: { width: 40, height: 40, depth: 5, unit: "cm" },
    weight: { value: 2, unit: "kg" },
    woodType: "Noyer",
    finishType: "Vernis mat",
    handcrafted: true,
    customizable: false,
    deliveryTime: "1-2 semaines",
    tags: ["horloge", "décoration", "marqueterie", "mural"],
    createdAt: "2024-03-08",
  },
  {
    id: "15",
    slug: "cadre-photo-thuya",
    category: "decoration",
    name: {
      fr: "Cadre Photo en Thuya",
      en: "Thuya Photo Frame",
      ar: "إطار صور من الثويا",
      es: "Marco de Fotos de Tuya",
    },
    description: {
      fr: "Cadre photo en thuya d'Essaouira avec veines naturelles uniques. Format A4 portrait ou paysage.",
      en: "Essaouira thuya photo frame with unique natural veins. A4 format portrait or landscape.",
      ar: "إطار صور من ثويا الصويرة بعروق طبيعية فريدة. حجم A4 عمودي أو أفقي.",
      es: "Marco de fotos de tuya de Essaouira con vetas naturales únicas. Formato A4 vertical u horizontal.",
    },
    price: 450,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 20,
    featured: false,
    isNew: false,
    isSale: false,
    rating: 4.3,
    reviewCount: 28,
    materials: ["Thuya d'Essaouira"],
    dimensions: { width: 25, height: 35, depth: 2, unit: "cm" },
    weight: { value: 0.5, unit: "kg" },
    woodType: "Thuya",
    finishType: "Vernis brillant",
    handcrafted: true,
    customizable: false,
    deliveryTime: "1 semaine",
    tags: ["cadre", "photo", "thuya", "décoration"],
    createdAt: "2024-01-05",
  },
  {
    id: "16",
    slug: "sculpture-bois-abstraite",
    category: "decoration",
    name: {
      fr: "Sculpture Abstraite en Bois",
      en: "Abstract Wood Sculpture",
      ar: "تمثال خشبي تجريدي",
      es: "Escultura Abstracta de Madera",
    },
    description: {
      fr: "Sculpture contemporaine en olivier massif. Pièce unique signée par l'artiste.",
      en: "Contemporary sculpture in solid olive wood. Unique signed piece by the artist.",
      ar: "تمثال معاصر من خشب الزيتون الصلب. قطعة فريدة موقعة من الفنان.",
      es: "Escultura contemporánea en olivo macizo. Pieza única firmada por el artista.",
    },
    price: 3500,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80",
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 1,
    featured: true,
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewCount: 7,
    materials: ["Olivier massif"],
    dimensions: { width: 30, height: 60, depth: 25, unit: "cm" },
    weight: { value: 8, unit: "kg" },
    woodType: "Olivier",
    finishType: "Huilé naturel",
    handcrafted: true,
    customizable: false,
    deliveryTime: "Disponible immédiatement",
    tags: ["sculpture", "art", "olivier", "contemporain"],
    createdAt: "2024-03-12",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ACCESSOIRES (17-19)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "17",
    slug: "boite-bijoux-marqueterie",
    category: "accessoires",
    name: {
      fr: "Boîte à Bijoux Marqueterie",
      en: "Marquetry Jewelry Box",
      ar: "صندوق مجوهرات بالترصيع",
      es: "Joyero de Marquetería",
    },
    description: {
      fr: "Boîte à bijoux avec marqueterie traditionnelle d'Essaouira. Intérieur velours avec compartiments.",
      en: "Jewelry box with traditional Essaouira marquetry. Velvet interior with compartments.",
      ar: "صندوق مجوهرات بترصيع الصويرة التقليدي. داخلية مخملية مع حجرات.",
      es: "Joyero con marquetería tradicional de Essaouira. Interior de terciopelo con compartimentos.",
    },
    price: 850,
    originalPrice: 950,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=800&q=80",
      "https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 15,
    featured: false,
    isNew: false,
    isSale: true,
    rating: 4.6,
    reviewCount: 34,
    materials: ["Thuya", "Citronnier", "Velours"],
    dimensions: { width: 20, height: 10, depth: 15, unit: "cm" },
    weight: { value: 0.8, unit: "kg" },
    woodType: "Thuya",
    finishType: "Vernis brillant",
    handcrafted: true,
    customizable: false,
    deliveryTime: "1 semaine",
    tags: ["boîte", "bijoux", "marqueterie", "cadeau"],
    createdAt: "2024-01-18",
  },
  {
    id: "18",
    slug: "porte-stylos-bureau",
    category: "accessoires",
    name: {
      fr: "Porte-Stylos de Bureau",
      en: "Desk Pen Holder",
      ar: "حامل أقلام مكتبي",
      es: "Portalápices de Escritorio",
    },
    description: {
      fr: "Porte-stylos élégant en ébène avec compartiments multiples. Accessoire de bureau raffiné.",
      en: "Elegant ebony pen holder with multiple compartments. Refined desk accessory.",
      ar: "حامل أقلام أنيق من الأبنوس مع حجرات متعددة. إكسسوار مكتب راقٍ.",
      es: "Elegante portalápices de ébano con múltiples compartimentos. Accesorio de escritorio refinado.",
    },
    price: 380,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1616464916356-3a777b2b60b1?w=800&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 25,
    featured: false,
    isNew: true,
    isSale: false,
    rating: 4.2,
    reviewCount: 8,
    materials: ["Ébène", "Cuivre"],
    dimensions: { width: 12, height: 10, depth: 8, unit: "cm" },
    weight: { value: 0.4, unit: "kg" },
    woodType: "Ébène",
    finishType: "Poli",
    handcrafted: true,
    customizable: false,
    deliveryTime: "1 semaine",
    tags: ["bureau", "accessoire", "ébène", "stylos"],
    createdAt: "2024-03-05",
  },
  {
    id: "19",
    slug: "plateau-service-olivier",
    category: "accessoires",
    name: {
      fr: "Plateau de Service en Olivier",
      en: "Olive Wood Serving Tray",
      ar: "صينية تقديم من خشب الزيتون",
      es: "Bandeja de Servicio de Olivo",
    },
    description: {
      fr: "Plateau de service en olivier massif avec poignées intégrées. Idéal pour le thé à la menthe.",
      en: "Solid olive wood serving tray with integrated handles. Ideal for mint tea.",
      ar: "صينية تقديم من خشب الزيتون الصلب مع مقابض مدمجة. مثالية للشاي بالنعناع.",
      es: "Bandeja de servicio de olivo macizo con asas integradas. Ideal para el té de menta.",
    },
    price: 650,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?w=800&q=80",
      "https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 12,
    featured: false,
    isNew: false,
    isSale: false,
    rating: 4.8,
    reviewCount: 19,
    materials: ["Olivier massif"],
    dimensions: { width: 45, height: 5, depth: 30, unit: "cm" },
    weight: { value: 1.5, unit: "kg" },
    woodType: "Olivier",
    finishType: "Huilé alimentaire",
    handcrafted: true,
    customizable: false,
    deliveryTime: "1-2 semaines",
    tags: ["plateau", "service", "olivier", "cuisine"],
    createdAt: "2024-02-15",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CUISINE (20-22)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "20",
    slug: "planche-decouper-artisanale",
    category: "cuisine",
    name: {
      fr: "Planche à Découper Artisanale",
      en: "Artisan Cutting Board",
      ar: "لوح تقطيع حرفي",
      es: "Tabla de Cortar Artesanal",
    },
    description: {
      fr: "Planche à découper en noyer avec rigole pour le jus. Traitement alimentaire naturel.",
      en: "Walnut cutting board with juice groove. Natural food-safe treatment.",
      ar: "لوح تقطيع من الجوز مع أخدود للعصير. معالجة طبيعية آمنة للطعام.",
      es: "Tabla de cortar de nogal con ranura para jugos. Tratamiento natural apto para alimentos.",
    },
    price: 480,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
      "https://images.unsplash.com/photo-1574739782594-db4ead022697?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 18,
    featured: false,
    isNew: false,
    isSale: false,
    rating: 4.7,
    reviewCount: 42,
    materials: ["Noyer"],
    dimensions: { width: 40, height: 3, depth: 25, unit: "cm" },
    weight: { value: 1.2, unit: "kg" },
    woodType: "Noyer",
    finishType: "Huilé alimentaire",
    handcrafted: true,
    customizable: true,
    deliveryTime: "1 semaine",
    tags: ["planche", "cuisine", "noyer", "découper"],
    createdAt: "2024-01-22",
  },
  {
    id: "21",
    slug: "mortier-pilon-olivier",
    category: "cuisine",
    name: {
      fr: "Mortier et Pilon en Olivier",
      en: "Olive Wood Mortar and Pestle",
      ar: "هاون ومدقة من خشب الزيتون",
      es: "Mortero y Maja de Olivo",
    },
    description: {
      fr: "Mortier et pilon traditionnels en olivier. Parfait pour les épices et les sauces.",
      en: "Traditional olive wood mortar and pestle. Perfect for spices and sauces.",
      ar: "هاون ومدقة تقليدية من خشب الزيتون. مثالي للتوابل والصلصات.",
      es: "Mortero y maja tradicionales de olivo. Perfecto para especias y salsas.",
    },
    price: 320,
    originalPrice: 380,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 14,
    featured: false,
    isNew: false,
    isSale: true,
    rating: 4.5,
    reviewCount: 23,
    materials: ["Olivier"],
    dimensions: { width: 12, height: 10, depth: 12, unit: "cm" },
    weight: { value: 0.6, unit: "kg" },
    woodType: "Olivier",
    finishType: "Poncé fin",
    handcrafted: true,
    customizable: false,
    deliveryTime: "1 semaine",
    tags: ["mortier", "cuisine", "olivier", "épices"],
    createdAt: "2024-02-05",
  },
  {
    id: "22",
    slug: "set-ustensiles-cuisine",
    category: "cuisine",
    name: {
      fr: "Set Ustensiles de Cuisine",
      en: "Kitchen Utensil Set",
      ar: "مجموعة أدوات المطبخ",
      es: "Set de Utensilios de Cocina",
    },
    description: {
      fr: "Set de 5 ustensiles de cuisine en hêtre: spatule, cuillère, fourchette, louche et écumoire.",
      en: "Set of 5 beech kitchen utensils: spatula, spoon, fork, ladle and skimmer.",
      ar: "مجموعة من 5 أدوات مطبخ من الزان: ملعقة، ملعقة كبيرة، شوكة، مغرفة ومصفاة.",
      es: "Set de 5 utensilios de cocina de haya: espátula, cuchara, tenedor, cucharón y espumadera.",
    },
    price: 280,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 20,
    featured: false,
    isNew: true,
    isSale: false,
    rating: 4.4,
    reviewCount: 17,
    materials: ["Hêtre"],
    dimensions: { width: 30, height: 5, depth: 10, unit: "cm" },
    weight: { value: 0.3, unit: "kg" },
    woodType: "Hêtre",
    finishType: "Huilé alimentaire",
    handcrafted: true,
    customizable: false,
    deliveryTime: "1 semaine",
    tags: ["ustensiles", "cuisine", "hêtre", "set"],
    createdAt: "2024-03-01",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // EXTÉRIEUR (23-24)
  // ════════════════════════════════════════════════════════════════════════════
  {
    id: "23",
    slug: "banc-jardin-teck",
    category: "exterieur",
    name: {
      fr: "Banc de Jardin en Teck",
      en: "Teak Garden Bench",
      ar: "مقعد حديقة من خشب الساج",
      es: "Banco de Jardín de Teca",
    },
    description: {
      fr: "Banc d'extérieur en teck massif résistant aux intempéries. Design classique intemporel.",
      en: "Weather-resistant solid teak outdoor bench. Timeless classic design.",
      ar: "مقعد خارجي من خشب الساج الصلب مقاوم للعوامل الجوية. تصميم كلاسيكي خالد.",
      es: "Banco de exterior de teca maciza resistente a la intemperie. Diseño clásico atemporal.",
    },
    price: 5800,
    originalPrice: 6500,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=800&q=80",
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 4,
    featured: true,
    isNew: false,
    isSale: true,
    rating: 4.9,
    reviewCount: 15,
    materials: ["Teck massif", "Acier inoxydable"],
    dimensions: { width: 150, height: 90, depth: 60, unit: "cm" },
    weight: { value: 35, unit: "kg" },
    woodType: "Teck",
    finishType: "Huilé teck",
    handcrafted: true,
    customizable: true,
    deliveryTime: "2-3 semaines",
    tags: ["banc", "jardin", "teck", "extérieur"],
    createdAt: "2024-01-30",
  },
  {
    id: "24",
    slug: "table-pique-nique-famille",
    category: "exterieur",
    name: {
      fr: "Table Pique-Nique Familiale",
      en: "Family Picnic Table",
      ar: "طاولة نزهة عائلية",
      es: "Mesa de Picnic Familiar",
    },
    description: {
      fr: "Grande table de pique-nique avec bancs intégrés. Traitement autoclave pour une longue durée de vie.",
      en: "Large picnic table with integrated benches. Autoclave treatment for long life.",
      ar: "طاولة نزهة كبيرة مع مقاعد مدمجة. معالجة بالضغط لعمر طويل.",
      es: "Gran mesa de picnic con bancos integrados. Tratamiento en autoclave para larga vida.",
    },
    price: 4200,
    currency: "MAD",
    images: [
      "https://images.unsplash.com/photo-1616464916356-3a777b2b60b1?w=800&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80"
    ],
    inStock: true,
    stockQuantity: 3,
    featured: false,
    isNew: true,
    isSale: false,
    rating: 4.6,
    reviewCount: 11,
    materials: ["Pin traité autoclave", "Acier galvanisé"],
    dimensions: { width: 180, height: 75, depth: 150, unit: "cm" },
    weight: { value: 55, unit: "kg" },
    woodType: "Pin",
    finishType: "Autoclave classe 4",
    handcrafted: true,
    customizable: true,
    deliveryTime: "2-3 semaines",
    tags: ["table", "pique-nique", "jardin", "famille"],
    createdAt: "2024-03-10",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(limit?: number): Product[] {
  const featured = products.filter((p) => p.featured);
  return limit ? featured.slice(0, limit) : featured;
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getSaleProducts(): Product[] {
  return products.filter((p) => p.isSale);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getRelatedProducts(currentSlug: string, category: string, limit = 4): Product[] {
  return products
    .filter((p) => p.category === category && p.slug !== currentSlug)
    .slice(0, limit);
}

export function getCategoryLabel(categoryId: string, locale: Locale): string {
  const category = productCategories.find((c) => c.id === categoryId);
  return category?.[locale] ?? categoryId;
}

export function formatPrice(price: number, currency: string = "MAD"): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}
