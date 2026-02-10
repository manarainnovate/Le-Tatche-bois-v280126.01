import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { nameFr: "Cuisines", nameEn: "Kitchens", nameEs: "Cocinas", nameAr: "مطابخ", slug: "cuisines", icon: "🍳", order: 1 },
  { nameFr: "Placards & Dressings", nameEn: "Wardrobes", nameEs: "Armarios", nameAr: "خزائن", slug: "placards", icon: "👔", order: 2 },
  { nameFr: "Portes", nameEn: "Doors", nameEs: "Puertas", nameAr: "أبواب", slug: "portes", icon: "🚪", order: 3 },
  { nameFr: "Fenêtres", nameEn: "Windows", nameEs: "Ventanas", nameAr: "نوافذ", slug: "fenetres", icon: "🪟", order: 4 },
  { nameFr: "Escaliers", nameEn: "Stairs", nameEs: "Escaleras", nameAr: "سلالم", slug: "escaliers", icon: "🪜", order: 5 },
  { nameFr: "Habillage Mur", nameEn: "Wall Cladding", nameEs: "Revestimiento", nameAr: "تكسية الجدران", slug: "habillage-mur", icon: "🧱", order: 6 },
  { nameFr: "Plafonds", nameEn: "Ceilings", nameEs: "Techos", nameAr: "أسقف", slug: "plafonds", icon: "🏠", order: 7 },
  { nameFr: "Mosquées", nameEn: "Mosques", nameEs: "Mezquitas", nameAr: "مساجد", slug: "mosquees", icon: "🕌", order: 8 },
  { nameFr: "Mobilier", nameEn: "Furniture", nameEs: "Muebles", nameAr: "أثاث", slug: "mobilier", icon: "🪑", order: 9 },
  { nameFr: "Décoration", nameEn: "Decoration", nameEs: "Decoración", nameAr: "ديكور", slug: "decoration", icon: "🎨", order: 10 },
  { nameFr: "Bureaux", nameEn: "Offices", nameEs: "Oficinas", nameAr: "مكاتب", slug: "bureaux", icon: "🖥️", order: 11 },
  { nameFr: "Hôtels & Riads", nameEn: "Hotels & Riads", nameEs: "Hoteles", nameAr: "فنادق", slug: "hotels-riads", icon: "🏨", order: 12 },
];

async function main() {
  console.log("🌱 Seeding portfolio categories...\n");

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.portfolioCategory.upsert({
      where: { slug: category.slug },
      update: {
        nameFr: category.nameFr,
        nameEn: category.nameEn,
        nameEs: category.nameEs,
        nameAr: category.nameAr,
        icon: category.icon,
        order: category.order,
      },
      create: {
        ...category,
        isActive: true,
      },
    });

    console.log(`  ✓ ${category.icon} ${category.nameFr} (${category.nameEn})`);
  }

  console.log("\n✅ Portfolio categories seeded!");
  console.log(`   Total: ${DEFAULT_CATEGORIES.length} categories\n`);

  // List all categories
  const categories = await prisma.portfolioCategory.findMany({
    orderBy: { order: "asc" },
  });

  console.log("📋 Current categories:");
  for (const cat of categories) {
    console.log(`   ${cat.order}. ${cat.icon} ${cat.nameFr} - /${cat.slug}`);
  }
}

main()
  .catch((error) => {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
