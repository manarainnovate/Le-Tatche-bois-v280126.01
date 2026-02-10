#!/usr/bin/env node
/**
 * 🪵 TATCH BOIS - Portfolio Import Script
 * ========================================
 * Copies images to public/uploads/ and seeds the database.
 * 
 * PHASE 1: Copy images (instant, free)
 * PHASE 2: Seed database with Prisma (instant, free)
 * PHASE 3: Generate descriptions (optional, needs API key)
 * 
 * Usage:
 *   node scripts/import-portfolio.js
 *   node scripts/import-portfolio.js --source "/path/to/CLASSIFIED_FINAL"
 *   node scripts/import-portfolio.js --images-only     (skip DB)
 *   node scripts/import-portfolio.js --db-only          (skip images, just seed DB)
 *   node scripts/import-portfolio.js --dry-run          (preview)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ══════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════

const DEFAULT_SOURCE = '/Users/abdelaliaitouahman/Desktop/TATCH BOIS ZAKI PHOTO_CLASSIFIED_CLEAN';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif']);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Category config with translations and icons
const CATEGORY_CONFIG = {
  'Escaliers':          { icon: '🪜', nameFr: 'Escaliers',                nameEn: 'Stairs',                  nameEs: 'Escaleras',                        nameAr: 'سلالم' },
  'Portes':             { icon: '🚪', nameFr: 'Portes',                  nameEn: 'Doors',                   nameEs: 'Puertas',                          nameAr: 'أبواب' },
  'Tables':             { icon: '🪑', nameFr: 'Tables',                  nameEn: 'Tables',                  nameEs: 'Mesas',                            nameAr: 'طاولات' },
  'Chaises':            { icon: '💺', nameFr: 'Chaises & Bancs',         nameEn: 'Chairs & Benches',        nameEs: 'Sillas y Bancos',                  nameAr: 'كراسي ومقاعد' },
  'Cuisines':           { icon: '🍽️', nameFr: 'Cuisines',                nameEn: 'Kitchens',                nameEs: 'Cocinas',                          nameAr: 'مطابخ' },
  'Placards-Dressings': { icon: '🗄️', nameFr: 'Placards & Dressings',   nameEn: 'Wardrobes & Closets',     nameEs: 'Armarios y Vestidores',             nameAr: 'خزائن وغرف ملابس' },
  'Fenetres':           { icon: '🪟', nameFr: 'Fenêtres',               nameEn: 'Windows',                 nameEs: 'Ventanas',                         nameAr: 'نوافذ' },
  'Lits':               { icon: '🛏️', nameFr: 'Lits',                   nameEn: 'Beds',                    nameEs: 'Camas',                            nameAr: 'أسرّة' },
  'Etageres':           { icon: '📚', nameFr: 'Étagères',               nameEn: 'Shelves',                 nameEs: 'Estanterías',                      nameAr: 'رفوف' },
  'Plafonds-Murs':      { icon: '🏠', nameFr: 'Habillage Mur & Plafonds', nameEn: 'Wall & Ceiling Cladding', nameEs: 'Revestimiento de Paredes y Techos', nameAr: 'تغطية الجدران والأسقف' },
  'Terrasses-Pergolas':  { icon: '🌿', nameFr: 'Terrasses & Pergolas',   nameEn: 'Terraces & Pergolas',     nameEs: 'Terrazas y Pérgolas',               nameAr: 'شرفات وعرائش' },
  'Salons':             { icon: '🛋️', nameFr: 'Mobilier Salon',         nameEn: 'Living Room Furniture',   nameEs: 'Mobiliario de Salón',               nameAr: 'أثاث غرفة المعيشة' },
  'Salles-de-bain':     { icon: '🚿', nameFr: 'Salles de Bain',         nameEn: 'Bathrooms',               nameEs: 'Baños',                            nameAr: 'حمامات' },
  'Decoration':         { icon: '🎨', nameFr: 'Décoration',             nameEn: 'Decoration',              nameEs: 'Decoración',                       nameAr: 'ديكور' },
};

// Categories to SKIP (not client-facing portfolio)
const SKIP_CATEGORIES = new Set(['Autres', 'Materiau-Bois', 'Atelier']);


// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

function isImage(filename) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function getImages(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter(f => isImage(f) && !f.startsWith('.'))
    .sort();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function makeTitleFromFolder(folderName) {
  // "01-Projet-Porte-Entree-Cedre" -> "Porte Entrée Cèdre"
  let clean = folderName
    .replace(/^\d+-/, '')           // Remove number prefix
    .replace(/^Projet-/i, '')       // Remove "Projet-"
    .replace(/^General-/i, '')      // Remove "General-"
    .replace(/-/g, ' ')             // Dashes to spaces
    .trim();
  
  // Capitalize each word
  return clean
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}


// ══════════════════════════════════════════════
// PHASE 1: COPY IMAGES
// ══════════════════════════════════════════════

function copyImages(sourceDir, projectRoot, dryRun = false) {
  const uploadsBase = path.join(projectRoot, 'public', 'uploads', 'projects');
  const results = { categories: {}, totalCopied: 0 };
  
  console.log('\n📸 PHASE 1: Copying images to public/uploads/projects/');
  console.log('=' .repeat(55));
  
  const catFolders = fs.readdirSync(sourceDir)
    .filter(f => {
      const fp = path.join(sourceDir, f);
      return fs.statSync(fp).isDirectory() && !f.startsWith('_') && !f.startsWith('.');
    })
    .sort();
  
  for (const catName of catFolders) {
    if (SKIP_CATEGORIES.has(catName)) {
      console.log(`  ⏭️  Skipping ${catName}`);
      continue;
    }
    
    const catPath = path.join(sourceDir, catName);
    const catSlug = slugify(catName);
    const catProjects = [];
    
    const projFolders = fs.readdirSync(catPath)
      .filter(f => {
        const fp = path.join(catPath, f);
        return fs.statSync(fp).isDirectory() && !f.startsWith('.');
      })
      .sort();
    
    console.log(`\n  📂 ${catName} (${projFolders.length} projects)`);
    
    for (const projFolder of projFolders) {
      const projPath = path.join(catPath, projFolder);
      const projSlug = slugify(projFolder);
      const destBase = path.join(uploadsBase, catSlug, projSlug);
      
      // Get all images in project folder
      const allImages = getImages(projPath);
      
      // Get slide images (_POUR_SLIDES subfolder)
      const slidePath = path.join(projPath, '_POUR_SLIDES');
      const slideImages = getImages(slidePath);
      const slideSet = new Set(slideImages.map(f => f.toLowerCase()));
      
      // Non-slide images
      const nonSlideImages = allImages.filter(f => !slideSet.has(f.toLowerCase()));
      
      if (allImages.length === 0) continue;
      
      // Determine AFTER images (slide-worthy = finished/beautiful)
      // Determine BEFORE images (non-slide = work in progress)
      const afterImagePaths = [];
      const beforeImagePaths = [];
      let coverImagePath = null;
      
      // Copy slide images as "after" (finished result)
      for (const img of slideImages) {
        const src = path.join(slidePath, img);
        const destFile = `apres-${img}`;
        const dest = path.join(destBase, destFile);
        const webPath = `/uploads/projects/${catSlug}/${projSlug}/${destFile}`;
        
        if (!dryRun) copyFile(src, dest);
        afterImagePaths.push(webPath);
        results.totalCopied++;
        
        if (!coverImagePath) coverImagePath = webPath;
      }
      
      // Copy non-slide images as "before" (work in progress)
      for (const img of nonSlideImages) {
        const src = path.join(projPath, img);
        const destFile = slideImages.length > 0 ? `avant-${img}` : img;
        const dest = path.join(destBase, destFile);
        const webPath = `/uploads/projects/${catSlug}/${projSlug}/${destFile}`;
        
        if (!dryRun) copyFile(src, dest);
        
        if (slideImages.length > 0) {
          beforeImagePaths.push(webPath);
        } else {
          // No slides = all images go to afterImages
          afterImagePaths.push(webPath);
          if (!coverImagePath) coverImagePath = webPath;
        }
        results.totalCopied++;
      }
      
      // If no slides, first image is cover
      if (!coverImagePath && afterImagePaths.length > 0) {
        coverImagePath = afterImagePaths[0];
      }
      
      const projData = {
        folderName: projFolder,
        slug: projSlug,
        categorySlug: catSlug,
        title: makeTitleFromFolder(projFolder),
        coverImage: coverImagePath,
        beforeImages: beforeImagePaths,
        afterImages: afterImagePaths,
        totalImages: allImages.length + slideImages.length,
      };
      
      catProjects.push(projData);
      
      const slideIcon = slideImages.length > 0 ? ` ⭐${slideImages.length}` : '';
      console.log(`     ✅ ${projFolder} (${allImages.length} imgs${slideIcon}) → ${catSlug}/${projSlug}/`);
    }
    
    results.categories[catName] = {
      slug: catSlug,
      projects: catProjects,
    };
  }
  
  console.log(`\n  📊 Total images copied: ${results.totalCopied}`);
  return results;
}


// ══════════════════════════════════════════════
// PHASE 2: SEED DATABASE
// ══════════════════════════════════════════════

function generateSeedScript(imageResults, outputPath) {
  console.log('\n📝 PHASE 2: Generating database seed script');
  console.log('='.repeat(55));
  
  // Build categories data
  const categoriesData = [];
  let catOrder = 0;
  
  for (const [catName, catData] of Object.entries(imageResults.categories)) {
    catOrder++;
    const cfg = CATEGORY_CONFIG[catName] || {
      icon: '🪵',
      nameFr: catName,
      nameEn: catName,
      nameEs: catName,
      nameAr: catName,
    };
    
    categoriesData.push({
      slug: catData.slug,
      nameFr: cfg.nameFr,
      nameEn: cfg.nameEn,
      nameEs: cfg.nameEs,
      nameAr: cfg.nameAr,
      icon: cfg.icon,
      order: catOrder,
      isActive: true,
    });
  }
  
  // Build projects data
  const projectsData = [];
  let projOrder = 0;
  
  for (const [catName, catData] of Object.entries(imageResults.categories)) {
    for (const proj of catData.projects) {
      projOrder++;
      
      // Generate basic titles from folder name
      const titleBase = proj.title;
      
      projectsData.push({
        slug: proj.slug,
        categorySlug: proj.categorySlug,
        
        titleFr: titleBase,
        titleEn: titleBase,
        titleEs: titleBase,
        titleAr: titleBase,
        
        // Placeholder descriptions - update later via admin or content generator
        descriptionFr: `Projet de ${CATEGORY_CONFIG[catName]?.nameFr || catName} réalisé par Le Tatche Bois.`,
        descriptionEn: `${CATEGORY_CONFIG[catName]?.nameEn || catName} project by Le Tatche Bois.`,
        descriptionEs: `Proyecto de ${CATEGORY_CONFIG[catName]?.nameEs || catName} por Le Tatche Bois.`,
        descriptionAr: `مشروع ${CATEGORY_CONFIG[catName]?.nameAr || catName} من لو تاتش بوا.`,
        
        beforeDescFr: 'Travaux en cours - Conception et réalisation sur mesure.',
        beforeDescEn: 'Work in progress - Custom design and fabrication.',
        beforeDescEs: 'Trabajo en curso - Diseño y fabricación a medida.',
        beforeDescAr: 'أعمال جارية - تصميم وتصنيع حسب الطلب.',
        beforeImages: proj.beforeImages,
        
        afterDescFr: 'Résultat final - Artisanat de qualité et finitions soignées.',
        afterDescEn: 'Final result - Quality craftsmanship and careful finishes.',
        afterDescEs: 'Resultado final - Artesanía de calidad y acabados cuidados.',
        afterDescAr: 'النتيجة النهائية - حرفية عالية الجودة وتشطيبات دقيقة.',
        afterImages: proj.afterImages,
        
        coverImage: proj.coverImage,
        images: [],
        
        location: 'Tangier',
        order: projOrder,
        isActive: true,
        isFeatured: proj.afterImages.length >= 3,
      });
    }
  }
  
  // Build services data
  const servicesData = [];
  let svcOrder = 0;
  
  for (const [catName, catData] of Object.entries(imageResults.categories)) {
    svcOrder++;
    const cfg = CATEGORY_CONFIG[catName] || {};
    
    // Use first project's cover image as service image
    const firstProject = catData.projects[0];
    const serviceImage = firstProject?.coverImage || null;
    
    servicesData.push({
      slug: catData.slug,
      titleFr: cfg.nameFr || catName,
      titleEn: cfg.nameEn || catName,
      titleEs: cfg.nameEs || catName,
      titleAr: cfg.nameAr || catName,
      shortDescFr: `Service ${cfg.nameFr || catName} sur mesure par Le Tatche Bois`,
      shortDescEn: `Custom ${cfg.nameEn || catName} service by Le Tatche Bois`,
      descriptionFr: `Le Tatche Bois vous propose un service de ${(cfg.nameFr || catName).toLowerCase()} sur mesure. Notre atelier artisanal à Tanger réalise vos projets avec des matériaux nobles et un savoir-faire traditionnel marocain. Chaque pièce est unique, conçue selon vos besoins et vos envies.`,
      descriptionEn: `Le Tatche Bois offers a custom ${(cfg.nameEn || catName).toLowerCase()} service. Our artisan workshop in Tangier creates your projects with noble materials and traditional Moroccan craftsmanship. Each piece is unique, designed according to your needs and desires.`,
      descriptionEs: `Le Tatche Bois le ofrece un servicio de ${(cfg.nameEs || catName).toLowerCase()} a medida. Nuestro taller artesanal en Tánger realiza sus proyectos con materiales nobles y artesanía tradicional marroquí. Cada pieza es única, diseñada según sus necesidades y deseos.`,
      descriptionAr: `يقدم لو تاتش بوا خدمة ${cfg.nameAr || catName} حسب الطلب. ورشتنا الحرفية في طنجة تنجز مشاريعكم بمواد نبيلة وحرفية مغربية تقليدية. كل قطعة فريدة، مصممة حسب احتياجاتكم ورغباتكم.`,
      icon: cfg.icon || '🪵',
      image: serviceImage,
      order: svcOrder,
      isActive: true,
      isFeatured: svcOrder <= 6,
    });
  }
  
  // Generate the seed script
  const seedScript = `
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🪵 TATCH BOIS - Database Seed');
  console.log('='.repeat(50));
  
  // ═══════════════════════════════════════════
  // 1. CREATE CATEGORIES
  // ═══════════════════════════════════════════
  console.log('\\n📂 Creating categories...');
  
  const categories = ${JSON.stringify(categoriesData, null, 2)};
  
  const categoryMap = {};
  
  for (const cat of categories) {
    const result = await prisma.portfolioCategory.upsert({
      where: { slug: cat.slug },
      update: {
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        nameEs: cat.nameEs,
        nameAr: cat.nameAr,
        icon: cat.icon,
        order: cat.order,
        isActive: cat.isActive,
      },
      create: cat,
    });
    categoryMap[cat.slug] = result.id;
    console.log('  ✅ ' + cat.nameFr + ' (' + cat.slug + ')');
  }
  
  // ═══════════════════════════════════════════
  // 2. CREATE PROJECTS
  // ═══════════════════════════════════════════
  console.log('\\n🏗️  Creating projects...');
  
  const projects = ${JSON.stringify(projectsData, null, 2)};
  
  let projCount = 0;
  for (const proj of projects) {
    const categoryId = categoryMap[proj.categorySlug];
    if (!categoryId) {
      console.log('  ⚠️  Skip ' + proj.slug + ' - no category ' + proj.categorySlug);
      continue;
    }
    
    // Remove categorySlug, add categoryId
    const { categorySlug, ...projectData } = proj;
    
    try {
      await prisma.portfolioProject.upsert({
        where: { slug: proj.slug },
        update: {
          ...projectData,
          categoryId,
        },
        create: {
          ...projectData,
          categoryId,
        },
      });
      projCount++;
      
      const imgCount = (proj.beforeImages?.length || 0) + (proj.afterImages?.length || 0);
      console.log('  ✅ ' + proj.titleFr + ' (' + imgCount + ' images)');
    } catch (err) {
      console.log('  ❌ ' + proj.slug + ': ' + err.message);
    }
  }
  
  // ═══════════════════════════════════════════
  // 3. CREATE SERVICES
  // ═══════════════════════════════════════════
  console.log('\\n📋 Creating services...');
  
  const services = ${JSON.stringify(servicesData, null, 2)};
  
  for (const svc of services) {
    try {
      await prisma.siteService.upsert({
        where: { slug: svc.slug },
        update: svc,
        create: svc,
      });
      console.log('  ✅ ' + svc.titleFr);
    } catch (err) {
      console.log('  ❌ ' + svc.slug + ': ' + err.message);
    }
  }
  
  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  const totalCats = await prisma.portfolioCategory.count();
  const totalProjs = await prisma.portfolioProject.count();
  const totalSvcs = await prisma.siteService.count();
  
  console.log('\\n' + '='.repeat(50));
  console.log('🎉 SEED COMPLETE!');
  console.log('  📂 Categories: ' + totalCats);
  console.log('  🏗️  Projects:   ' + totalProjs);
  console.log('  📋 Services:   ' + totalSvcs);
  console.log('\\n💡 Open http://localhost:3000/admin to see your portfolio!');
  console.log('💡 Descriptions are basic placeholders - update them via admin panel');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
`;
  
  // Write seed script
  fs.writeFileSync(outputPath, seedScript.trim());
  console.log(`  💾 Seed script: ${outputPath}`);
  console.log(`  📂 Categories: ${categoriesData.length}`);
  console.log(`  🏗️  Projects:   ${projectsData.length}`);
  console.log(`  📋 Services:   ${servicesData.length}`);
  
  // Also save as JSON for reference
  const jsonPath = outputPath.replace('.js', '-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    categories: categoriesData,
    projects: projectsData,
    services: servicesData,
  }, null, 2));
  console.log(`  📄 Data JSON:  ${jsonPath}`);
  
  return { categoriesData, projectsData, servicesData };
}


// ══════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════

function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  🪵  TATCH BOIS - Portfolio Import                    ║
║  Copy images + Seed database                          ║
╚══════════════════════════════════════════════════════╝
  `);
  
  // Parse args
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) {
      flags.source = args[++i];
    } else if (args[i] === '--images-only') {
      flags.imagesOnly = true;
    } else if (args[i] === '--db-only') {
      flags.dbOnly = true;
    } else if (args[i] === '--dry-run') {
      flags.dryRun = true;
    }
  }
  
  const sourceDir = flags.source || DEFAULT_SOURCE;
  
  // Check source exists
  if (!fs.existsSync(sourceDir)) {
    // Try alternate paths
    const alternatives = [
      sourceDir.replace('_CLEAN', '_FINAL'),
      sourceDir.replace('_CLEAN', ''),
      '/Users/abdelaliaitouahman/Desktop/TATCH BOIS ZAKI PHOTO_CLASSIFIED_FINAL',
      '/Users/abdelaliaitouahman/Desktop/TATCH BOIS ZAKI PHOTO_CLASSIFIED',
    ];
    
    let found = false;
    for (const alt of alternatives) {
      if (fs.existsSync(alt)) {
        console.log(`📁 Source: ${alt}`);
        return run(alt, flags);
      }
    }
    
    console.log(`❌ Source not found: ${sourceDir}`);
    console.log('   Try: node scripts/import-portfolio.js --source "/path/to/CLASSIFIED"');
    process.exit(1);
  }
  
  console.log(`📁 Source:  ${sourceDir}`);
  run(sourceDir, flags);
}

function run(sourceDir, flags) {
  console.log(`📂 Project: ${PROJECT_ROOT}`);
  console.log(`🔄 Mode:    ${flags.dryRun ? 'DRY RUN' : 'LIVE'}`);
  
  if (flags.imagesOnly) console.log('⚡ Images only (skip DB)');
  if (flags.dbOnly) console.log('⚡ DB only (skip images)');
  
  // PHASE 1: Copy images
  let imageResults;
  if (!flags.dbOnly) {
    imageResults = copyImages(sourceDir, PROJECT_ROOT, flags.dryRun);
  }
  
  // PHASE 2: Generate seed script
  if (!flags.imagesOnly && imageResults) {
    const seedPath = path.join(PROJECT_ROOT, 'scripts', 'seed-portfolio.js');
    
    // Make sure scripts dir exists
    const scriptsDir = path.join(PROJECT_ROOT, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    generateSeedScript(imageResults, seedPath);
    
    if (!flags.dryRun) {
      console.log(`
╔══════════════════════════════════════════════════════╗
║  ✅ PHASE 1 COMPLETE - Images copied!                 ║
╠══════════════════════════════════════════════════════╣
║  Now run Phase 2 to seed the database:                ║
║                                                       ║
║  node scripts/seed-portfolio.js                       ║
║                                                       ║
║  Then start your dev server:                          ║
║  npm run dev                                          ║
║                                                       ║
║  Open: http://localhost:3000/admin                    ║
╚══════════════════════════════════════════════════════╝
      `);
    }
  }
}

main();
