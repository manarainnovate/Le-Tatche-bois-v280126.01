import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// ═══════════════════════════════════════════════════════════
// Prisma client setup (adapter pattern required)
// ═══════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════
// 102 UNIQUE SLIDE CONTENTS - Real professional titles
// Title max 6 words, Subtitle max ~15 words
// All 4 languages: FR, EN, ES, AR
// ═══════════════════════════════════════════════════════════

interface SlideContent {
  titleFr: string;
  titleEn: string;
  titleEs: string;
  titleAr: string;
  subtitleFr: string;
  subtitleEn: string;
  subtitleEs: string;
  subtitleAr: string;
}

const slideContents: SlideContent[] = [
  // ── PORTES (Doors) - 10 slides ──
  { titleFr: "Portes Sur Mesure", titleEn: "Custom Crafted Doors", titleEs: "Puertas a Medida", titleAr: "أبواب حسب الطلب", subtitleFr: "Chaque porte raconte une histoire de savoir-faire", subtitleEn: "Every door tells a story of craftsmanship", subtitleEs: "Cada puerta cuenta una historia de artesanía", subtitleAr: "كل باب يروي قصة من الحرفية" },
  { titleFr: "L'Art des Portes", titleEn: "The Art of Doors", titleEs: "El Arte de las Puertas", titleAr: "فن صناعة الأبواب", subtitleFr: "Bois massif sculpté avec passion", subtitleEn: "Solid wood carved with passion", subtitleEs: "Madera maciza tallada con pasión", subtitleAr: "خشب صلب منحوت بشغف" },
  { titleFr: "Portes en Bois Noble", titleEn: "Noble Wood Doors", titleEs: "Puertas de Madera Noble", titleAr: "أبواب من خشب نبيل", subtitleFr: "Des portes qui subliment votre intérieur", subtitleEn: "Doors that elevate your interior", subtitleEs: "Puertas que realzan su interior", subtitleAr: "أبواب ترتقي بديكورك الداخلي" },
  { titleFr: "Portes d'Exception", titleEn: "Exceptional Doors", titleEs: "Puertas Excepcionales", titleAr: "أبواب استثنائية", subtitleFr: "Alliance parfaite de tradition et modernité", subtitleEn: "Perfect blend of tradition and modernity", subtitleEs: "Fusión perfecta de tradición y modernidad", subtitleAr: "مزيج مثالي بين التقليد والحداثة" },
  { titleFr: "Entrées Majestueuses", titleEn: "Majestic Entrances", titleEs: "Entradas Majestuosas", titleAr: "مداخل فخمة", subtitleFr: "Fabriquées à la main à Tanger", subtitleEn: "Handmade in Tangier", subtitleEs: "Hechas a mano en Tánger", subtitleAr: "مصنوعة يدوياً في طنجة" },
  { titleFr: "Portes Sculptées Main", titleEn: "Hand-Sculpted Doors", titleEs: "Puertas Esculpidas a Mano", titleAr: "أبواب منحوتة يدوياً", subtitleFr: "L'excellence au service de votre maison", subtitleEn: "Excellence at the service of your home", subtitleEs: "Excelencia al servicio de su hogar", subtitleAr: "التميز في خدمة منزلك" },
  { titleFr: "Design & Sécurité", titleEn: "Design & Security", titleEs: "Diseño y Seguridad", titleAr: "تصميم وأمان", subtitleFr: "Finitions impeccables, bois sélectionné", subtitleEn: "Impeccable finishes, selected wood", subtitleEs: "Acabados impecables, madera seleccionada", subtitleAr: "تشطيبات متقنة، خشب مختار" },
  { titleFr: "Portes Traditionnelles", titleEn: "Traditional Doors", titleEs: "Puertas Tradicionales", titleAr: "أبواب تقليدية", subtitleFr: "Créations sur mesure pour chaque espace", subtitleEn: "Custom creations for every space", subtitleEs: "Creaciones a medida para cada espacio", subtitleAr: "إبداعات مخصصة لكل مساحة" },
  { titleFr: "Savoir-Faire Artisanal", titleEn: "Artisan Craftsmanship", titleEs: "Artesanía Experta", titleAr: "حرفية متقنة", subtitleFr: "Protection et élégance réunies", subtitleEn: "Protection and elegance combined", subtitleEs: "Protección y elegancia combinadas", subtitleAr: "حماية وأناقة في آن واحد" },
  { titleFr: "Portes Uniques", titleEn: "One-of-a-Kind Doors", titleEs: "Puertas Únicas", titleAr: "أبواب فريدة", subtitleFr: "Du dessin à la réalisation, tout est art", subtitleEn: "From design to creation, everything is art", subtitleEs: "Del diseño a la creación, todo es arte", subtitleAr: "من التصميم إلى الإنجاز، كل شيء فن" },

  // ── ESCALIERS (Stairs) - 8 slides ──
  { titleFr: "Escaliers Sculptés Main", titleEn: "Hand-Sculpted Stairs", titleEs: "Escaleras Esculpidas a Mano", titleAr: "سلالم منحوتة يدوياً", subtitleFr: "Des escaliers qui deviennent œuvres d'art", subtitleEn: "Staircases that become works of art", subtitleEs: "Escaleras que se convierten en obras de arte", subtitleAr: "سلالم تتحول إلى أعمال فنية" },
  { titleFr: "L'Art de Monter", titleEn: "The Art of Ascending", titleEs: "El Arte de Ascender", titleAr: "فن الصعود", subtitleFr: "Bois nobles sculptés avec précision", subtitleEn: "Noble woods carved with precision", subtitleEs: "Maderas nobles talladas con precisión", subtitleAr: "أخشاب نبيلة منحوتة بدقة" },
  { titleFr: "Escaliers Majestueux", titleEn: "Majestic Staircases", titleEs: "Escaleras Majestuosas", titleAr: "سلالم فخمة", subtitleFr: "Chaque marche est un chef-d'œuvre", subtitleEn: "Every step is a masterpiece", subtitleEs: "Cada escalón es una obra maestra", subtitleAr: "كل درجة تحفة فنية" },
  { titleFr: "Marches de Prestige", titleEn: "Prestige Steps", titleEs: "Escalones de Prestigio", titleAr: "درجات مرموقة", subtitleFr: "L'escalier, pièce maîtresse de votre maison", subtitleEn: "The staircase, centerpiece of your home", subtitleEs: "La escalera, pieza central de su hogar", subtitleAr: "السلم، قطعة محورية في منزلك" },
  { titleFr: "Spirales en Bois Noble", titleEn: "Noble Wood Spirals", titleEs: "Espirales de Madera Noble", titleAr: "لوالب من خشب نبيل", subtitleFr: "Rampes et balustres sculptés à la main", subtitleEn: "Hand-carved railings and balusters", subtitleEs: "Barandillas y balaustres tallados a mano", subtitleAr: "درابزينات ودعامات منحوتة يدوياً" },
  { titleFr: "Rampes Artisanales", titleEn: "Artisan Railings", titleEs: "Barandillas Artesanales", titleAr: "درابزينات حرفية", subtitleFr: "Du classique au contemporain", subtitleEn: "From classic to contemporary", subtitleEs: "De lo clásico a lo contemporáneo", subtitleAr: "من الكلاسيكي إلى المعاصر" },
  { titleFr: "Escaliers Sur Mesure", titleEn: "Custom Staircases", titleEs: "Escaleras a Medida", titleAr: "سلالم حسب الطلب", subtitleFr: "Fabrication 100% artisanale à Tanger", subtitleEn: "100% handcrafted in Tangier", subtitleEs: "100% artesanal en Tánger", subtitleAr: "صناعة يدوية 100% في طنجة" },
  { titleFr: "Élégance à Chaque Marche", titleEn: "Elegance at Every Step", titleEs: "Elegancia en Cada Escalón", titleAr: "أناقة في كل درجة", subtitleFr: "Qualité et durabilité garanties", subtitleEn: "Quality and durability guaranteed", subtitleEs: "Calidad y durabilidad garantizadas", subtitleAr: "جودة ومتانة مضمونة" },

  // ── PLAFONDS (Ceilings) - 8 slides ──
  { titleFr: "Plafonds en Bois Sculpté", titleEn: "Sculpted Wood Ceilings", titleEs: "Techos de Madera Tallada", titleAr: "أسقف خشبية منحوتة", subtitleFr: "Des plafonds qui transforment vos espaces", subtitleEn: "Ceilings that transform your spaces", subtitleEs: "Techos que transforman sus espacios", subtitleAr: "أسقف تحول مساحاتك" },
  { titleFr: "Plafonds d'Exception", titleEn: "Exceptional Ceilings", titleEs: "Techos Excepcionales", titleAr: "أسقف استثنائية", subtitleFr: "Motifs géométriques sculptés à la main", subtitleEn: "Hand-carved geometric patterns", subtitleEs: "Patrones geométricos tallados a mano", subtitleAr: "أنماط هندسية منحوتة يدوياً" },
  { titleFr: "L'Art du Plafond", titleEn: "The Art of Ceilings", titleEs: "El Arte del Techo", titleAr: "فن الأسقف", subtitleFr: "Tradition marocaine, exécution parfaite", subtitleEn: "Moroccan tradition, perfect execution", subtitleEs: "Tradición marroquí, ejecución perfecta", subtitleAr: "تقاليد مغربية، تنفيذ مثالي" },
  { titleFr: "Coupoles Artisanales", titleEn: "Artisan Domes", titleEs: "Cúpulas Artesanales", titleAr: "قباب حرفية", subtitleFr: "Le plafond devient une œuvre d'art", subtitleEn: "The ceiling becomes a work of art", subtitleEs: "El techo se convierte en obra de arte", subtitleAr: "السقف يتحول إلى عمل فني" },
  { titleFr: "Caissons en Bois Noble", titleEn: "Noble Wood Coffering", titleEs: "Artesonados de Madera", titleAr: "تجاويف من خشب نبيل", subtitleFr: "Bois de cèdre et motifs islamiques", subtitleEn: "Cedar wood and Islamic patterns", subtitleEs: "Madera de cedro y motivos islámicos", subtitleAr: "خشب الأرز وزخارف إسلامية" },
  { titleFr: "Plafonds Marocains", titleEn: "Moroccan Ceilings", titleEs: "Techos Marroquíes", titleAr: "أسقف مغربية", subtitleFr: "Artisanat ancestral au service du luxe", subtitleEn: "Ancestral craft in service of luxury", subtitleEs: "Artesanía ancestral al servicio del lujo", subtitleAr: "حرفة أصيلة في خدمة الفخامة" },
  { titleFr: "Sculptures Aériennes", titleEn: "Aerial Sculptures", titleEs: "Esculturas Aéreas", titleAr: "منحوتات سقفية", subtitleFr: "Éclairage intégré et finitions dorées", subtitleEn: "Integrated lighting and golden finishes", subtitleEs: "Iluminación integrada y acabados dorados", subtitleAr: "إضاءة مدمجة وتشطيبات ذهبية" },
  { titleFr: "Plafonds Sur Mesure", titleEn: "Custom Ceilings", titleEs: "Techos a Medida", titleAr: "أسقف حسب الطلب", subtitleFr: "Chaque détail compte dans nos plafonds", subtitleEn: "Every detail matters in our ceilings", subtitleEs: "Cada detalle importa en nuestros techos", subtitleAr: "كل تفصيلة مهمة في أسقفنا" },

  // ── CUISINES (Kitchens) - 8 slides ──
  { titleFr: "Cuisines en Bois Massif", titleEn: "Solid Wood Kitchens", titleEs: "Cocinas de Madera Maciza", titleAr: "مطابخ من خشب صلب", subtitleFr: "Cuisines fonctionnelles et élégantes", subtitleEn: "Functional and elegant kitchens", subtitleEs: "Cocinas funcionales y elegantes", subtitleAr: "مطابخ عملية وأنيقة" },
  { titleFr: "Cuisines Sur Mesure", titleEn: "Custom Kitchens", titleEs: "Cocinas a Medida", titleAr: "مطابخ حسب الطلب", subtitleFr: "Bois massif pour des cuisines durables", subtitleEn: "Solid wood for lasting kitchens", subtitleEs: "Madera maciza para cocinas duraderas", subtitleAr: "خشب صلب لمطابخ تدوم" },
  { titleFr: "L'Art Culinaire du Bois", titleEn: "Culinary Art of Wood", titleEs: "Arte Culinario de la Madera", titleAr: "فن الطبخ الخشبي", subtitleFr: "Chaque cuisine est unique comme vous", subtitleEn: "Every kitchen is unique like you", subtitleEs: "Cada cocina es única como usted", subtitleAr: "كل مطبخ فريد مثلك" },
  { titleFr: "Cuisines d'Exception", titleEn: "Exceptional Kitchens", titleEs: "Cocinas Excepcionales", titleAr: "مطابخ استثنائية", subtitleFr: "Plans de travail et rangements optimisés", subtitleEn: "Optimized countertops and storage", subtitleEs: "Encimeras y almacenamiento optimizados", subtitleAr: "أسطح عمل وتخزين محسّن" },
  { titleFr: "Espaces Gourmands", titleEn: "Gourmet Spaces", titleEs: "Espacios Gourmet", titleAr: "مساحات للذواقة", subtitleFr: "Du design à l'installation complète", subtitleEn: "From design to full installation", subtitleEs: "Del diseño a la instalación completa", subtitleAr: "من التصميم إلى التركيب الكامل" },
  { titleFr: "Cuisines Modernes en Bois", titleEn: "Modern Wood Kitchens", titleEs: "Cocinas Modernas en Madera", titleAr: "مطابخ عصرية من الخشب", subtitleFr: "Matériaux nobles, finitions parfaites", subtitleEn: "Noble materials, perfect finishes", subtitleEs: "Materiales nobles, acabados perfectos", subtitleAr: "مواد نبيلة، تشطيبات مثالية" },
  { titleFr: "Le Cœur de la Maison", titleEn: "The Heart of the Home", titleEs: "El Corazón del Hogar", titleAr: "قلب المنزل", subtitleFr: "L'espace où la famille se retrouve", subtitleEn: "Where family comes together", subtitleEs: "Donde la familia se reúne", subtitleAr: "المكان الذي تجتمع فيه العائلة" },
  { titleFr: "Fonctionnalité & Élégance", titleEn: "Functionality & Elegance", titleEs: "Funcionalidad y Elegancia", titleAr: "وظائف وأناقة", subtitleFr: "Solutions de rangement intelligentes", subtitleEn: "Smart storage solutions", subtitleEs: "Soluciones de almacenamiento inteligentes", subtitleAr: "حلول تخزين ذكية" },

  // ── PLACARDS / DRESSINGS (Wardrobes) - 8 slides ──
  { titleFr: "Placards Sur Mesure", titleEn: "Custom Wardrobes", titleEs: "Armarios a Medida", titleAr: "خزائن حسب الطلب", subtitleFr: "Maximisez votre espace avec style", subtitleEn: "Maximize your space with style", subtitleEs: "Maximice su espacio con estilo", subtitleAr: "عظّم مساحتك بأناقة" },
  { titleFr: "Rangements Élégants", titleEn: "Elegant Storage", titleEs: "Almacenamiento Elegante", titleAr: "تخزين أنيق", subtitleFr: "Solutions de rangement personnalisées", subtitleEn: "Personalized storage solutions", subtitleEs: "Soluciones de almacenamiento personalizadas", subtitleAr: "حلول تخزين مخصصة" },
  { titleFr: "Dressings de Luxe", titleEn: "Luxury Walk-in Closets", titleEs: "Vestidores de Lujo", titleAr: "غرف ملابس فاخرة", subtitleFr: "Chaque centimètre est optimisé", subtitleEn: "Every centimeter is optimized", subtitleEs: "Cada centímetro está optimizado", subtitleAr: "كل سنتيمتر محسّن" },
  { titleFr: "L'Art du Rangement", titleEn: "The Art of Organization", titleEs: "El Arte del Orden", titleAr: "فن التنظيم", subtitleFr: "Bois massif et quincaillerie premium", subtitleEn: "Solid wood and premium hardware", subtitleEs: "Madera maciza y herrajes premium", subtitleAr: "خشب صلب ومعدات فاخرة" },
  { titleFr: "Espaces Optimisés", titleEn: "Optimized Spaces", titleEs: "Espacios Optimizados", titleAr: "مساحات محسّنة", subtitleFr: "Intérieurs modulables selon vos besoins", subtitleEn: "Modular interiors for your needs", subtitleEs: "Interiores modulares según sus necesidades", subtitleAr: "تصاميم داخلية قابلة للتعديل" },
  { titleFr: "Placards en Bois Noble", titleEn: "Noble Wood Closets", titleEs: "Armarios de Madera Noble", titleAr: "خزائن من خشب نبيل", subtitleFr: "Design contemporain, fabrication artisanale", subtitleEn: "Contemporary design, artisan crafting", subtitleEs: "Diseño contemporáneo, fabricación artesanal", subtitleAr: "تصميم معاصر، صناعة حرفية" },
  { titleFr: "Dressings Sur Mesure", titleEn: "Custom Dressing Rooms", titleEs: "Vestidores a Medida", titleAr: "غرف ملابس حسب الطلب", subtitleFr: "Un dressing pensé pour votre quotidien", subtitleEn: "A dressing room designed for your daily life", subtitleEs: "Un vestidor pensado para su día a día", subtitleAr: "غرفة ملابس مصممة لحياتك اليومية" },
  { titleFr: "Votre Espace Personnel", titleEn: "Your Personal Space", titleEs: "Su Espacio Personal", titleAr: "مساحتك الشخصية", subtitleFr: "Organisation et luxe au quotidien", subtitleEn: "Daily organization and luxury", subtitleEs: "Organización y lujo diario", subtitleAr: "تنظيم وفخامة يومية" },

  // ── SALONS (Living Rooms) - 6 slides ──
  { titleFr: "Salons Marocains", titleEn: "Moroccan Living Rooms", titleEs: "Salones Marroquíes", titleAr: "صالونات مغربية", subtitleFr: "Créez un salon qui vous ressemble", subtitleEn: "Create a living room that reflects you", subtitleEs: "Cree un salón que le represente", subtitleAr: "أنشئ صالوناً يعكس شخصيتك" },
  { titleFr: "Boiseries de Salon", titleEn: "Living Room Woodwork", titleEs: "Carpintería de Salón", titleAr: "أعمال خشبية للصالون", subtitleFr: "Boiseries murales et mobilier intégré", subtitleEn: "Wall paneling and built-in furniture", subtitleEs: "Paneles murales y mobiliario integrado", subtitleAr: "ألواح جدارية وأثاث مدمج" },
  { titleFr: "Espaces de Vie", titleEn: "Living Spaces", titleEs: "Espacios de Vida", titleAr: "مساحات المعيشة", subtitleFr: "Tradition marocaine revisitée", subtitleEn: "Reimagined Moroccan tradition", subtitleEs: "Tradición marroquí reinventada", subtitleAr: "تقاليد مغربية بلمسة عصرية" },
  { titleFr: "Salons d'Exception", titleEn: "Exceptional Living Rooms", titleEs: "Salones Excepcionales", titleAr: "صالونات استثنائية", subtitleFr: "Le bois apporte chaleur et caractère", subtitleEn: "Wood brings warmth and character", subtitleEs: "La madera aporta calidez y carácter", subtitleAr: "الخشب يضفي دفئاً وطابعاً" },
  { titleFr: "L'Art de Recevoir", titleEn: "The Art of Hosting", titleEs: "El Arte de Recibir", titleAr: "فن الاستقبال", subtitleFr: "Des salons qui racontent une histoire", subtitleEn: "Living rooms that tell a story", subtitleEs: "Salones que cuentan una historia", subtitleAr: "صالونات تروي قصة" },
  { titleFr: "Ambiances Chaleureuses", titleEn: "Warm Atmospheres", titleEs: "Ambientes Cálidos", titleAr: "أجواء دافئة", subtitleFr: "Confort et artisanat marocain", subtitleEn: "Comfort and Moroccan craftsmanship", subtitleEs: "Confort y artesanía marroquí", subtitleAr: "راحة وحرفية مغربية" },

  // ── MOUCHARABIEH - 5 slides ──
  { titleFr: "Moucharabiehs Sculptés", titleEn: "Carved Moucharabieh", titleEs: "Moucharabieh Tallados", titleAr: "مشربيات منحوتة", subtitleFr: "Jeux d'ombre et de lumière en bois", subtitleEn: "Wood shadow and light play", subtitleEs: "Juegos de sombra y luz en madera", subtitleAr: "ألعاب ظل ونور من الخشب" },
  { titleFr: "L'Art du Moucharabieh", titleEn: "Art of Moucharabieh", titleEs: "Arte del Moucharabieh", titleAr: "فن المشربية", subtitleFr: "Tradition arabo-andalouse sublimée", subtitleEn: "Elevated Arab-Andalusian tradition", subtitleEs: "Tradición árabe-andaluza sublimada", subtitleAr: "تقاليد عربية أندلسية راقية" },
  { titleFr: "Dentelles de Bois", titleEn: "Wooden Lace Screens", titleEs: "Encajes de Madera", titleAr: "دانتيل خشبي", subtitleFr: "Motifs géométriques d'une précision rare", subtitleEn: "Geometric patterns of rare precision", subtitleEs: "Patrones geométricos de rara precisión", subtitleAr: "أنماط هندسية بدقة نادرة" },
  { titleFr: "Claustras Artisanaux", titleEn: "Artisan Lattice Screens", titleEs: "Celosías Artesanales", titleAr: "مشربيات حرفية", subtitleFr: "Intimité et beauté réunies", subtitleEn: "Privacy and beauty combined", subtitleEs: "Privacidad y belleza combinadas", subtitleAr: "خصوصية وجمال في آن واحد" },
  { titleFr: "Jeux de Lumière", titleEn: "Light Play Screens", titleEs: "Juegos de Luz", titleAr: "ألعاب الضوء", subtitleFr: "Chaque pièce est unique", subtitleEn: "Every piece is unique", subtitleEs: "Cada pieza es única", subtitleAr: "كل قطعة فريدة" },

  // ── HABILLAGE MURAL (Wall Cladding) - 5 slides ──
  { titleFr: "Habillage Mural Bois", titleEn: "Wood Wall Cladding", titleEs: "Revestimiento Mural Madera", titleAr: "تكسية جدارية بالخشب", subtitleFr: "Transformez vos murs en œuvres d'art", subtitleEn: "Transform your walls into art", subtitleEs: "Transforme sus paredes en arte", subtitleAr: "حوّل جدرانك إلى أعمال فنية" },
  { titleFr: "Murs en Bois Noble", titleEn: "Noble Wood Walls", titleEs: "Paredes de Madera Noble", titleAr: "جدران من خشب نبيل", subtitleFr: "Panneaux de bois massif sur mesure", subtitleEn: "Custom solid wood panels", subtitleEs: "Paneles de madera maciza a medida", subtitleAr: "ألواح خشب صلب حسب الطلب" },
  { titleFr: "Panneaux Décoratifs", titleEn: "Decorative Panels", titleEs: "Paneles Decorativos", titleAr: "ألواح زخرفية", subtitleFr: "Isolation acoustique et beauté naturelle", subtitleEn: "Acoustic insulation and natural beauty", subtitleEs: "Aislamiento acústico y belleza natural", subtitleAr: "عزل صوتي وجمال طبيعي" },
  { titleFr: "Boiseries Murales", titleEn: "Wall Woodwork", titleEs: "Carpintería Mural", titleAr: "أعمال خشبية جدارية", subtitleFr: "Le bois habille vos espaces avec noblesse", subtitleEn: "Wood dresses your spaces with nobility", subtitleEs: "La madera viste sus espacios con nobleza", subtitleAr: "الخشب يكسو مساحاتك بفخامة" },
  { titleFr: "L'Élégance des Murs", titleEn: "Wall Elegance", titleEs: "Elegancia de las Paredes", titleAr: "أناقة الجدران", subtitleFr: "Finitions laquées ou naturelles", subtitleEn: "Lacquered or natural finishes", subtitleEs: "Acabados lacados o naturales", subtitleAr: "تشطيبات ملمعة أو طبيعية" },

  // ── MEUBLES (Furniture) - 5 slides ──
  { titleFr: "Meubles Sur Mesure", titleEn: "Custom Furniture", titleEs: "Muebles a Medida", titleAr: "أثاث حسب الطلب", subtitleFr: "Des meubles qui traversent le temps", subtitleEn: "Furniture that stands the test of time", subtitleEs: "Muebles que resisten el paso del tiempo", subtitleAr: "أثاث يصمد أمام الزمن" },
  { titleFr: "Mobilier d'Exception", titleEn: "Exceptional Furniture", titleEs: "Mobiliario Excepcional", titleAr: "أثاث استثنائي", subtitleFr: "Chaque meuble est une pièce unique", subtitleEn: "Every piece is one of a kind", subtitleEs: "Cada mueble es una pieza única", subtitleAr: "كل قطعة أثاث فريدة من نوعها" },
  { titleFr: "Créations Uniques", titleEn: "Unique Creations", titleEs: "Creaciones Únicas", titleAr: "إبداعات فريدة", subtitleFr: "Bois massif et assemblages traditionnels", subtitleEn: "Solid wood and traditional joints", subtitleEs: "Madera maciza y ensamblajes tradicionales", subtitleAr: "خشب صلب وتجميع تقليدي" },
  { titleFr: "L'Art du Meuble", titleEn: "The Art of Furniture", titleEs: "El Arte del Mueble", titleAr: "فن صناعة الأثاث", subtitleFr: "Design personnalisé pour votre intérieur", subtitleEn: "Personalized design for your interior", subtitleEs: "Diseño personalizado para su interior", subtitleAr: "تصميم مخصص لديكورك" },
  { titleFr: "Meubles Artisanaux", titleEn: "Artisan Furniture", titleEs: "Muebles Artesanales", titleAr: "أثاث حرفي", subtitleFr: "Tables, consoles, buffets et plus", subtitleEn: "Tables, consoles, buffets and more", subtitleEs: "Mesas, consolas, aparadores y más", subtitleAr: "طاولات، كونسولات، بوفيهات والمزيد" },

  // ── BIBLIOTHEQUES (Libraries) - 4 slides ──
  { titleFr: "Bibliothèques en Bois", titleEn: "Wooden Libraries", titleEs: "Bibliotecas de Madera", titleAr: "مكتبات خشبية", subtitleFr: "Des bibliothèques qui subliment vos livres", subtitleEn: "Libraries that elevate your books", subtitleEs: "Bibliotecas que realzan sus libros", subtitleAr: "مكتبات ترتقي بكتبك" },
  { titleFr: "Étagères Sur Mesure", titleEn: "Custom Shelving", titleEs: "Estanterías a Medida", titleAr: "رفوف حسب الطلب", subtitleFr: "Bois massif et étagères ajustables", subtitleEn: "Solid wood and adjustable shelves", subtitleEs: "Madera maciza y estantes ajustables", subtitleAr: "خشب صلب ورفوف قابلة للتعديل" },
  { titleFr: "Murs de Livres", titleEn: "Book Walls", titleEs: "Paredes de Libros", titleAr: "جدران الكتب", subtitleFr: "Du sol au plafond, un mur de savoir", subtitleEn: "Floor to ceiling, a wall of knowledge", subtitleEs: "Del suelo al techo, un muro de saber", subtitleAr: "من الأرض إلى السقف، جدار معرفة" },
  { titleFr: "Bibliothèques de Prestige", titleEn: "Prestige Libraries", titleEs: "Bibliotecas de Prestigio", titleAr: "مكتبات مرموقة", subtitleFr: "Espaces de lecture et de collection", subtitleEn: "Reading and collection spaces", subtitleEs: "Espacios de lectura y colección", subtitleAr: "مساحات للقراءة والمجموعات" },

  // ── FENETRES (Windows) - 4 slides ──
  { titleFr: "Fenêtres en Bois", titleEn: "Wooden Windows", titleEs: "Ventanas de Madera", titleAr: "نوافذ خشبية", subtitleFr: "Fenêtres alliant isolation et esthétique", subtitleEn: "Windows combining insulation and aesthetics", subtitleEs: "Ventanas que combinan aislamiento y estética", subtitleAr: "نوافذ تجمع بين العزل والجمال" },
  { titleFr: "Cadres de Lumière", titleEn: "Frames of Light", titleEs: "Marcos de Luz", titleAr: "إطارات من نور", subtitleFr: "Bois traité pour une durabilité maximale", subtitleEn: "Treated wood for maximum durability", subtitleEs: "Madera tratada para máxima durabilidad", subtitleAr: "خشب معالج لأقصى متانة" },
  { titleFr: "Fenêtres Sur Mesure", titleEn: "Custom Windows", titleEs: "Ventanas a Medida", titleAr: "نوافذ حسب الطلب", subtitleFr: "Laissez entrer la lumière avec style", subtitleEn: "Let light in with style", subtitleEs: "Deje entrar la luz con estilo", subtitleAr: "أدخل النور بأناقة" },
  { titleFr: "Ouvertures Élégantes", titleEn: "Elegant Openings", titleEs: "Aperturas Elegantes", titleAr: "فتحات أنيقة", subtitleFr: "Doubles vitrages et cadres en bois massif", subtitleEn: "Double glazing and solid wood frames", subtitleEs: "Doble acristalamiento y marcos de madera", subtitleAr: "زجاج مزدوج وإطارات خشب صلب" },

  // ── PERGOLAS - 4 slides ──
  { titleFr: "Pergolas en Bois", titleEn: "Wooden Pergolas", titleEs: "Pérgolas de Madera", titleAr: "بيرغولات خشبية", subtitleFr: "Profitez de votre extérieur toute l'année", subtitleEn: "Enjoy your outdoor space year-round", subtitleEs: "Disfrute de su exterior todo el año", subtitleAr: "استمتع بمساحتك الخارجية طوال العام" },
  { titleFr: "Espaces Extérieurs", titleEn: "Outdoor Spaces", titleEs: "Espacios Exteriores", titleAr: "مساحات خارجية", subtitleFr: "Bois traité résistant aux intempéries", subtitleEn: "Weather-resistant treated wood", subtitleEs: "Madera tratada resistente a la intemperie", subtitleAr: "خشب معالج مقاوم للعوامل الجوية" },
  { titleFr: "Pergolas Sur Mesure", titleEn: "Custom Pergolas", titleEs: "Pérgolas a Medida", titleAr: "بيرغولات حسب الطلب", subtitleFr: "Créez un espace de détente unique", subtitleEn: "Create a unique relaxation space", subtitleEs: "Cree un espacio de relajación único", subtitleAr: "أنشئ مساحة استرخاء فريدة" },
  { titleFr: "Ombres et Lumières", titleEn: "Shadows and Lights", titleEs: "Sombras y Luces", titleAr: "ظلال وأنوار", subtitleFr: "Design moderne pour votre terrasse", subtitleEn: "Modern design for your terrace", subtitleEs: "Diseño moderno para su terraza", subtitleAr: "تصميم عصري لشرفتك" },

  // ── PORTAILS (Gates) - 4 slides ──
  { titleFr: "Portails en Bois Massif", titleEn: "Solid Wood Gates", titleEs: "Portones de Madera Maciza", titleAr: "بوابات من خشب صلب", subtitleFr: "La première impression de votre maison", subtitleEn: "Your home's first impression", subtitleEs: "La primera impresión de su hogar", subtitleAr: "الانطباع الأول لمنزلك" },
  { titleFr: "Entrées Imposantes", titleEn: "Imposing Entrances", titleEs: "Entradas Imponentes", titleAr: "مداخل مهيبة", subtitleFr: "Sécurité et élégance dès l'entrée", subtitleEn: "Security and elegance from the entrance", subtitleEs: "Seguridad y elegancia desde la entrada", subtitleAr: "أمان وأناقة من المدخل" },
  { titleFr: "Portails Sur Mesure", titleEn: "Custom Gates", titleEs: "Portones a Medida", titleAr: "بوابات حسب الطلب", subtitleFr: "Bois massif pour une robustesse maximale", subtitleEn: "Solid wood for maximum strength", subtitleEs: "Madera maciza para máxima robustez", subtitleAr: "خشب صلب لأقصى متانة" },
  { titleFr: "Portails de Prestige", titleEn: "Prestige Gates", titleEs: "Portones de Prestigio", titleAr: "بوابات مرموقة", subtitleFr: "Portails motorisés et traditionnels", subtitleEn: "Motorized and traditional gates", subtitleEs: "Portones motorizados y tradicionales", subtitleAr: "بوابات آلية وتقليدية" },

  // ── GENERIC / DEFAULT - 15 slides (to reach 102 total) ──
  { titleFr: "Artisanat du Bois", titleEn: "Wood Craftsmanship", titleEs: "Artesanía en Madera", titleAr: "حرفية الخشب", subtitleFr: "Le meilleur de l'artisanat marocain", subtitleEn: "The best of Moroccan craftsmanship", subtitleEs: "Lo mejor de la artesanía marroquí", subtitleAr: "أفضل ما في الحرفية المغربية" },
  { titleFr: "Créations en Bois Noble", titleEn: "Noble Wood Creations", titleEs: "Creaciones en Madera Noble", titleAr: "إبداعات من خشب نبيل", subtitleFr: "Plus de 20 ans d'expérience à Tanger", subtitleEn: "Over 20 years of experience in Tangier", subtitleEs: "Más de 20 años de experiencia en Tánger", subtitleAr: "أكثر من 20 عاماً من الخبرة في طنجة" },
  { titleFr: "L'Excellence du Bois", titleEn: "Wood Excellence", titleEs: "Excelencia de la Madera", titleAr: "تميز الخشب", subtitleFr: "Chaque projet est une œuvre unique", subtitleEn: "Every project is a unique work", subtitleEs: "Cada proyecto es una obra única", subtitleAr: "كل مشروع عمل فريد" },
  { titleFr: "Savoir-Faire Marocain", titleEn: "Moroccan Know-How", titleEs: "Saber Hacer Marroquí", titleAr: "خبرة مغربية", subtitleFr: "Qualité premium, prix compétitifs", subtitleEn: "Premium quality, competitive prices", subtitleEs: "Calidad premium, precios competitivos", subtitleAr: "جودة عالية، أسعار تنافسية" },
  { titleFr: "Tradition & Modernité", titleEn: "Tradition & Modernity", titleEs: "Tradición y Modernidad", titleAr: "تقليد وحداثة", subtitleFr: "Du rêve à la réalité en bois massif", subtitleEn: "From dream to solid wood reality", subtitleEs: "Del sueño a la realidad en madera", subtitleAr: "من الحلم إلى الواقع بالخشب" },
  { titleFr: "Bois d'Exception", titleEn: "Exceptional Wood", titleEs: "Madera Excepcional", titleAr: "خشب استثنائي", subtitleFr: "Passionnés du bois depuis toujours", subtitleEn: "Passionate about wood since forever", subtitleEs: "Apasionados por la madera desde siempre", subtitleAr: "شغوفون بالخشب منذ الأزل" },
  { titleFr: "Atelier Passion Bois", titleEn: "Wood Passion Workshop", titleEs: "Taller Pasión Madera", titleAr: "ورشة شغف الخشب", subtitleFr: "Découvrez notre atelier où chaque création prend vie", subtitleEn: "Discover our workshop where every creation comes to life", subtitleEs: "Descubra nuestro taller donde cada creación cobra vida", subtitleAr: "اكتشف ورشتنا حيث كل إبداع ينبض بالحياة" },
  { titleFr: "Projets Résidentiels Luxueux", titleEn: "Luxury Residential Projects", titleEs: "Proyectos Residenciales de Lujo", titleAr: "مشاريع سكنية فاخرة", subtitleFr: "Créations haut de gamme pour villas prestigieuses", subtitleEn: "High-end creations for prestigious villas", subtitleEs: "Creaciones de alta gama para villas prestigiosas", subtitleAr: "إبداعات راقية للفيلات الفاخرة" },
  { titleFr: "Finitions Parfaites Garanties", titleEn: "Perfect Finishes Guaranteed", titleEs: "Acabados Perfectos Garantizados", titleAr: "تشطيبات مثالية مضمونة", subtitleFr: "Attention méticuleuse aux détails impeccables", subtitleEn: "Meticulous attention to impeccable details", subtitleEs: "Atención meticulosa a detalles impecables", subtitleAr: "اهتمام دقيق بالتفاصيل المثالية" },
  { titleFr: "Restauration Bois Ancien", titleEn: "Antique Wood Restoration", titleEs: "Restauración Madera Antigua", titleAr: "ترميم الخشب العتيق", subtitleFr: "Redonner vie à vos meubles de famille", subtitleEn: "Bringing your family furniture back to life", subtitleEs: "Devolver la vida a tus muebles familiares", subtitleAr: "إعادة الحياة لأثاث عائلتك" },
  { titleFr: "Art Islamique en Bois", titleEn: "Islamic Art in Wood", titleEs: "Arte Islámico en Madera", titleAr: "فن إسلامي بالخشب", subtitleFr: "Panneaux décoratifs inspirés de l'art marocain", subtitleEn: "Decorative panels inspired by Moroccan art", subtitleEs: "Paneles decorativos inspirados en arte marroquí", subtitleAr: "ألواح زخرفية مستوحاة من الفن المغربي" },
  { titleFr: "Bois Noble et Durable", titleEn: "Noble and Durable Wood", titleEs: "Madera Noble y Duradera", titleAr: "خشب نبيل ومتين", subtitleFr: "Sélection rigoureuse des meilleurs bois nobles", subtitleEn: "Rigorous selection of the finest noble woods", subtitleEs: "Selección rigurosa de las mejores maderas", subtitleAr: "اختيار دقيق لأفضل الأخشاب النبيلة" },
  { titleFr: "Design Contemporain Bois", titleEn: "Contemporary Wood Design", titleEs: "Diseño Contemporáneo Madera", titleAr: "تصميم خشبي معاصر", subtitleFr: "Fusion parfaite entre modernité et tradition", subtitleEn: "Perfect fusion between modernity and tradition", subtitleEs: "Fusión perfecta entre modernidad y tradición", subtitleAr: "مزيج مثالي بين الحداثة والتقاليد" },
  { titleFr: "Tables Artisanales Uniques", titleEn: "Unique Artisan Tables", titleEs: "Mesas Artesanales Únicas", titleAr: "طاولات حرفية فريدة", subtitleFr: "Tables uniques créées avec passion artisanale", subtitleEn: "Unique tables created with artisan passion", subtitleEs: "Mesas únicas creadas con pasión artesanal", subtitleAr: "طاولات فريدة صنعت بشغف حرفي" },
  { titleFr: "Terrasses Bois Extérieures", titleEn: "Outdoor Wood Terraces", titleEs: "Terrazas Exteriores Madera", titleAr: "شرفات خشبية خارجية", subtitleFr: "Prolongez votre espace de vie en extérieur", subtitleEn: "Extend your living space outdoors", subtitleEs: "Amplíe su espacio vital al exterior", subtitleAr: "وسع مساحة معيشتك في الخارج" },
  { titleFr: "Agencement Commerce Bois", titleEn: "Wood Shop Fitting", titleEs: "Equipamiento Comercial Madera", titleAr: "تجهيز محلات بالخشب", subtitleFr: "Agencements professionnels pour votre activité", subtitleEn: "Professional fittings for your business", subtitleEs: "Equipamientos profesionales para su actividad", subtitleAr: "تجهيزات مهنية لنشاطك التجاري" },
  { titleFr: "Charpente Bois Solide", titleEn: "Solid Wood Framework", titleEs: "Estructura de Madera Sólida", titleAr: "هيكل خشبي متين", subtitleFr: "Charpentes robustes alliant tradition et modernité", subtitleEn: "Robust frameworks blending tradition and modernity", subtitleEs: "Estructuras robustas que combinan tradición y modernidad", subtitleAr: "هياكل متينة تجمع بين التقليد والحداثة" },
];

