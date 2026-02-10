import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Create Prisma client with pg adapter (Prisma 7)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════
// HELPER: Generate document number
// ═══════════════════════════════════════════════════════════

function generateNumber(prefix: string, year: number, num: number): string {
  return `${prefix}-${year}-${String(num).padStart(6, "0")}`;
}

// ═══════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("🌱 Starting CRM seed...");

  // ─────────────────────────────────────────────────────────
  // 1. Company Settings
  // ─────────────────────────────────────────────────────────
  console.log("📋 Creating company settings...");

  await prisma.companySettings.upsert({
    where: { id: "company" },
    update: {},
    create: {
      id: "company",
      companyName: "LE TATCHE BOIS S.A.R.L A.U",
      tagline: "Menuiserie artisanat – Décoration",
      rc: "120511",
      taxId: "50628346",
      ice: "002942117000021",
      pat: "64601859",
      address: "Lot Hamane El Fetouaki N°365, Lamhamid",
      city: "Marrakech",
      country: "Maroc",
      phone: "0687441840",
      phoneAlt: "0698013468",
      email: "contact@letatchebois.com",
      website: "www.letatchbois.com",
      whatsapp: "+212687441840",
      currency: "MAD",
      currencySymbol: "DH",
      currencyPosition: "after",
      defaultTvaRate: 20,
      tvaRates: [0, 7, 10, 14, 20],
      showPricesWithTva: false,
      defaultPaymentDays: 30,
      quoteValidityDays: 15,
      leadPrefix: "L",
      clientPrefix: "CLI",
      projectPrefix: "PRJ",
      devisPrefix: "D",
      bcPrefix: "BC",
      blPrefix: "BL",
      pvPrefix: "PV",
      facturePrefix: "F",
      avoirPrefix: "A",
      paymentPrefix: "PAY",
      quoteFooter: "Ce devis est valable 15 jours. Acompte de 50% à la commande, solde à la livraison.",
      bcFooter: "Bon de commande valant engagement ferme.",
      blFooter: "Marchandise reçue en bon état, sauf réserves mentionnées.",
      pvFooter: "Travaux réceptionnés conformes aux spécifications.",
      invoiceFooter: "Merci pour votre confiance.",
      avoirFooter: "Avoir à déduire sur prochaine facture.",
      availableUnits: [
        { code: "pcs", label: "Pièces" },
        { code: "m2", label: "Mètre carré" },
        { code: "ml", label: "Mètre linéaire" },
        { code: "m3", label: "Mètre cube" },
        { code: "kg", label: "Kilogramme" },
        { code: "l", label: "Litre" },
        { code: "h", label: "Heure" },
        { code: "forfait", label: "Forfait" },
        { code: "jour", label: "Jour" },
      ],
    },
  });

  // ─────────────────────────────────────────────────────────
  // 2. Admin User
  // ─────────────────────────────────────────────────────────
  console.log("👤 Creating admin user...");

  const hashedPassword = await bcrypt.hash("Admin@123!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@letatchebois.com" },
    update: {},
    create: {
      email: "admin@letatchebois.com",
      password: hashedPassword,
      name: "Administrateur",
      phone: "0687441840",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`   Admin user created: ${adminUser.email}`);

  // ─────────────────────────────────────────────────────────
  // 3. Document Sequences
  // ─────────────────────────────────────────────────────────
  console.log("🔢 Creating document sequences...");

  const currentYear = new Date().getFullYear();
  const sequenceTypes = [
    { type: "LEAD", prefix: "L" },
    { type: "CLIENT", prefix: "CLI" },
    { type: "PROJECT", prefix: "PRJ" },
    { type: "DEVIS", prefix: "D" },
    { type: "BC", prefix: "BC" },
    { type: "BL", prefix: "BL" },
    { type: "PV", prefix: "PV" },
    { type: "FACTURE", prefix: "F" },
    { type: "AVOIR", prefix: "A" },
    { type: "PAYMENT", prefix: "PAY" },
  ];

  for (const seq of sequenceTypes) {
    await prisma.documentSequence.upsert({
      where: {
        type_year: {
          type: seq.type,
          year: currentYear,
        },
      },
      update: {},
      create: {
        type: seq.type,
        prefix: seq.prefix,
        year: currentYear,
        lastNumber: 0,
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 4. Catalog Categories
  // ─────────────────────────────────────────────────────────
  console.log("📂 Creating catalog categories...");

  const categories = [
    // Parent categories
    { name: "Bois & Panneaux", slug: "bois-panneaux", icon: "TreeDeciduous", order: 1 },
    { name: "Quincaillerie", slug: "quincaillerie", icon: "Wrench", order: 2 },
    { name: "Finitions", slug: "finitions", icon: "Paintbrush", order: 3 },
    { name: "Services", slug: "services", icon: "Settings", order: 4 },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.catalogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }

  // Subcategories
  const subcategories = [
    { name: "MDF", slug: "mdf", parentId: createdCategories["bois-panneaux"], order: 1 },
    { name: "Contreplaqué", slug: "contreplaque", parentId: createdCategories["bois-panneaux"], order: 2 },
    { name: "Mélaminé", slug: "melamine", parentId: createdCategories["bois-panneaux"], order: 3 },
    { name: "Bois Massif", slug: "bois-massif", parentId: createdCategories["bois-panneaux"], order: 4 },
    { name: "Charnières", slug: "charnieres", parentId: createdCategories["quincaillerie"], order: 1 },
    { name: "Coulisses", slug: "coulisses", parentId: createdCategories["quincaillerie"], order: 2 },
    { name: "Poignées", slug: "poignees", parentId: createdCategories["quincaillerie"], order: 3 },
    { name: "Serrures", slug: "serrures", parentId: createdCategories["quincaillerie"], order: 4 },
    { name: "Vernis", slug: "vernis", parentId: createdCategories["finitions"], order: 1 },
    { name: "Peinture", slug: "peinture", parentId: createdCategories["finitions"], order: 2 },
    { name: "Teinte", slug: "teinte", parentId: createdCategories["finitions"], order: 3 },
    { name: "Fabrication", slug: "fabrication", parentId: createdCategories["services"], order: 1 },
    { name: "Installation", slug: "installation", parentId: createdCategories["services"], order: 2 },
    { name: "Livraison", slug: "livraison", parentId: createdCategories["services"], order: 3 },
  ];

  for (const sub of subcategories) {
    await prisma.catalogCategory.upsert({
      where: { slug: sub.slug },
      update: {},
      create: sub,
    });
  }

  // ─────────────────────────────────────────────────────────
  // 5. Catalog Items (Products)
  // ─────────────────────────────────────────────────────────
  console.log("📦 Creating catalog items...");

  // Get subcategory IDs
  const mdfCategory = await prisma.catalogCategory.findUnique({ where: { slug: "mdf" } });
  const melamineCategory = await prisma.catalogCategory.findUnique({ where: { slug: "melamine" } });
  const charnièresCategory = await prisma.catalogCategory.findUnique({ where: { slug: "charnieres" } });
  const coulissesCategory = await prisma.catalogCategory.findUnique({ where: { slug: "coulisses" } });
  const poigneesCategory = await prisma.catalogCategory.findUnique({ where: { slug: "poignees" } });
  const fabricationCategory = await prisma.catalogCategory.findUnique({ where: { slug: "fabrication" } });
  const installationCategory = await prisma.catalogCategory.findUnique({ where: { slug: "installation" } });
  const livraisonCategory = await prisma.catalogCategory.findUnique({ where: { slug: "livraison" } });

  const products = [
    // MDF Products
    {
      sku: "LTB-MDF-001",
      name: "MDF 18mm Blanc",
      description: "Panneau MDF 18mm finition blanc, 2440x1220mm",
      type: "PRODUCT" as const,
      categoryId: mdfCategory?.id,
      unit: "PCS" as const,
      purchasePrice: 350,
      sellingPriceHT: 480,
      tvaRate: 20,
      trackStock: true,
      stockQty: 50,
      stockMin: 10,
    },
    {
      sku: "LTB-MDF-002",
      name: "MDF 16mm Brut",
      description: "Panneau MDF 16mm brut, 2440x1220mm",
      type: "PRODUCT" as const,
      categoryId: mdfCategory?.id,
      unit: "PCS" as const,
      purchasePrice: 280,
      sellingPriceHT: 380,
      tvaRate: 20,
      trackStock: true,
      stockQty: 80,
      stockMin: 15,
    },
    // Mélaminé
    {
      sku: "LTB-MEL-001",
      name: "Mélaminé Blanc 18mm",
      description: "Panneau mélaminé blanc double face 18mm, 2440x1220mm",
      type: "PRODUCT" as const,
      categoryId: melamineCategory?.id,
      unit: "PCS" as const,
      purchasePrice: 420,
      sellingPriceHT: 550,
      tvaRate: 20,
      trackStock: true,
      stockQty: 40,
      stockMin: 8,
    },
    {
      sku: "LTB-MEL-002",
      name: "Mélaminé Chêne 18mm",
      description: "Panneau mélaminé décor chêne clair 18mm, 2440x1220mm",
      type: "PRODUCT" as const,
      categoryId: melamineCategory?.id,
      unit: "PCS" as const,
      purchasePrice: 480,
      sellingPriceHT: 620,
      tvaRate: 20,
      trackStock: true,
      stockQty: 30,
      stockMin: 5,
    },
    // Quincaillerie
    {
      sku: "LTB-QUI-001",
      name: "Charnière Blum 110°",
      description: "Charnière Blum clip-top 110° avec amortisseur",
      type: "PRODUCT" as const,
      categoryId: charnièresCategory?.id,
      unit: "PCS" as const,
      purchasePrice: 25,
      sellingPriceHT: 45,
      tvaRate: 20,
      trackStock: true,
      stockQty: 200,
      stockMin: 50,
    },
    {
      sku: "LTB-QUI-002",
      name: "Coulisse tiroir 50cm",
      description: "Coulisse à billes extension totale 50cm, charge 45kg",
      type: "PRODUCT" as const,
      categoryId: coulissesCategory?.id,
      unit: "PCS" as const,
      purchasePrice: 65,
      sellingPriceHT: 95,
      tvaRate: 20,
      trackStock: true,
      stockQty: 100,
      stockMin: 20,
    },
    {
      sku: "LTB-QUI-003",
      name: "Poignée inox 128mm",
      description: "Poignée tubulaire inox brossé entraxe 128mm",
      type: "PRODUCT" as const,
      categoryId: poigneesCategory?.id,
      unit: "PCS" as const,
      purchasePrice: 35,
      sellingPriceHT: 55,
      tvaRate: 20,
      trackStock: true,
      stockQty: 150,
      stockMin: 30,
    },
  ];

  for (const product of products) {
    await prisma.catalogItem.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  // ─────────────────────────────────────────────────────────
  // 6. Catalog Items (Services)
  // ─────────────────────────────────────────────────────────
  console.log("🔧 Creating service items...");

  const services = [
    {
      sku: "LTB-SERV-001",
      name: "Fabrication sur mesure",
      description: "Main d'oeuvre fabrication meuble sur mesure",
      type: "SERVICE" as const,
      categoryId: fabricationCategory?.id,
      unit: "H" as const,
      sellingPriceHT: 150,
      tvaRate: 20,
      trackStock: false,
    },
    {
      sku: "LTB-SERV-002",
      name: "Installation / Pose",
      description: "Main d'oeuvre installation et pose",
      type: "SERVICE" as const,
      categoryId: installationCategory?.id,
      unit: "H" as const,
      sellingPriceHT: 180,
      tvaRate: 20,
      trackStock: false,
    },
    {
      sku: "LTB-SERV-003",
      name: "Livraison Marrakech",
      description: "Livraison dans Marrakech et environs (15km)",
      type: "SERVICE" as const,
      categoryId: livraisonCategory?.id,
      unit: "FORFAIT" as const,
      sellingPriceHT: 200,
      tvaRate: 20,
      trackStock: false,
    },
    {
      sku: "LTB-SERV-004",
      name: "Livraison Hors Zone",
      description: "Livraison hors zone Marrakech (par km)",
      type: "SERVICE" as const,
      categoryId: livraisonCategory?.id,
      unit: "ML" as const,
      sellingPriceHT: 5,
      tvaRate: 20,
      trackStock: false,
    },
    {
      sku: "LTB-SERV-005",
      name: "Étude et conception",
      description: "Étude technique et conception 3D",
      type: "SERVICE" as const,
      categoryId: fabricationCategory?.id,
      unit: "FORFAIT" as const,
      sellingPriceHT: 500,
      tvaRate: 20,
      trackStock: false,
    },
    {
      sku: "LTB-SERV-006",
      name: "Prise de mesures",
      description: "Déplacement et prise de mesures sur site",
      type: "SERVICE" as const,
      categoryId: fabricationCategory?.id,
      unit: "FORFAIT" as const,
      sellingPriceHT: 300,
      tvaRate: 20,
      trackStock: false,
    },
  ];

  for (const service of services) {
    await prisma.catalogItem.upsert({
      where: { sku: service.sku },
      update: {},
      create: service,
    });
  }

  // ─────────────────────────────────────────────────────────
  // 7. Sample Clients
  // ─────────────────────────────────────────────────────────
  console.log("👥 Creating sample clients...");

  // Update client sequence
  await prisma.documentSequence.update({
    where: { type_year: { type: "CLIENT", year: currentYear } },
    data: { lastNumber: 3 },
  });

  const clients = [
    {
      clientNumber: generateNumber("CLI", currentYear, 1),
      clientType: "INDIVIDUAL" as const,
      fullName: "Mohammed Alami",
      phone: "0661234567",
      email: "m.alami@gmail.com",
      billingCity: "Marrakech",
      billingAddress: "Rue Ibn Toumert, Guéliz",
      deliveryCity: "Marrakech",
      deliveryAddress: "Rue Ibn Toumert, Guéliz",
      tags: ["fidèle", "cuisine"],
    },
    {
      clientNumber: generateNumber("CLI", currentYear, 2),
      clientType: "COMPANY" as const,
      fullName: "Hôtel Atlas",
      company: "Atlas Hospitality SARL",
      phone: "0524334455",
      email: "contact@hotelatas.ma",
      ice: "001234567000089",
      billingCity: "Marrakech",
      billingAddress: "Avenue Mohammed V",
      deliveryCity: "Marrakech",
      deliveryAddress: "Avenue Mohammed V",
      paymentTerms: "30j",
      tags: ["VIP", "pro", "hôtellerie"],
    },
    {
      clientNumber: generateNumber("CLI", currentYear, 3),
      clientType: "INDIVIDUAL" as const,
      fullName: "Fatima Bennis",
      phone: "0662345678",
      email: "f.bennis@gmail.com",
      billingCity: "Casablanca",
      billingAddress: "Bd Anfa",
      deliveryCity: "Casablanca",
      deliveryAddress: "Bd Anfa",
      tags: ["dressing"],
    },
  ];

  const createdClients: string[] = [];

  for (const client of clients) {
    const created = await prisma.cRMClient.upsert({
      where: { clientNumber: client.clientNumber },
      update: {},
      create: client,
    });
    createdClients.push(created.id);
  }

  // ─────────────────────────────────────────────────────────
  // 8. Sample Projects
  // ─────────────────────────────────────────────────────────
  console.log("🏗️ Creating sample projects...");

  // Update project sequence
  await prisma.documentSequence.update({
    where: { type_year: { type: "PROJECT", year: currentYear } },
    data: { lastNumber: 2 },
  });

  // Create projects individually to handle optional clientId
  if (createdClients[0]) {
    await prisma.cRMProject.upsert({
      where: { projectNumber: generateNumber("PRJ", currentYear, 1) },
      update: {},
      create: {
        projectNumber: generateNumber("PRJ", currentYear, 1),
        clientId: createdClients[0],
        name: "Cuisine complète - M. Alami",
        description: "Cuisine équipée en L, mélaminé blanc et plan de travail granit",
        type: "BOTH",
        status: "PRODUCTION",
        siteCity: "Marrakech",
        siteAddress: "Rue Ibn Toumert, Guéliz",
        startDate: new Date(),
        expectedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estimatedBudget: 85000,
        priority: "high",
        assignedToId: adminUser.id,
      },
    });
  }

  if (createdClients[1]) {
    await prisma.cRMProject.upsert({
      where: { projectNumber: generateNumber("PRJ", currentYear, 2) },
      update: {},
      create: {
        projectNumber: generateNumber("PRJ", currentYear, 2),
        clientId: createdClients[1],
        name: "Aménagement chambres Hôtel Atlas",
        description: "Placards et meubles TV pour 15 chambres",
        type: "BOTH",
        status: "QUOTE",
        siteCity: "Marrakech",
        siteAddress: "Avenue Mohammed V",
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        expectedEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        estimatedBudget: 350000,
        priority: "medium",
        assignedToId: adminUser.id,
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 9. Sample Leads
  // ─────────────────────────────────────────────────────────
  console.log("🎯 Creating sample leads...");

  // Update lead sequence
  await prisma.documentSequence.update({
    where: { type_year: { type: "LEAD", year: currentYear } },
    data: { lastNumber: 5 },
  });

  const leads = [
    {
      leadNumber: generateNumber("L", currentYear, 1),
      source: "WEBSITE" as const,
      status: "NEW" as const,
      fullName: "Karim Benjelloun",
      phone: "0663456789",
      email: "k.benjelloun@yahoo.fr",
      city: "Marrakech",
      clientType: "INDIVIDUAL" as const,
      need: "Dressing pour chambre parentale, 4m linéaire, avec portes coulissantes",
      budgetMin: 25000,
      budgetMax: 40000,
      urgency: "MEDIUM" as const,
      assignedToId: adminUser.id,
    },
    {
      leadNumber: generateNumber("L", currentYear, 2),
      source: "WHATSAPP" as const,
      status: "CONTACTED" as const,
      fullName: "Sara Idrissi",
      phone: "0664567890",
      city: "Casablanca",
      clientType: "INDIVIDUAL" as const,
      need: "Bibliothèque sur mesure pour salon, bois massif",
      budgetMin: 15000,
      budgetMax: 25000,
      urgency: "LOW" as const,
      assignedToId: adminUser.id,
    },
    {
      leadNumber: generateNumber("L", currentYear, 3),
      source: "FACEBOOK" as const,
      status: "VISIT_SCHEDULED" as const,
      fullName: "Restaurant Le Jardin",
      company: "Le Jardin SARL",
      phone: "0524223344",
      email: "info@lejardin.ma",
      city: "Marrakech",
      clientType: "COMPANY" as const,
      ice: "002345678000012",
      need: "Bar et comptoir bois avec rangements, design contemporain",
      budgetMin: 80000,
      budgetMax: 120000,
      urgency: "HIGH" as const,
      assignedToId: adminUser.id,
    },
    {
      leadNumber: generateNumber("L", currentYear, 4),
      source: "REFERRAL" as const,
      status: "QUOTE_SENT" as const,
      fullName: "Ahmed Tazi",
      phone: "0665678901",
      email: "a.tazi@outlook.com",
      city: "Marrakech",
      clientType: "INDIVIDUAL" as const,
      need: "Meuble TV mural avec rangements, finition laqué blanc",
      budgetMin: 8000,
      budgetMax: 15000,
      urgency: "LOW" as const,
      assignedToId: adminUser.id,
    },
    {
      leadNumber: generateNumber("L", currentYear, 5),
      source: "WALK_IN" as const,
      status: "NEGOTIATION" as const,
      fullName: "Riad Palmeraie",
      company: "Palmeraie Hospitality",
      phone: "0524445566",
      email: "contact@riadpalmeraie.com",
      city: "Marrakech",
      address: "Route de la Palmeraie",
      clientType: "COMPANY" as const,
      ice: "003456789000034",
      need: "Rénovation de 8 salles de bain (meubles vasque) + 8 placards",
      budgetMin: 150000,
      budgetMax: 200000,
      urgency: "HIGH" as const,
      notes: "Client très intéressé, visite effectuée le 20/01. Demande devis détaillé.",
      assignedToId: adminUser.id,
    },
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { leadNumber: lead.leadNumber },
      update: {},
      create: lead,
    });
  }

  // ─────────────────────────────────────────────────────────
  // 10. Sample Activities
  // ─────────────────────────────────────────────────────────
  console.log("📝 Creating sample activities...");

  const leadRecords = await prisma.lead.findMany({ take: 5 });

  for (const lead of leadRecords) {
    await prisma.activity.create({
      data: {
        type: "NOTE",
        description: `Lead créé depuis ${lead.source.toLowerCase()}. Besoin: ${lead.need || "Non spécifié"}`,
        leadId: lead.id,
        createdById: adminUser.id,
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 11. Currencies
  // ─────────────────────────────────────────────────────────
  console.log("💱 Creating currencies...");

  const currencies = [
    { code: "MAD", symbol: "DH", name: "Dirham Marocain", rate: 1, locale: "fr-MA", position: "after", isDefault: true },
    { code: "EUR", symbol: "€", name: "Euro", rate: 0.091, locale: "fr-FR", position: "before", isDefault: false },
    { code: "USD", symbol: "$", name: "US Dollar", rate: 0.099, locale: "en-US", position: "before", isDefault: false },
    { code: "GBP", symbol: "£", name: "British Pound", rate: 0.078, locale: "en-GB", position: "before", isDefault: false },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { rate: currency.rate },
      create: currency,
    });
  }

  // ─────────────────────────────────────────────────────────
  // 12. Suppliers
  // ─────────────────────────────────────────────────────────
  console.log("🏭 Creating suppliers...");

  const suppliers = [
    {
      code: "FRN-001",
      name: "SARL Bois du Maroc",
      contactName: "Hassan Bennani",
      phone: "0522556677",
      email: "contact@boisdumaroc.ma",
      city: "Casablanca",
      country: "Maroc",
      paymentTerms: "30j fin de mois",
    },
    {
      code: "FRN-002",
      name: "Quincaillerie Atlas",
      contactName: "Youssef Alaoui",
      phone: "0524334455",
      email: "atlas.quincaillerie@gmail.com",
      city: "Marrakech",
      country: "Maroc",
      paymentTerms: "comptant",
    },
    {
      code: "FRN-003",
      name: "Import Bois Europe",
      contactName: "Jean Martin",
      phone: "+33145678901",
      email: "contact@importboiseurope.fr",
      city: "Lyon",
      country: "France",
      paymentTerms: "50% acompte, 50% à réception",
    },
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { code: supplier.code! },
      update: {},
      create: supplier,
    });
  }

  console.log("");
  console.log("✅ CRM seed completed successfully!");
  console.log("");
  console.log("📊 Summary:");
  console.log("   - 1 Company settings");
  console.log("   - 1 Admin user (admin@letatchebois.com / Admin@123!)");
  console.log("   - 10 Document sequences");
  console.log("   - 18 Catalog categories");
  console.log("   - 7 Products + 6 Services");
  console.log("   - 3 Clients");
  console.log("   - 2 Projects");
  console.log("   - 5 Leads");
  console.log("   - 4 Currencies");
  console.log("   - 3 Suppliers");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
