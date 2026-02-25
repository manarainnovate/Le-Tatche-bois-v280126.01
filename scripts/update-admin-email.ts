import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Initialize Prisma with Neon adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Updating admin email...\n');

  // Current email
  const OLD_EMAIL = 'admin@letatchebois.com';

  // Ask for new email
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const newEmail = await new Promise<string>((resolve) => {
    readline.question('Enter new admin email: ', (answer: string) => {
      readline.close();
      resolve(answer.trim());
    });
  });

  if (!newEmail || !newEmail.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  try {
    // Update the admin user email
    const updatedUser = await prisma.user.update({
      where: { email: OLD_EMAIL },
      data: { email: newEmail },
    });

    console.log(`\n✅ Admin email updated successfully!`);
    console.log(`   Old email: ${OLD_EMAIL}`);
    console.log(`   New email: ${updatedUser.email}`);
    console.log(`\n📧 You can now login with: ${newEmail}`);
    console.log(`   Password: Admin@123! (remember to change it after login)\n`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        console.error(`\n❌ Error: Email ${newEmail} is already in use`);
      } else if (error.message.includes('Record to update not found')) {
        console.error(`\n❌ Error: Admin user with email ${OLD_EMAIL} not found`);
        console.log(`   Make sure you have run: npm run seed:crm`);
      } else {
        console.error(`\n❌ Error: ${error.message}`);
      }
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
