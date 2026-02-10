import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { readdirSync } from "fs";
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
// 20 Woodworking Titles (max 6 words each)
// Subtitles max 20 words each
// ═══════════════════════════════════════════════════════════

const titles = [
  {
    fr: "L'Art du Bois Noble",
    en: "The Art of Fine Wood",
    es: "El Arte de la Madera",
    ar: "فن الخشب النبيل",
    subFr: "Créations artisanales sur mesure pour sublimer votre intérieur",
    subEn: "Bespoke handcrafted creations to enhance your interior",
    subEs: "Creaciones artesanales a medida para embellecer su interior",
    subAr: "إبداعات حرفية مخصصة لتجميل منزلك",
  },
  {
    fr: "Menuiserie d'Exception Artisanale",
    en: "Exceptional Artisan Woodworking",
    es: "Carpintería Artesanal Excepcional",
    ar: "نجارة حرفية استثنائية",
    subFr: "Chaque pièce raconte une histoire de passion et de savoir-faire",
    subEn: "Every piece tells a story of passion and craftsmanship",
    subEs: "Cada pieza cuenta una historia de pasión y artesanía",
    subAr: "كل قطعة تحكي قصة شغف وحرفية",
  },
  {
    fr: "Portes Bois Sur Mesure",
    en: "Custom Wooden Doors Made",
    es: "Puertas de Madera Personalizadas",
    ar: "أبواب خشبية حسب الطلب",
    subFr: "Des portes qui allient élégance, sécurité et durabilité incomparable",
    subEn: "Doors combining elegance, security and unmatched durability",
    subEs: "Puertas que combinan elegancia, seguridad y durabilidad inigualable",
    subAr: "أبواب تجمع بين الأناقة والأمان والمتانة",
  },
  {
    fr: "Escaliers Sculptés Main Experte",
    en: "Expert Hand-Sculpted Staircases",
    es: "Escaleras Esculpidas a Mano",
    ar: "سلالم منحوتة يدوياً بخبرة",
    subFr: "Des escaliers majestueux qui transforment votre espace de vie",
    subEn: "Majestic staircases that transform your living space beautifully",
    subEs: "Escaleras majestuosas que transforman su espacio vital con estilo",
    subAr: "سلالم فخمة تحول مساحة معيشتك بأناقة",
  },
  {
    fr: "Fenêtres Bois Haute Qualité",
    en: "High Quality Wood Windows",
    es: "Ventanas de Madera Premium",
    ar: "نوافذ خشبية عالية الجودة",
    subFr: "Isolation parfaite et luminosité naturelle pour votre confort quotidien",
    subEn: "Perfect insulation and natural light for your daily comfort",
    subEs: "Aislamiento perfecto y luz natural para su confort diario",
    subAr: "عزل مثالي وإضاءة طبيعية لراحتك اليومية",
  },
  {
    fr: "Cuisine Bois Design Moderne",
    en: "Modern Wood Kitchen Design",
    es: "Cocina de Madera Moderna",
    ar: "مطبخ خشبي بتصميم عصري",
    subFr: "Des cuisines fonctionnelles et esthétiques réalisées avec des matériaux nobles",
    subEn: "Functional and aesthetic kitchens crafted with premium materials",
    subEs: "Cocinas funcionales y estéticas con materiales de primera calidad",
    subAr: "مطابخ عملية وجمالية مصنوعة من مواد فاخرة",
  },
  {
    fr: "Dressing Rangement Sur Mesure",
    en: "Custom Storage Solutions Built",
    es: "Vestidores y Armarios Personalizados",
    ar: "خزائن وتخزين حسب الطلب",
    subFr: "Optimisez chaque centimètre de votre espace avec nos solutions élégantes",
    subEn: "Optimize every inch of your space with our elegant solutions",
    subEs: "Optimice cada centímetro de su espacio con nuestras soluciones",
    subAr: "استغل كل سنتيمتر من مساحتك بحلولنا الأنيقة",
  },
  {
    fr: "Savoir-Faire Bois Traditionnel",
    en: "Traditional Wood Craftsmanship Skills",
    es: "Artesanía Tradicional en Madera",
    ar: "حرفية خشبية تقليدية أصيلة",
    subFr: "Un héritage artisanal transmis de génération en génération avec fierté",
    subEn: "An artisan heritage passed down through generations with pride",
    subEs: "Una herencia artesanal transmitida de generación en generación",
    subAr: "إرث حرفي متوارث عبر الأجيال بكل فخر",
  },
  {
    fr: "Terrasses Bois Extérieures Luxe",
    en: "Luxury Outdoor Wood Terraces",
    es: "Terrazas Exteriores de Lujo",
    ar: "شرفات خشبية خارجية فاخرة",
    subFr: "Prolongez votre espace de vie avec une terrasse bois sur mesure",
    subEn: "Extend your living space with a custom wooden terrace",
    subEs: "Amplíe su espacio vital con una terraza de madera a medida",
    subAr: "وسع مساحة معيشتك مع شرفة خشبية مخصصة",
  },
  {
    fr: "Meubles Bois Massif Uniques",
    en: "Unique Solid Wood Furniture",
    es: "Muebles Únicos de Madera",
    ar: "أثاث خشب صلب فريد",
    subFr: "Des meubles d'exception conçus pour durer des générations entières",
    subEn: "Exceptional furniture designed to last for entire generations",
    subEs: "Muebles excepcionales diseñados para durar generaciones enteras",
    subAr: "أثاث استثنائي مصمم ليدوم لأجيال كاملة",
  },
  {
    fr: "Pergolas Bois Jardin Élégantes",
    en: "Elegant Garden Wood Pergolas",
    es: "Pérgolas Elegantes de Jardín",
    ar: "عرائش خشبية أنيقة للحديقة",
    subFr: "Créez un espace ombragé et raffiné dans votre jardin avec style",
    subEn: "Create a shaded and refined space in your garden with style",
    subEs: "Cree un espacio sombreado y refinado en su jardín con estilo",
    subAr: "اصنع مساحة مظللة وراقية في حديقتك بأناقة",
  },
  {
    fr: "Bardage Bois Façade Naturelle",
    en: "Natural Wood Facade Cladding",
    es: "Revestimiento Natural de Madera",
    ar: "تكسية واجهات خشبية طبيعية",
    subFr: "Transformez l'apparence de votre bâtiment avec un bardage bois noble",
    subEn: "Transform your building appearance with premium wood cladding",
    subEs: "Transforme la apariencia de su edificio con revestimiento noble",
    subAr: "حول مظهر مبناك بتكسية خشبية فاخرة",
  },
  {
    fr: "Parquet Bois Noble Posé",
    en: "Premium Wood Flooring Installed",
    es: "Parquet de Madera Premium",
    ar: "أرضيات خشبية فاخرة مركبة",
    subFr: "Un sol chaleureux et authentique qui valorise chaque pièce de vie",
    subEn: "A warm authentic floor that enhances every living room beautifully",
    subEs: "Un suelo cálido y auténtico que realza cada estancia con estilo",
    subAr: "أرضية دافئة وأصيلة تعزز كل غرفة معيشة بجمال",
  },
  {
    fr: "Placards Encastrés Bois Massif",
    en: "Built-in Solid Wood Closets",
    es: "Armarios Empotrados de Madera",
    ar: "خزائن مدمجة من خشب صلب",
    subFr: "Solutions de rangement intelligentes intégrées à votre décoration intérieure",
    subEn: "Smart storage solutions seamlessly integrated into your interior design",
    subEs: "Soluciones de almacenamiento inteligentes integradas en su decoración",
    subAr: "حلول تخزين ذكية مدمجة بسلاسة في ديكورك الداخلي",
  },
  {
    fr: "Rénovation Bois Patrimoine Ancien",
    en: "Historic Wood Heritage Restoration",
    es: "Restauración de Patrimonio Antiguo",
    ar: "ترميم التراث الخشبي القديم",
    subFr: "Redonner vie aux boiseries anciennes avec respect et expertise artisanale",
    subEn: "Bringing old woodwork back to life with respect and expertise",
    subEs: "Devolver la vida a las maderas antiguas con respeto y experiencia",
    subAr: "إعادة الحياة للأعمال الخشبية القديمة باحترام وخبرة",
  },
  {
    fr: "Volets Bois Charme Authentique",
    en: "Authentic Charming Wood Shutters",
    es: "Contraventanas de Madera Auténticas",
    ar: "مصاريع خشبية بسحر أصيل",
    subFr: "Des volets qui protègent et embellissent votre façade avec caractère",
    subEn: "Shutters that protect and beautify your facade with character",
    subEs: "Contraventanas que protegen y embellecen su fachada con carácter",
    subAr: "مصاريع تحمي وتجمل واجهتك بطابع مميز",
  },
  {
    fr: "Bibliothèques Bois Sur Mesure",
    en: "Custom Built Wood Bookshelves",
    es: "Bibliotecas de Madera Personalizadas",
    ar: "مكتبات خشبية حسب الطلب",
    subFr: "Aménagez un espace lecture unique qui reflète votre personnalité",
    subEn: "Create a unique reading space that reflects your personality",
    subEs: "Cree un espacio de lectura único que refleje su personalidad",
    subAr: "صمم مساحة قراءة فريدة تعكس شخصيتك",
  },
  {
    fr: "Agencement Boutique Commerce Bois",
    en: "Wood Shop Interior Fitting",
    es: "Equipamiento Comercial en Madera",
    ar: "تجهيز محلات تجارية بالخشب",
    subFr: "Des agencements professionnels qui valorisent votre activité commerciale",
    subEn: "Professional fittings that enhance your commercial business appeal",
    subEs: "Equipamientos profesionales que realzan su actividad comercial",
    subAr: "تجهيزات مهنية تعزز جاذبية نشاطك التجاري",
  },
  {
    fr: "Charpente Bois Structure Solide",
    en: "Strong Solid Wood Framework",
    es: "Estructura de Madera Sólida",
    ar: "هيكل خشبي متين وصلب",
    subFr: "Des charpentes robustes alliant tradition constructive et techniques modernes",
    subEn: "Robust frameworks combining traditional construction and modern techniques",
    subEs: "Estructuras robustas que combinan tradición constructiva y técnicas modernas",
    subAr: "هياكل متينة تجمع بين البناء التقليدي والتقنيات الحديثة",
  },
  {
    fr: "Atelier Passion Bois Artisan",
    en: "Artisan Workshop Wood Passion",
    es: "Taller Artesanal Pasión Madera",
    ar: "ورشة حرفية شغف الخشب",
    subFr: "Découvrez notre atelier où chaque création prend vie avec amour",
    subEn: "Discover our workshop where every creation comes to life lovingly",
    subEs: "Descubra nuestro taller donde cada creación cobra vida con amor",
    subAr: "اكتشف ورشتنا حيث كل إبداع ينبض بالحياة والحب",
  },
];