// ═══════════════════════════════════════════════════════════
// Main update function
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("🚀 Updating hero slide titles with real content...\n");

  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" },
  });

  console.log(`📊 Found ${slides.length} slides to update`);
  console.log(`📝 ${slideContents.length} unique title/description combinations available\n`);

  let updated = 0;
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const content = slideContents[i % slideContents.length];

    await prisma.heroSlide.update({
      where: { id: slide.id },
      data: {
        titleFr: content.titleFr,
        titleEn: content.titleEn,
        titleEs: content.titleEs,
        titleAr: content.titleAr,
        subtitleFr: content.subtitleFr,
        subtitleEn: content.subtitleEn,
        subtitleEs: content.subtitleEs,
        subtitleAr: content.subtitleAr,
      },
    });

    updated++;
    if (updated % 10 === 0) {
      console.log(`  ✅ Updated ${updated}/${slides.length} slides...`);
    }
  }

  console.log(`\n🎉 Successfully updated ${updated} slides with real titles!`);
  console.log(`   Categories covered: Portes, Escaliers, Plafonds, Cuisines,`);
  console.log(`   Placards, Salons, Moucharabieh, Habillage Mural, Meubles,`);
  console.log(`   Bibliothèques, Fenêtres, Pergolas, Portails + Générique`);
}

main()
  .catch((e) => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
