import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Checking recent products...\n');

  // Get the 5 most recent products
  const recentProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      translations: true,
      category: {
        include: {
          translations: true,
        },
      },
    },
  });

  console.log(`Found ${recentProducts.length} recent products:\n`);

  for (const product of recentProducts) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Product: ${product.slug}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   SKU: ${product.sku}`);
    console.log(`   Price: ${product.price} MAD`);
    console.log(`   Created: ${product.createdAt.toISOString()}`);
    console.log('');
    console.log('   Status Flags:');
    console.log(`   ✓ isActive: ${product.isActive ? '✅ TRUE (visible)' : '❌ FALSE (hidden)'}`);
    console.log(`   ✓ isFeatured: ${product.isFeatured ? '⭐ TRUE' : 'FALSE'}`);
    console.log(`   ✓ isNew: ${product.isNew ? '🆕 TRUE' : 'FALSE'}`);
    console.log('');
    console.log('   Stock Info:');
    console.log(`   ✓ Track Stock: ${product.trackStock}`);
    console.log(`   ✓ Stock Qty: ${product.stockQty}`);
    console.log(`   ✓ Allow Backorder: ${product.allowBackorder}`);
    console.log('');
    console.log(`   Category: ${product.category?.slug || 'None'}`);
    console.log(`   Images: ${product.images.length} image(s)`);
    console.log('');
    console.log('   Translations:');
    if (product.translations.length === 0) {
      console.log('   ⚠️  NO TRANSLATIONS FOUND - This will prevent display!');
    } else {
      for (const trans of product.translations) {
        console.log(`   - [${trans.locale}] ${trans.name || '(no name)'}`);
      }
    }
    console.log('');

    // Check if this product would appear in the shop
    const wouldAppear = product.isActive && product.translations.length > 0 && product.translations.some(t => t.name);
    if (wouldAppear) {
      console.log('   ✅ This product SHOULD appear in the shop');
    } else {
      console.log('   ❌ This product WILL NOT appear in the shop');
      const reasons = [];
      if (!product.isActive) reasons.push('isActive is FALSE');
      if (product.translations.length === 0) reasons.push('No translations');
      if (!product.translations.some(t => t.name)) reasons.push('No translation has a name');
      console.log(`   Reasons: ${reasons.join(', ')}`);
    }
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Count products by status
  const activeCount = await prisma.product.count({ where: { isActive: true } });
  const inactiveCount = await prisma.product.count({ where: { isActive: false } });
  const totalCount = await prisma.product.count();

  console.log('📊 Product Statistics:');
  console.log(`   Total products: ${totalCount}`);
  console.log(`   Active (visible in shop): ${activeCount}`);
  console.log(`   Inactive (hidden): ${inactiveCount}`);
  console.log('');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
