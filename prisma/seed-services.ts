import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════════════════
// SiteService seed data based on existing PortfolioCategories
// Each service.slug matches a PortfolioCategory.slug
// ═══════════════════════════════════════════════════════════

const services = [
  {
    slug: "portes",
    icon: "🚪",
    order: 1,
    isFeatured: true,
    hasDetailPage: true,
    titleFr: "Portes en Bois",
    titleEn: "Wooden Doors",
    titleEs: "Puertas de Madera",
    titleAr: "أبواب خشبية",
    shortDescFr: "Portes d'entrée, intérieures et de sécurité en bois massif, sur mesure.",
    shortDescEn: "Custom-made entrance, interior and security doors in solid wood.",
    descriptionFr: `## Portes en Bois Sur Mesure

Nos **portes en bois massif** sont fabriquées artisanalement dans notre atelier de Marrakech. Chaque porte est une pièce unique, conçue selon vos dimensions et votre style.

### Nos Types de Portes

1. **Portes d'entrée** — Imposantes et sécurisées, avec serrures multipoints
2. **Portes intérieures** — Élégantes et fonctionnelles pour chaque pièce
3. **Portes de placard** — Coulissantes ou battantes, optimisant l'espace
4. **Portes traditionnelles** — Motifs géométriques marocains sculptés à la main

### Essences de Bois Disponibles

- **Cèdre de l'Atlas** — Parfum naturel, résistant aux insectes
- **Noyer** — Grain noble, finition luxueuse
- **Chêne** — Robuste et durable, idéal pour l'entrée
- **Thuya** — Loupes et motifs uniques

### Notre Processus

Chaque porte passe par **6 étapes** de fabrication : sélection du bois, découpe CNC, sculpture manuelle, assemblage traditionnel, ponçage fin et vernissage écologique.`,
    descriptionEn: `## Custom Wooden Doors

Our **solid wood doors** are handcrafted in our Marrakech workshop. Each door is a unique piece, designed to your dimensions and style.

### Our Door Types

1. **Entrance doors** — Impressive and secure, with multipoint locks
2. **Interior doors** — Elegant and functional for every room
3. **Closet doors** — Sliding or hinged, optimizing space
4. **Traditional doors** — Hand-carved Moroccan geometric patterns

### Available Wood Species

- **Atlas Cedar** — Natural fragrance, insect resistant
- **Walnut** — Noble grain, luxurious finish
- **Oak** — Robust and durable, ideal for entrances
- **Thuya** — Unique burls and patterns`,
    descriptionEs: `## Puertas de Madera a Medida

Nuestras **puertas de madera maciza** están fabricadas artesanalmente en nuestro taller de Marrakech.`,
    descriptionAr: `## أبواب خشبية حسب الطلب

**أبوابنا الخشبية المصمتة** مصنوعة يدوياً في ورشتنا بمراكش. كل باب قطعة فريدة، مصممة حسب مقاساتك وأسلوبك.`,
  },
  {
    slug: "cuisines",
    icon: "🍽️",
    order: 2,
    isFeatured: true,
    hasDetailPage: true,
    titleFr: "Cuisines en Bois",
    titleEn: "Wooden Kitchens",
    titleEs: "Cocinas de Madera",
    titleAr: "مطابخ خشبية",
    shortDescFr: "Cuisines équipées sur mesure en bois massif, design moderne ou traditionnel.",
    shortDescEn: "Custom fitted kitchens in solid wood, modern or traditional design.",
    descriptionFr: `## Cuisines Sur Mesure en Bois Massif

Transformez votre cuisine en un espace chaleureux et fonctionnel avec nos **cuisines en bois massif**. Chaque projet est conçu sur mesure pour s'adapter parfaitement à votre espace.

### Ce Que Nous Proposons

- **Meubles hauts et bas** sur mesure
- **Îlots centraux** en bois massif
- **Plans de travail** en bois ou compatible
- **Rangements optimisés** — tiroirs à l'anglaise, étagères rotatives

### Styles Disponibles

1. **Moderne** — Lignes épurées, poignées intégrées
2. **Traditionnel marocain** — Moucharabiehs et motifs géométriques
3. **Rustique** — Bois brut, charme authentique
4. **Contemporain** — Mix bois et matériaux modernes`,
    descriptionEn: `## Custom Solid Wood Kitchens

Transform your kitchen into a warm and functional space with our **solid wood kitchens**.`,
    descriptionEs: `## Cocinas a Medida en Madera Maciza`,
    descriptionAr: `## مطابخ خشبية حسب الطلب`,
  },
  {
    slug: "placards-dressings",
    icon: "🗄️",
    order: 3,
    isFeatured: true,
    hasDetailPage: true,
    titleFr: "Placards & Dressings",
    titleEn: "Wardrobes & Dressings",
    titleEs: "Armarios y Vestidores",
    titleAr: "خزائن وغرف ملابس",
    shortDescFr: "Placards intégrés et dressings sur mesure, optimisation maximale de l'espace.",
    shortDescEn: "Built-in wardrobes and custom dressings, maximum space optimization.",
    descriptionFr: `## Placards & Dressings Sur Mesure

Nos **placards et dressings** sont conçus pour exploiter chaque centimètre de votre espace. Fabrication 100% sur mesure en bois massif.

### Solutions de Rangement

- **Placards intégrés** — Sur toute la hauteur du mur
- **Dressings walk-in** — Espaces dédiés et luxueux
- **Placards coulissants** — Gain de place optimal
- **Bibliothèques intégrées** — Élégantes et pratiques`,
    descriptionEn: `## Custom Wardrobes & Dressings`,
    descriptionEs: `## Armarios y Vestidores a Medida`,
    descriptionAr: `## خزائن وغرف ملابس حسب الطلب`,
  },
  {
    slug: "escaliers",
    icon: "🪜",
    order: 4,
    isFeatured: true,
    hasDetailPage: true,
    titleFr: "Escaliers en Bois",
    titleEn: "Wooden Stairs",
    titleEs: "Escaleras de Madera",
    titleAr: "سلالم خشبية",
    shortDescFr: "Escaliers droits, tournants ou hélicoïdaux en bois massif noble.",
    shortDescEn: "Straight, turning or helical stairs in noble solid wood.",
    descriptionFr: `## Escaliers en Bois Sur Mesure

Nos **escaliers en bois** combinent esthétique et sécurité. Chaque escalier est conçu sur mesure pour s'intégrer parfaitement à votre intérieur.

### Types d'Escaliers

1. **Escalier droit** — Classique et élégant
2. **Escalier tournant** — Quart ou demi-tournant
3. **Escalier hélicoïdal** — Gain de place, design spectaculaire
4. **Escalier suspendu** — Effet flottant moderne

### Finitions

- Rampes et garde-corps sculptés
- Contremarches décoratives
- Main courante ergonomique
- Éclairage LED intégré en option`,
    descriptionEn: `## Custom Wooden Stairs`,
    descriptionEs: `## Escaleras de Madera a Medida`,
    descriptionAr: `## سلالم خشبية حسب الطلب`,
  },
  {
    slug: "plafonds-murs",
    icon: "🏠",
    order: 5,
    isFeatured: true,
    hasDetailPage: true,
    titleFr: "Habillage Mur & Plafonds",
    titleEn: "Wall & Ceiling Cladding",
    titleEs: "Revestimiento de Paredes y Techos",
    titleAr: "تكسية الجدران والأسقف",
    shortDescFr: "Faux plafonds en bois, lambris muraux et panneaux décoratifs sur mesure.",
    shortDescEn: "Wooden false ceilings, wall panels and custom decorative panels.",
    descriptionFr: `## Habillage Mur & Plafonds en Bois

Donnez du caractère à vos espaces avec nos **habillages en bois**. Plafonds, murs et panneaux décoratifs réalisés sur mesure.

### Nos Réalisations

- **Faux plafonds** — Caissons, lames ou motifs géométriques
- **Lambris muraux** — Boiseries élégantes
- **Panneaux décoratifs** — Moucharabiehs et claustra
- **Moulures** — Corniches et encadrements`,
    descriptionEn: `## Wall & Ceiling Wood Cladding`,
    descriptionEs: `## Revestimiento de Paredes y Techos en Madera`,
    descriptionAr: `## تكسية الجدران والأسقف بالخشب`,
  },
  {
    slug: "salons",
    icon: "🛋️",
    order: 6,
    isFeatured: true,
    hasDetailPage: true,
    titleFr: "Mobilier Salon",
    titleEn: "Living Room Furniture",
    titleEs: "Mobiliario de Salón",
    titleAr: "أثاث الصالون",
    shortDescFr: "Salons marocains et modernes sur mesure, banquettes, meubles TV et rangements.",
    shortDescEn: "Custom Moroccan and modern living rooms, benches, TV units and storage.",
    descriptionFr: `## Mobilier de Salon Sur Mesure

Créez le salon de vos rêves avec nos **meubles en bois massif**. Du salon marocain traditionnel au design contemporain.

### Nos Créations

- **Salon marocain** — Banquettes, tables basses, étagères
- **Meuble TV** — Sur mesure avec rangements intégrés
- **Bibliothèques** — Du sol au plafond
- **Tables basses** — Design unique en bois noble`,
    descriptionEn: `## Custom Living Room Furniture`,
    descriptionEs: `## Mobiliario de Salón a Medida`,
    descriptionAr: `## أثاث صالون حسب الطلب`,
  },
  {
    slug: "terrasses-pergolas",
    icon: "🌿",
    order: 7,
    isFeatured: false,
    hasDetailPage: true,
    titleFr: "Terrasses & Pergolas",
    titleEn: "Terraces & Pergolas",
    titleEs: "Terrazas y Pérgolas",
    titleAr: "تراسات وعريشات",
    shortDescFr: "Terrasses en bois, pergolas et aménagements extérieurs durables.",
    shortDescEn: "Wooden terraces, pergolas and durable outdoor arrangements.",
    descriptionFr: `## Terrasses & Pergolas en Bois

Profitez de vos extérieurs avec nos **terrasses et pergolas** en bois traité. Résistant aux intempéries, beau et durable.

### Nos Solutions Extérieures

- **Terrasses** — Lames en bois exotique ou traité
- **Pergolas** — Bioclimatiques ou classiques
- **Carports** — Abris voiture en bois
- **Clôtures** — Brise-vue et palissades`,
    descriptionEn: `## Wooden Terraces & Pergolas`,
    descriptionEs: `## Terrazas y Pérgolas de Madera`,
    descriptionAr: `## تراسات وعريشات خشبية`,
  },
  {
    slug: "tables",
    icon: "🪑",
    order: 8,
    isFeatured: false,
    hasDetailPage: true,
    titleFr: "Tables & Plans de Travail",
    titleEn: "Tables & Worktops",
    titleEs: "Mesas y Encimeras",
    titleAr: "طاولات وأسطح عمل",
    shortDescFr: "Tables à manger, de conférence et plans de travail en bois massif.",
    shortDescEn: "Dining, conference tables and solid wood worktops.",
    descriptionFr: `## Tables & Plans de Travail en Bois

Des **tables uniques** fabriquées en bois massif. Chaque pièce est une création originale.

### Nos Spécialités

- **Tables à manger** — Pour 4 à 20 personnes
- **Tables de conférence** — Professionnelles et imposantes
- **Plans de travail** — Cuisine, bureau ou atelier
- **Tables basses** — Design contemporain ou traditionnel`,
    descriptionEn: `## Wooden Tables & Worktops`,
    descriptionEs: `## Mesas y Encimeras de Madera`,
    descriptionAr: `## طاولات وأسطح عمل خشبية`,
  },
  {
    slug: "decoration",
    icon: "🎨",
    order: 9,
    isFeatured: false,
    hasDetailPage: true,
    titleFr: "Décoration en Bois",
    titleEn: "Wood Decoration",
    titleEs: "Decoración en Madera",
    titleAr: "ديكور خشبي",
    shortDescFr: "Moucharabiehs, claustra, cadres et éléments décoratifs sculptés.",
    shortDescEn: "Moucharabiehs, latticework, frames and carved decorative elements.",
    descriptionFr: `## Décoration en Bois Artisanale

Nos **éléments décoratifs** en bois sont sculptés à la main par nos maîtres artisans. Art marocain traditionnel et design contemporain.

### Nos Créations Décoratives

- **Moucharabiehs** — Panneaux ajourés traditionnels
- **Claustra** — Séparations décoratives
- **Cadres & Miroirs** — Encadrements sculptés
- **Objets d'art** — Pièces uniques et limitées`,
    descriptionEn: `## Artisanal Wood Decoration`,
    descriptionEs: `## Decoración Artesanal en Madera`,
    descriptionAr: `## ديكور خشبي حرفي`,
  },
  {
    slug: "salles-de-bain",
    icon: "🚿",
    order: 10,
    isFeatured: false,
    hasDetailPage: true,
    titleFr: "Salles de Bain",
    titleEn: "Bathrooms",
    titleEs: "Baños",
    titleAr: "حمامات",
    shortDescFr: "Meubles de salle de bain en bois traité, vasques et rangements.",
    shortDescEn: "Treated wood bathroom furniture, basins and storage.",
    descriptionFr: `## Meubles de Salle de Bain en Bois

Des **meubles de salle de bain** en bois traité contre l'humidité. Élégance et durabilité garanties.`,
    descriptionEn: `## Wooden Bathroom Furniture`,
    descriptionEs: `## Muebles de Baño en Madera`,
    descriptionAr: `## أثاث حمام خشبي`,
  },
  {
    slug: "mosquees",
    icon: "🕌",
    order: 11,
    isFeatured: false,
    hasDetailPage: true,
    titleFr: "Mosquées & Lieux de Culte",
    titleEn: "Mosques & Places of Worship",
    titleEs: "Mezquitas y Lugares de Culto",
    titleAr: "مساجد وأماكن عبادة",
    shortDescFr: "Minbars, mihrabs, portes et boiseries pour mosquées et lieux de culte.",
    shortDescEn: "Minbars, mihrabs, doors and woodwork for mosques and places of worship.",
    descriptionFr: `## Boiseries pour Mosquées

Nous réalisons des **travaux de boiserie** pour mosquées et lieux de culte. Minbars, mihrabs et portes sculptés dans le respect de la tradition.`,
    descriptionEn: `## Mosque Woodwork`,
    descriptionEs: `## Carpintería para Mezquitas`,
    descriptionAr: `## أعمال خشبية للمساجد`,
  },
];

async function main() {
  console.log("🌱 Seeding SiteService...");

  // Get a cover image from the first project in each matching category
  for (const service of services) {
    const category = await prisma.portfolioCategory.findFirst({
      where: { slug: service.slug },
    });

    let image = "";
    if (category) {
      const project = await prisma.portfolioProject.findFirst({
        where: { categoryId: category.id, isActive: true },
        orderBy: [{ isFeatured: "desc" }, { order: "asc" }],
        select: { coverImage: true, afterImages: true },
      });
      image = project?.coverImage || (project?.afterImages?.[0] ?? "");
    }

    await prisma.siteService.upsert({
      where: { slug: service.slug },
      update: {
        ...service,
        image: image || service.icon,
      },
      create: {
        ...service,
        image: image || "",
      },
    });

    console.log(`  ✅ ${service.slug} (image: ${image ? "yes" : "no"})`);
  }

  const count = await prisma.siteService.count();
  console.log(`\n🎉 Done! ${count} services seeded.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
