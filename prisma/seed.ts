import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

// ═══════════════════════════════════════════════════════════
// PRISMA CLIENT SETUP (for seeding with adapter)
// ═══════════════════════════════════════════════════════════

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ───────────────────────────────────────────────────────────
  // 1. CURRENCIES
  // ───────────────────────────────────────────────────────────
  console.log("💱 Seeding currencies...");

  const currencies = [
    {
      code: "MAD",
      symbol: "DH",
      name: "Dirham Marocain",
      rate: 1.0,
      locale: "fr-MA",
      position: "after",
      isDefault: true,
      isActive: true,
    },
    {
      code: "EUR",
      symbol: "€",
      name: "Euro",
      rate: 0.092,
      locale: "fr-FR",
      position: "before",
      isDefault: false,
      isActive: true,
    },
    {
      code: "USD",
      symbol: "$",
      name: "US Dollar",
      rate: 0.099,
      locale: "en-US",
      position: "before",
      isDefault: false,
      isActive: true,
    },
    {
      code: "GBP",
      symbol: "£",
      name: "British Pound",
      rate: 0.079,
      locale: "en-GB",
      position: "before",
      isDefault: false,
      isActive: true,
    },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }
  console.log(`   ✓ Created ${currencies.length} currencies\n`);

  // ───────────────────────────────────────────────────────────
  // 2. ADMIN USER
  // ───────────────────────────────────────────────────────────
  console.log("👤 Seeding admin user...");

  const adminEmail = "admin@letatche-bois.ma";
  const adminPassword = await hash("Admin2025", 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`   ✓ Admin user created: ${adminEmail}\n`);

  // ───────────────────────────────────────────────────────────
  // 3. CATEGORIES
  // ───────────────────────────────────────────────────────────
  console.log("📁 Seeding categories...");

  const categories = [
    // PROJECT categories
    {
      slug: "menuiserie-interieure",
      order: 1,
      translations: [
        { locale: "fr", name: "Menuiserie Intérieure", description: "Projets d'aménagement intérieur en bois" },
        { locale: "en", name: "Interior Woodwork", description: "Interior wood fitting projects" },
        { locale: "es", name: "Carpintería Interior", description: "Proyectos de carpintería interior" },
        { locale: "ar", name: "النجارة الداخلية", description: "مشاريع الأعمال الخشبية الداخلية" },
      ],
    },
    {
      slug: "menuiserie-exterieure",
      order: 2,
      translations: [
        { locale: "fr", name: "Menuiserie Extérieure", description: "Projets d'aménagement extérieur en bois" },
        { locale: "en", name: "Exterior Woodwork", description: "Exterior wood fitting projects" },
        { locale: "es", name: "Carpintería Exterior", description: "Proyectos de carpintería exterior" },
        { locale: "ar", name: "النجارة الخارجية", description: "مشاريع الأعمال الخشبية الخارجية" },
      ],
    },
    {
      slug: "mobilier-sur-mesure",
      order: 3,
      translations: [
        { locale: "fr", name: "Mobilier Sur Mesure", description: "Création de meubles personnalisés" },
        { locale: "en", name: "Custom Furniture", description: "Custom furniture creation" },
        { locale: "es", name: "Muebles a Medida", description: "Creación de muebles personalizados" },
        { locale: "ar", name: "أثاث مخصص", description: "صناعة الأثاث حسب الطلب" },
      ],
    },
    // PRODUCT categories
    {
      slug: "tables",
      order: 1,
      translations: [
        { locale: "fr", name: "Tables", description: "Tables en bois massif" },
        { locale: "en", name: "Tables", description: "Solid wood tables" },
        { locale: "es", name: "Mesas", description: "Mesas de madera maciza" },
        { locale: "ar", name: "طاولات", description: "طاولات من الخشب الصلب" },
      ],
    },
    {
      slug: "chaises",
      order: 2,
      translations: [
        { locale: "fr", name: "Chaises", description: "Chaises artisanales en bois" },
        { locale: "en", name: "Chairs", description: "Handcrafted wooden chairs" },
        { locale: "es", name: "Sillas", description: "Sillas artesanales de madera" },
        { locale: "ar", name: "كراسي", description: "كراسي خشبية يدوية الصنع" },
      ],
    },
    {
      slug: "rangements",
      order: 3,
      translations: [
        { locale: "fr", name: "Rangements", description: "Solutions de rangement en bois" },
        { locale: "en", name: "Storage", description: "Wooden storage solutions" },
        { locale: "es", name: "Almacenamiento", description: "Soluciones de almacenamiento en madera" },
        { locale: "ar", name: "تخزين", description: "حلول تخزين خشبية" },
      ],
    },
    {
      slug: "decoration",
      order: 4,
      translations: [
        { locale: "fr", name: "Décoration", description: "Objets décoratifs en bois" },
        { locale: "en", name: "Decoration", description: "Wooden decorative objects" },
        { locale: "es", name: "Decoración", description: "Objetos decorativos de madera" },
        { locale: "ar", name: "ديكور", description: "قطع ديكور خشبية" },
      ],
    },
    // SERVICE categories
    {
      slug: "fabrication-sur-mesure",
      order: 1,
      translations: [
        { locale: "fr", name: "Fabrication Sur Mesure", description: "Création de pièces uniques selon vos besoins" },
        { locale: "en", name: "Custom Manufacturing", description: "Creation of unique pieces according to your needs" },
        { locale: "es", name: "Fabricación a Medida", description: "Creación de piezas únicas según sus necesidades" },
        { locale: "ar", name: "تصنيع حسب الطلب", description: "صناعة قطع فريدة حسب احتياجاتك" },
      ],
    },
    {
      slug: "restauration",
      order: 2,
      translations: [
        { locale: "fr", name: "Restauration", description: "Restauration de meubles anciens" },
        { locale: "en", name: "Restoration", description: "Restoration of antique furniture" },
        { locale: "es", name: "Restauración", description: "Restauración de muebles antiguos" },
        { locale: "ar", name: "ترميم", description: "ترميم الأثاث العتيق" },
      ],
    },
    {
      slug: "installation",
      order: 3,
      translations: [
        { locale: "fr", name: "Installation", description: "Installation professionnelle sur site" },
        { locale: "en", name: "Installation", description: "Professional on-site installation" },
        { locale: "es", name: "Instalación", description: "Instalación profesional en sitio" },
        { locale: "ar", name: "تركيب", description: "تركيب احترافي في الموقع" },
      ],
    },
  ];

  for (const cat of categories) {
    const { translations, ...categoryData } = cat;
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });

    for (const trans of translations) {
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: category.id,
            locale: trans.locale,
          },
        },
        update: trans,
        create: {
          ...trans,
          categoryId: category.id,
        },
      });
    }
  }
  console.log(`   ✓ Created ${categories.length} categories with translations\n`);

  // ───────────────────────────────────────────────────────────
  // 4. SETTINGS
  // ───────────────────────────────────────────────────────────
  console.log("⚙️  Seeding settings...");

  const settings = [
    // Contact settings
    {
      group: "contact",
      key: "phone",
      value: JSON.stringify("+212 5XX-XXXXXX"),
    },
    {
      group: "contact",
      key: "email",
      value: JSON.stringify("contact@letatchebois.com"),
    },
    {
      group: "contact",
      key: "whatsapp",
      value: JSON.stringify("+212600000000"),
    },
    {
      group: "contact",
      key: "address",
      value: JSON.stringify({
        street: "123 Rue Example",
        city: "Casablanca",
        country: "Morocco",
        postalCode: "20000",
      }),
    },
    // Social settings
    {
      group: "social",
      key: "facebook",
      value: JSON.stringify("https://facebook.com/letatchebois"),
    },
    {
      group: "social",
      key: "instagram",
      value: JSON.stringify("https://instagram.com/letatchebois"),
    },
    {
      group: "social",
      key: "pinterest",
      value: JSON.stringify("https://pinterest.com/letatchebois"),
    },
    // SEO settings
    {
      group: "seo",
      key: "siteTitle",
      value: JSON.stringify("LE TATCHE BOIS - Artisan Menuisier au Maroc"),
    },
    {
      group: "seo",
      key: "siteDescription",
      value: JSON.stringify(
        "Artisan menuisier marocain spécialisé dans la création de meubles sur mesure, menuiserie intérieure et extérieure."
      ),
    },
    // Shipping settings
    {
      group: "shipping",
      key: "freeShippingThreshold",
      value: JSON.stringify(1000),
    },
    {
      group: "shipping",
      key: "standardShippingCost",
      value: JSON.stringify(50),
    },
    {
      group: "shipping",
      key: "expressShippingCost",
      value: JSON.stringify(100),
    },
    // Payment settings
    {
      group: "payment",
      key: "acceptCOD",
      value: JSON.stringify(true),
    },
    {
      group: "payment",
      key: "acceptStripe",
      value: JSON.stringify(true),
    },
    // Business hours
    {
      group: "hours",
      key: "weekdays",
      value: JSON.stringify({ open: "09:00", close: "18:00" }),
    },
    {
      group: "hours",
      key: "saturday",
      value: JSON.stringify({ open: "09:00", close: "13:00" }),
    },
    {
      group: "hours",
      key: "sunday",
      value: JSON.stringify(null),
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: {
        group_key: {
          group: setting.group,
          key: setting.key,
        },
      },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`   ✓ Created ${settings.length} settings\n`);

  // ───────────────────────────────────────────────────────────
  // 5. SAMPLE SERVICE (Skipped - Service model not in schema)
  // ───────────────────────────────────────────────────────────
  // Note: Service model needs to be added to schema if services are needed

  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ Database seeding completed successfully!");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("📋 Summary:");
  console.log("   • 4 currencies (MAD, EUR, USD, GBP)");
  console.log("   • 1 admin user (admin@letatche-bois.ma)");
  console.log("   • 11 categories (3 project, 4 product, 4 service)");
  console.log("   • 17 settings");
  console.log("\n🔐 Admin credentials:");
  console.log("   Email: admin@letatche-bois.ma");
  console.log("   Password: Admin2025");
  console.log("\n⚠️  Remember to change the admin password in production!\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
