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
  console.log('🔄 Updating user emails to official domains...\n');

  // Define email mappings (old email -> new email)
  const emailMappings = {
    'admin@letatchebois.com': 'aitouahman.abdelali@gmail.com', // Or your official domain
    'ahmed@letatche-bois.ma': 'aitouahman.abdelali@gmail.com',
    'fatima@letatche-bois.ma': '', // Leave empty to skip
    'mohammed@letatche-bois.ma': '', // Leave empty to skip
    'karim@letatche-bois.ma': '', // Leave empty to skip
  };

  console.log('📋 Email Update Plan:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // First, show current users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  console.log('Current users in database:');
  allUsers.forEach((user, index) => {
    const newEmail = emailMappings[user.email as keyof typeof emailMappings];
    console.log(`${index + 1}. ${user.name || 'No name'}`);
    console.log(`   Current: ${user.email}`);
    console.log(`   New: ${newEmail || '(will not be changed)'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Ask for confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const proceed = await new Promise<string>((resolve) => {
    readline.question('Do you want to proceed with these changes? (yes/no): ', (answer: string) => {
      readline.close();
      resolve(answer.trim().toLowerCase());
    });
  });

  if (proceed !== 'yes' && proceed !== 'y') {
    console.log('\n❌ Update cancelled');
    process.exit(0);
  }

  console.log('\n🔄 Updating emails...\n');

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const [oldEmail, newEmail] of Object.entries(emailMappings)) {
    if (!newEmail) {
      console.log(`⏭️  Skipped: ${oldEmail} (no new email specified)`);
      skippedCount++;
      continue;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: oldEmail },
      });

      if (!user) {
        console.log(`⚠️  Not found: ${oldEmail}`);
        skippedCount++;
        continue;
      }

      await prisma.user.update({
        where: { email: oldEmail },
        data: { email: newEmail },
      });

      console.log(`✅ Updated: ${oldEmail} → ${newEmail}`);
      updatedCount++;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint')) {
          console.log(`❌ Error: ${newEmail} is already in use`);
        } else {
          console.log(`❌ Error updating ${oldEmail}: ${error.message}`);
        }
      }
      errorCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   ✅ Updated: ${updatedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (updatedCount > 0) {
    console.log('✅ Email updates completed!');
    console.log('\n📧 You can now login with the new email addresses\n');
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
