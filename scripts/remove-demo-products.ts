/**
 * Remove all demo/example products from the database
 * Keep only products created by the admin
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🗑️  Checking for products to remove...\n");

  // Get all products
  const products = await prisma.product.findMany({
    include: {
      translations: true,
    },
  });

  console.log(`📦 Found ${products.length} total products in database\n`);

  if (products.length === 0) {
    console.log("✅ No products found - database is clean!");
    return;
  }

  // List all products
  console.log("Products in database:");
  products.forEach((p, idx) => {
    const frTranslation = p.translations.find(t => t.locale === "fr");
    const name = frTranslation?.name || p.slug;
    console.log(`   ${idx + 1}. ${name} (SKU: ${p.sku}, Slug: ${p.slug})`);
  });

  console.log("\n⚠️  This script will DELETE ALL PRODUCTS from the database.");
  console.log("Only products you create after this will remain.\n");

  // Delete all products
  console.log("🗑️  Deleting all products...");

  // Delete translations first (cascade should handle this, but being explicit)
  const deletedTranslations = await prisma.productTranslation.deleteMany({});
  console.log(`   ✓ Deleted ${deletedTranslations.count} product translations`);

  // Delete products
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`   ✓ Deleted ${deletedProducts.count} products`);

  console.log("\n✅ All products have been removed!");
  console.log("📝 You can now create your own products from the admin panel.\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
