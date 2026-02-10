import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { compare, hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testAuth() {
  console.log("🔍 Testing authentication...\n");
  
  // 1. Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: "admin@letatche-bois.ma" }
  });
  
  if (!user) {
    console.log("❌ User NOT found in database!");
    console.log("\n📌 Creating admin user now...");
    
    const hashedPassword = await hash("Admin@2025!", 12);
    const newUser = await prisma.user.create({
      data: {
        email: "admin@letatche-bois.ma",
        password: hashedPassword,
        name: "Admin",
        role: "ADMIN",
        isActive: true,
      }
    });
    console.log("✅ Admin user created:", newUser.email);
    return;
  }
  
  console.log("✅ User found:");
  console.log("   ID:", user.id);
  console.log("   Email:", user.email);
  console.log("   Name:", user.name);
  console.log("   Role:", user.role);
  console.log("   isActive:", user.isActive);
  console.log("   Password hash (first 20 chars):", user.password ? user.password.substring(0, 20) + "..." : "null");

  if (!user.password) {
    console.log("❌ User has no password set!");
    return;
  }

  // 2. Test password comparison
  console.log("\n🔐 Testing password 'Admin@2025!'...");
  const isValid = await compare("Admin@2025!", user.password);
  console.log("   Result:", isValid ? "✅ VALID" : "❌ INVALID");
  
  if (!isValid) {
    console.log("\n📌 Password is invalid. Resetting to 'Admin@2025!'...");
    const newHash = await hash("Admin@2025!", 12);
    await prisma.user.update({
      where: { email: "admin@letatche-bois.ma" },
      data: { password: newHash }
    });
    console.log("✅ Password updated!");
    
    // Verify it works now
    const updatedUser = await prisma.user.findUnique({
      where: { email: "admin@letatche-bois.ma" }
    });
    if (updatedUser && updatedUser.password) {
      const checkAgain = await compare("Admin@2025!", updatedUser.password);
      console.log("   Verification:", checkAgain ? "✅ Password now works!" : "❌ Still not working");
    }
  }
  
  console.log("\n========================================");
  console.log("Login credentials:");
  console.log("  Email:    admin@letatche-bois.ma");
  console.log("  Password: Admin@2025!");
  console.log("========================================");
}

testAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