// ═══════════════════════════════════════════════════════════
// Main import function
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("🚀 Starting hero slides import...\n");

  // 1. Read all images from directory
  const heroDir = path.join(process.cwd(), "public", "uploads", "hero-slides");
  const files = readdirSync(heroDir)
    .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort();

  console.log(`📁 Found ${files.length} images in public/uploads/hero-slides/`);

  if (files.length === 0) {
    console.error("❌ No image files found!");
    process.exit(1);
  }

  // 2. Clear existing HeroSlide records
  const deleted = await prisma.heroSlide.deleteMany({});
  console.log(`🗑️  Cleared ${deleted.count} existing hero slides\n`);

  // 3. Create records
  let created = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const titleSet = titles[i % titles.length];

    await prisma.heroSlide.create({
      data: {
        targetPage: "home",
        mediaType: "image",
        imageUrl: `/uploads/hero-slides/${file}`,
        titleFr: titleSet.fr,
        titleEn: titleSet.en,
        titleEs: titleSet.es,
        titleAr: titleSet.ar,
        subtitleFr: titleSet.subFr,
        subtitleEn: titleSet.subEn,
        subtitleEs: titleSet.subEs,
        subtitleAr: titleSet.subAr,
        ctaTextFr: "Découvrir",
        ctaTextEn: "Discover",
        ctaUrl: "/services",
        cta2TextFr: "Nous Contacter",
        cta2TextEn: "Contact Us",
        cta2Url: "/contact",
        order: i,
        isActive: true,
      },
    });

    created++;
    if (created % 10 === 0) {
      console.log(`  ✅ Created ${created}/${files.length} slides...`);
    }
  }

  console.log(`\n🎉 Successfully imported ${created} hero slides!`);
  console.log(`   Titles rotate through ${titles.length} different themes`);
  console.log(`   All slides set to targetPage: "home", isActive: true`);
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
