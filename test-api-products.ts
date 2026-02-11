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
  console.log('🧪 Testing what the API would return for boutique page...\n');

  const locale = 'fr';

  // Simulate the exact query the API makes
  const where = {
    isActive: true, // This is the filter from BoutiqueContent.tsx line 311
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      translations: {
        where: { locale },
      },
      category: {
        include: {
          translations: {
            where: { locale },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  console.log(`✅ Found ${products.length} active product(s) for locale '${locale}':\n`);

  if (products.length === 0) {
    console.log('❌ NO PRODUCTS FOUND!');
    console.log('\nThis means the boutique page will be empty.');
    console.log('\nPossible reasons:');
    console.log('1. All products have isActive=false');
    console.log('2. No products exist in the database');
  } else {
    products.forEach((product, index) => {
      const translation = product.translations[0];
      const categoryTranslation = product.category?.translations?.[0];

      console.log(`${index + 1}. Product: ${product.slug}`);
      console.log(`   Name: ${translation?.name || '(no translation)'}`);
      console.log(`   Price: ${product.price} MAD`);
      console.log(`   Category: ${product.category?.slug || 'None'} (${categoryTranslation?.name || 'no translation'})`);
      console.log(`   Stock: ${product.stockQty} units`);
      console.log(`   Images: ${product.images.length} image(s)`);
      console.log(`   Thumbnail: ${product.thumbnail || 'None'}`);
      console.log(`   Featured: ${product.isFeatured ? 'Yes' : 'No'}`);
      console.log(`   New: ${product.isNew ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ The API SHOULD return these products to the boutique page.');
    console.log('\nIf they are not appearing in your browser:');
    console.log('1. Check the browser console for errors');
    console.log('2. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)');
    console.log('3. Clear browser cache');
    console.log('4. Check Network tab to see what the API actually returns');
    console.log('5. Make sure the dev server is running');
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
