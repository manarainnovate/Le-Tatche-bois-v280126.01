import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkMessages() {
  try {
    const count = await prisma.message.count();
    console.log("Total messages in database:", count);

    const messages = await prisma.message.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
        read: true,
      },
    });

    console.log("\nRecent messages:");
    console.log(JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error("Error checking messages:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkMessages();
