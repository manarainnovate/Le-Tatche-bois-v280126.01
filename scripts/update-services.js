#!/usr/bin/env node
/**
 * 🪵 TATCH BOIS - Update Services with Rich Content
 * ===================================================
 * Updates all SiteService records with professional descriptions
 * and links to best portfolio images.
 * 
 * Usage:
 *   node scripts/update-services.js
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ══════════════════════════════════════════════
// RICH SERVICE CONTENT - 4 LANGUAGES
// ══════════════════════════════════════════════

const SERVICES_CONTENT = {
  'portes': {
    titleFr: 'Portes sur Mesure',
    titleEn: 'Custom Doors',
    titleEs: 'Puertas a Medida',
    titleAr: 'أبواب حسب الطلب',

    shortDescFr: "Portes d'entrée, intérieures et traditionnelles marocaines en bois massif",
    shortDescEn: 'Entry doors, interior doors and traditional Moroccan wooden doors',
    shortDescEs: 'Puertas de entrada, interiores y tradicionales marroquíes en madera maciza',
    shortDescAr: 'أبواب مدخل وداخلية وتقليدية مغربية من الخشب الصلب',

    descriptionFr: `## L'Art de la Porte en Bois

Chez Le Tatche Bois, chaque porte est une pièce unique, sculptée avec passion dans notre atelier de Tanger. Du cèdre noble au noyer précieux, nous sélectionnons les essences les plus fines pour créer des portes qui marquent les esprits.

### Nos Spécialités

**Portes d'entrée monumentales** — Première impression de votre maison, nos portes d'entrée allient robustesse et élégance. Arches traditionnelles, motifs géométriques islamiques, ou lignes contemporaines épurées.

**Portes intérieures** — Panneaux en chêne massif, portes coulissantes en noyer, ou portes sculptées en cèdre. Chaque porte intérieure est conçue pour s'harmoniser avec votre espace.

**Portes de style Mashrabiya** — Notre signature : des portes ajourées inspirées du moucharabieh traditionnel, laissant filtrer la lumière tout en préservant l'intimité.

**Portes de placard** — Portes coulissantes, battantes ou pliantes, avec finitions cannelées, rainurées ou lisses selon vos préférences.

### Matériaux & Finitions

Nous travaillons le **cèdre de l'Atlas**, le **noyer**, le **chêne**, le **wengé** et l'**acajou**. Chaque bois est séché naturellement puis traité pour résister au climat méditerranéen. Nos finitions incluent le vernis mat, satiné ou brillant, la teinture, la laque et la patine vieillie.

### Processus de Fabrication

1. **Consultation** — Visite sur site et prise de mesures
2. **Design** — Proposition de croquis et choix des matériaux
3. **Fabrication** — 2 à 4 semaines en atelier
4. **Installation** — Pose par notre équipe avec garantie

Chaque porte est livrée avec sa quincaillerie (poignées, serrures, charnières) et installée par nos artisans.`,

    descriptionEn: `## The Art of Wooden Doors

At Le Tatche Bois, every door is a unique piece, passionately crafted in our Tangier workshop. From noble cedar to precious walnut, we select the finest woods to create doors that leave lasting impressions.

### Our Specialties

**Monumental entry doors** — The first impression of your home, our entry doors combine strength and elegance. Traditional arches, Islamic geometric patterns, or clean contemporary lines.

**Interior doors** — Solid oak panels, walnut sliding doors, or carved cedar doors. Each interior door is designed to harmonize with your space.

**Mashrabiya-style doors** — Our signature: openwork doors inspired by traditional moucharabieh, filtering light while preserving privacy.

**Wardrobe doors** — Sliding, hinged or folding doors with fluted, grooved or smooth finishes to your preference.

### Materials & Finishes

We work with **Atlas cedar**, **walnut**, **oak**, **wenge** and **mahogany**. Each wood is naturally dried then treated to withstand the Mediterranean climate. Our finishes include matte, satin or gloss varnish, staining, lacquer and aged patina.

### Manufacturing Process

1. **Consultation** — On-site visit and measurements
2. **Design** — Sketch proposals and material selection
3. **Fabrication** — 2 to 4 weeks in workshop
4. **Installation** — Fitting by our team with warranty

Every door is delivered with its hardware (handles, locks, hinges) and installed by our craftsmen.`,

    descriptionEs: `## El Arte de la Puerta de Madera

En Le Tatche Bois, cada puerta es una pieza única, esculpida con pasión en nuestro taller de Tánger. Del cedro noble a la nogal preciosa, seleccionamos las maderas más finas para crear puertas que dejan huella.

### Nuestras Especialidades

**Puertas de entrada monumentales** — Primera impresión de su hogar, nuestras puertas de entrada combinan robustez y elegancia. Arcos tradicionales, motivos geométricos islámicos o líneas contemporáneas depuradas.

**Puertas interiores** — Paneles de roble macizo, puertas correderas de nogal o puertas talladas de cedro. Cada puerta interior está diseñada para armonizar con su espacio.

**Puertas estilo Mashrabiya** — Nuestra firma: puertas caladas inspiradas en el moucharabieh tradicional, filtrando la luz mientras preservan la intimidad.

**Puertas de armario** — Correderas, batientes o plegables, con acabados acanalados, ranurados o lisos según sus preferencias.

### Materiales y Acabados

Trabajamos con **cedro del Atlas**, **nogal**, **roble**, **wengué** y **caoba**. Cada madera se seca naturalmente y se trata para resistir el clima mediterráneo.

### Proceso de Fabricación

1. **Consulta** — Visita in situ y toma de medidas
2. **Diseño** — Propuesta de bocetos y selección de materiales
3. **Fabricación** — 2 a 4 semanas en taller
4. **Instalación** — Montaje por nuestro equipo con garantía`,

    descriptionAr: `## فن الأبواب الخشبية

في لو تاتش بوا، كل باب هو قطعة فريدة، منحوتة بشغف في ورشتنا بطنجة. من خشب الأرز النبيل إلى الجوز الثمين، نختار أجود أنواع الأخشاب لصنع أبواب تترك انطباعاً دائماً.

### تخصصاتنا

**أبواب مدخل ضخمة** — الانطباع الأول لمنزلك، أبوابنا تجمع بين المتانة والأناقة. أقواس تقليدية، زخارف هندسية إسلامية، أو خطوط معاصرة نقية.

**أبواب داخلية** — ألواح بلوط صلب، أبواب منزلقة من الجوز، أو أبواب منحوتة من الأرز.

**أبواب على طراز المشربية** — توقيعنا: أبواب مخرمة مستوحاة من المشربية التقليدية.

### المواد والتشطيبات

نعمل مع **أرز الأطلس**، **الجوز**، **البلوط**، **الونغي** و**الماهوغاني**. يتم تجفيف كل خشب طبيعياً ثم معالجته لمقاومة المناخ المتوسطي.

### عملية التصنيع

1. **استشارة** — زيارة الموقع وأخذ القياسات
2. **تصميم** — اقتراح الرسومات واختيار المواد
3. **تصنيع** — من 2 إلى 4 أسابيع في الورشة
4. **تركيب** — تركيب من قبل فريقنا مع ضمان`,

    icon: '🚪',
  },

  'cuisines': {
    titleFr: 'Cuisines sur Mesure',
    titleEn: 'Custom Kitchens',
    titleEs: 'Cocinas a Medida',
    titleAr: 'مطابخ حسب الطلب',

    shortDescFr: 'Cuisines en bois massif, modernes et traditionnelles, avec plans de travail sur mesure',
    shortDescEn: 'Solid wood kitchens, modern and traditional, with custom countertops',
    shortDescEs: 'Cocinas de madera maciza, modernas y tradicionales, con encimeras a medida',
    shortDescAr: 'مطابخ من الخشب الصلب، حديثة وتقليدية، مع أسطح عمل حسب الطلب',

    descriptionFr: `## Cuisines Artisanales en Bois Massif

Votre cuisine est le cœur de votre maison. Chez Le Tatche Bois, nous concevons des cuisines sur mesure qui allient fonctionnalité, esthétique et durabilité.

### Nos Styles

**Cuisine moderne** — Lignes épurées, façades lisses en chêne clair ou laquées, avec poignées intégrées et éclairage LED. Plans de travail en bois massif ou combinés avec du marbre.

**Cuisine classique** — Moulures traditionnelles, façades à cadre en noyer ou merisier, avec quincaillerie en laiton. L'élégance intemporelle du bois noble.

**Cuisine modulaire** — Éléments standards personnalisables : colonnes, îlots centraux, plans de travail ajustables. La flexibilité d'une cuisine qui évolue avec vos besoins.

### Ce Que Nous Réalisons

- Meubles hauts et bas sur mesure
- Îlots centraux avec rangements intégrés
- Plans de travail en bois massif (chêne, noyer, hêtre)
- Habillage de hottes et colonnes
- Étagères ouvertes et vitrines
- Encadrements et moulures décoratives

### Matériaux

Bois massif certifié, quincaillerie européenne haut de gamme (charnières à fermeture douce, coulisses pleine extension). Finitions au vernis alimentaire pour les surfaces en contact avec la nourriture.

### Notre Engagement

Chaque cuisine est livrée et installée par notre équipe. Nous assurons l'ajustement parfait de chaque élément et la coordination avec vos plombier et électricien.`,

    descriptionEn: `## Artisan Solid Wood Kitchens

Your kitchen is the heart of your home. At Le Tatche Bois, we design custom kitchens that combine functionality, aesthetics and durability.

### Our Styles

**Modern kitchen** — Clean lines, smooth oak or lacquered facades with integrated handles and LED lighting. Solid wood or marble-combined countertops.

**Classic kitchen** — Traditional moldings, framed walnut or cherry facades with brass hardware. The timeless elegance of noble wood.

**Modular kitchen** — Customizable standard elements: columns, central islands, adjustable countertops. Flexibility that evolves with your needs.

### What We Create

- Custom upper and lower cabinets
- Central islands with integrated storage
- Solid wood countertops (oak, walnut, beech)
- Hood and column cladding
- Open shelves and display cabinets
- Decorative frames and moldings

### Our Commitment

Every kitchen is delivered and installed by our team. We ensure perfect fitting of every element and coordinate with your plumber and electrician.`,

    descriptionEs: `## Cocinas Artesanales de Madera Maciza

Su cocina es el corazón de su hogar. En Le Tatche Bois, diseñamos cocinas a medida que combinan funcionalidad, estética y durabilidad.

### Nuestros Estilos

**Cocina moderna** — Líneas depuradas, frentes lisos de roble claro o lacados, con tiradores integrados e iluminación LED.

**Cocina clásica** — Molduras tradicionales, frentes enmarcados de nogal o cerezo, con herrajes de latón.

**Cocina modular** — Elementos estándar personalizables: columnas, islas centrales, encimeras ajustables.

### Lo Que Realizamos

- Muebles altos y bajos a medida
- Islas centrales con almacenamiento integrado
- Encimeras de madera maciza
- Revestimiento de campanas y columnas
- Estanterías abiertas y vitrinas`,

    descriptionAr: `## مطابخ حرفية من الخشب الصلب

مطبخك هو قلب منزلك. في لو تاتش بوا، نصمم مطابخ حسب الطلب تجمع بين الوظائفية والجمالية والمتانة.

### أساليبنا

**مطبخ عصري** — خطوط نقية، واجهات ملساء من البلوط الفاتح أو المطلية، مع مقابض مدمجة وإضاءة LED.

**مطبخ كلاسيكي** — قوالب تقليدية، واجهات مؤطرة من الجوز أو الكرز، مع تجهيزات نحاسية.

### ما نصنعه

- خزائن علوية وسفلية حسب الطلب
- جزر مركزية مع تخزين مدمج
- أسطح عمل من الخشب الصلب`,

    icon: '🍽️',
  },

  'escaliers': {
    titleFr: 'Escaliers en Bois',
    titleEn: 'Wooden Staircases',
    titleEs: 'Escaleras de Madera',
    titleAr: 'سلالم خشبية',

    shortDescFr: 'Escaliers droits, courbes et hélicoïdaux en bois massif avec rampes sculptées',
    shortDescEn: 'Straight, curved and spiral solid wood staircases with carved railings',
    shortDescEs: 'Escaleras rectas, curvas y helicoidales de madera maciza con barandillas talladas',
    shortDescAr: 'سلالم مستقيمة ومنحنية وحلزونية من الخشب الصلب مع درابزين منحوت',

    descriptionFr: `## Escaliers sur Mesure — L'Élégance en Hauteur

Un escalier n'est pas qu'un moyen de monter : c'est une sculpture fonctionnelle, un élément central de votre architecture intérieure. Notre atelier conçoit des escaliers qui deviennent la pièce maîtresse de votre espace.

### Types d'Escaliers

**Escalier droit** — Classique et épuré, idéal pour les espaces linéaires. Marches massives en chêne ou noyer avec contremarches assorties.

**Escalier courbe** — La fluidité du bois cintré, un savoir-faire rare. Nos escaliers courbes sont des œuvres d'art qui suivent les contours de votre espace.

**Escalier hélicoïdal** — Gain de place maximal avec un impact visuel fort. Structure en bois massif avec main courante sculptée.

**Escalier extérieur** — Traitement spécial pour résister aux intempéries. Bois exotique ou traité autoclave, avec antidérapant intégré.

### Éléments Sur Mesure

- **Marches** : massives, avec nez de marche arrondi ou droit
- **Rampes** : tournées, sculptées, ou contemporaines en câble inox et bois
- **Balustres** : classiques, fuselés, ou design contemporain
- **Main courante** : ergonomique, profilée selon votre choix

### Sécurité & Normes

Tous nos escaliers respectent les normes de sécurité en vigueur : hauteur de garde-corps, écartement des balustres, pente et giron conformes.`,

    descriptionEn: `## Custom Staircases — Elegance in Height

A staircase is more than a way up: it's a functional sculpture, a central element of your interior architecture.

### Types of Staircases

**Straight staircase** — Classic and refined, ideal for linear spaces. Solid oak or walnut treads with matching risers.

**Curved staircase** — The fluidity of bent wood, a rare expertise. Our curved staircases are works of art that follow the contours of your space.

**Spiral staircase** — Maximum space saving with strong visual impact. Solid wood structure with sculpted handrail.

**Outdoor staircase** — Special treatment to withstand the elements. Exotic or pressure-treated wood with integrated anti-slip.

### Custom Elements

- **Treads**: solid, with rounded or straight nosing
- **Railings**: turned, carved, or contemporary cable and wood
- **Balusters**: classic, tapered, or contemporary design
- **Handrail**: ergonomic, profiled to your choice`,

    descriptionEs: `## Escaleras a Medida — Elegancia en Altura

Una escalera no es solo un medio para subir: es una escultura funcional, un elemento central de su arquitectura interior.

### Tipos de Escaleras

**Escalera recta** — Clásica y depurada, ideal para espacios lineales.
**Escalera curva** — La fluidez de la madera curvada, un saber hacer excepcional.
**Escalera helicoidal** — Máximo ahorro de espacio con fuerte impacto visual.
**Escalera exterior** — Tratamiento especial para resistir la intemperie.`,

    descriptionAr: `## سلالم حسب الطلب — أناقة في الارتفاع

السلم ليس مجرد وسيلة للصعود: إنه منحوتة وظيفية، عنصر مركزي في هندستك الداخلية.

### أنواع السلالم

**سلم مستقيم** — كلاسيكي ونقي، مثالي للمساحات الخطية.
**سلم منحني** — انسيابية الخشب المقوس، مهارة نادرة.
**سلم حلزوني** — توفير أقصى للمساحة مع تأثير بصري قوي.
**سلم خارجي** — معالجة خاصة لمقاومة العوامل الجوية.`,

    icon: '🪜',
  },

  'placards-dressings': {
    titleFr: 'Placards & Dressings',
    titleEn: 'Wardrobes & Walk-in Closets',
    titleEs: 'Armarios y Vestidores',
    titleAr: 'خزائن وغرف ملابس',

    shortDescFr: 'Dressings, placards muraux et armoires sur mesure avec aménagement intérieur complet',
    shortDescEn: 'Walk-in closets, built-in wardrobes and custom cabinets with full interior layout',
    shortDescEs: 'Vestidores, armarios empotrados y armarios a medida con distribución interior completa',
    shortDescAr: 'غرف ملابس وخزائن حائطية وخزائن حسب الطلب مع تنظيم داخلي كامل',

    descriptionFr: `## Rangement Sur Mesure — Chaque Centimètre Compte

Nos placards et dressings sont conçus pour optimiser chaque centimètre de votre espace. Du petit placard d'entrée au grand dressing de suite parentale, nous créons des solutions de rangement élégantes et pratiques.

### Nos Réalisations

**Dressing complet** — Penderies, tiroirs, étagères, miroirs intégrés. Organisation pensée pour votre garde-robe avec éclairage LED intérieur.

**Placard mural** — Portes coulissantes ou battantes, en bois massif ou panneaux. Intérieur modulable avec accessoires (porte-cravates, tiroirs à bijoux, range-chaussures).

**Armoire sur mesure** — Meuble indépendant en bois massif, avec ou sans miroir. Idéal pour les chambres sans niche murale.

### Systèmes de Portes

- **Portes coulissantes** : gain de place, rails silencieux
- **Portes battantes** : accès total, charnières à fermeture douce
- **Portes pliantes** : compromis entre les deux
- **Sans portes** : dressing ouvert style loft

### Aménagement Intérieur

Nous concevons l'intérieur sur mesure : zones de penderie haute et basse, tiroirs avec séparateurs, étagères ajustables, compartiments à chaussures, et espace coffre-fort intégré sur demande.`,

    descriptionEn: `## Custom Storage — Every Centimeter Counts

Our wardrobes and closets are designed to optimize every centimeter of your space.

### Our Creations

**Full walk-in closet** — Hanging rods, drawers, shelves, integrated mirrors. Organization designed for your wardrobe with interior LED lighting.

**Built-in wardrobe** — Sliding or hinged doors, in solid wood or panels. Modular interior with accessories.

**Freestanding wardrobe** — Independent solid wood furniture, with or without mirror.

### Door Systems

- **Sliding doors**: space-saving, silent rails
- **Hinged doors**: full access, soft-close hinges
- **Folding doors**: compromise between both
- **Open**: loft-style open dressing`,

    descriptionEs: `## Almacenamiento a Medida — Cada Centímetro Cuenta

Nuestros armarios y vestidores están diseñados para optimizar cada centímetro de su espacio.

### Nuestras Realizaciones

**Vestidor completo** — Barras, cajones, estantes, espejos integrados.
**Armario empotrado** — Puertas correderas o batientes, en madera maciza o paneles.
**Armario independiente** — Mueble de madera maciza, con o sin espejo.`,

    descriptionAr: `## تخزين حسب الطلب — كل سنتيمتر مهم

خزائننا وغرف الملابس مصممة لتحسين كل سنتيمتر من مساحتك.

### إبداعاتنا

**غرفة ملابس كاملة** — قضبان تعليق، أدراج، رفوف، مرايا مدمجة.
**خزانة حائطية** — أبواب منزلقة أو مفصلية، من الخشب الصلب أو الألواح.
**خزانة مستقلة** — أثاث مستقل من الخشب الصلب.`,

    icon: '🗄️',
  },

  'plafonds-murs': {
    titleFr: 'Habillage Murs & Plafonds',
    titleEn: 'Wall & Ceiling Cladding',
    titleEs: 'Revestimiento de Paredes y Techos',
    titleAr: 'تغطية الجدران والأسقف',

    shortDescFr: 'Plafonds sculptés traditionnels, lambris, claustra et habillage mural en bois',
    shortDescEn: 'Traditional carved ceilings, paneling, claustra and wooden wall cladding',
    shortDescEs: 'Techos tallados tradicionales, paneles, claustra y revestimiento mural de madera',
    shortDescAr: 'أسقف منحوتة تقليدية، ألواح، كلوسترا وتغطية جدارية بالخشب',

    descriptionFr: `## Plafonds & Murs — L'Art du Bois en Relief

Le plafond et les murs sont la toile de fond de votre intérieur. Nos artisans maîtrisent l'art ancestral de la sculpture sur bois pour créer des plafonds et habillages muraux qui transforment vos espaces.

### Plafonds Sculptés

**Plafond à caissons** — Motifs géométriques en relief, classiques ou contemporains. Bois de cèdre ou chêne avec finitions dorées, naturelles ou peintes.

**Plafond traditionnel marocain** — Zellige en bois, motifs étoilés, rosaces et entrelacs. Un savoir-faire ancestral transmis par nos maîtres artisans.

**Plafond décoratif LED** — Alliance du bois sculpté et de l'éclairage moderne. Rétro-éclairage intégré dans les motifs pour une ambiance chaleureuse.

### Habillage Mural

**Lambris** — Lambris bois massif, vertical ou horizontal, moderne ou classique.

**Claustra** — Cloisons ajourées en bois sculpté. Séparation d'espaces avec jeu de lumière.

**Panneaux décoratifs** — Motifs géométriques, calligraphie arabe, ou designs contemporains. Pièces d'accent pour salons, entrées et salles de réception.

### Applications

Salons marocains, halls d'hôtels, mosquées, restaurants, villas de luxe, et espaces commerciaux.`,

    descriptionEn: `## Ceilings & Walls — The Art of Wood in Relief

Ceilings and walls are the backdrop of your interior. Our craftsmen master the ancestral art of wood carving to create ceilings and wall cladding that transform your spaces.

### Carved Ceilings

**Coffered ceiling** — Geometric relief patterns, classic or contemporary. Cedar or oak wood with gilded, natural or painted finishes.

**Traditional Moroccan ceiling** — Wood zellige, star patterns, rosettes and interlacing. Ancestral craftsmanship passed down by our master artisans.

**Decorative LED ceiling** — Alliance of carved wood and modern lighting.

### Wall Cladding

**Paneling** — Solid wood paneling, vertical or horizontal.
**Claustra** — Openwork partitions in carved wood.
**Decorative panels** — Geometric patterns, Arabic calligraphy, or contemporary designs.`,

    descriptionEs: `## Techos y Paredes — El Arte de la Madera en Relieve

Los techos y paredes son el telón de fondo de su interior.

### Techos Tallados

**Techo con casetones** — Motivos geométricos en relieve.
**Techo tradicional marroquí** — Zellige en madera, motivos estrellados.
**Techo decorativo LED** — Alianza de madera tallada e iluminación moderna.`,

    descriptionAr: `## أسقف وجدران — فن الخشب البارز

الأسقف والجدران هي خلفية ديكورك الداخلي. حرفيونا يتقنون فن النحت على الخشب الموروث لصنع أسقف وتغطيات جدارية تحول مساحاتك.

### أسقف منحوتة

**سقف بالكاسيتات** — زخارف هندسية بارزة.
**سقف تقليدي مغربي** — زليج خشبي، نجوم ووريدات.
**سقف ديكوري LED** — تحالف الخشب المنحوت والإضاءة الحديثة.`,

    icon: '🏠',
  },

  'salons': {
    titleFr: 'Mobilier de Salon',
    titleEn: 'Living Room Furniture',
    titleEs: 'Mobiliario de Salón',
    titleAr: 'أثاث غرفة المعيشة',

    shortDescFr: 'Salons marocains traditionnels, meubles TV, bibliothèques et mobilier contemporain',
    shortDescEn: 'Traditional Moroccan living rooms, TV units, bookcases and contemporary furniture',
    shortDescEs: 'Salones marroquíes tradicionales, muebles TV, bibliotecas y mobiliario contemporáneo',
    shortDescAr: 'صالونات مغربية تقليدية، أثاث تلفاز، مكتبات وأثاث معاصر',

    descriptionFr: `## Mobilier de Salon — Le Cœur de Votre Maison

Le salon est l'espace de vie par excellence. Nous créons du mobilier sur mesure qui reflète votre personnalité et votre sens de l'hospitalité.

### Salon Marocain Traditionnel

Notre spécialité : le salon marocain complet en bois massif. Banquettes sculptées, tables basses ornées, étagères murales décoratives. Bois de noyer, cèdre ou merisier avec coussins assortis.

### Mobilier Contemporain

**Meubles TV** — Designs épurés avec rangements intégrés et passage de câbles.

**Bibliothèques** — Sur mesure, du sol au plafond, avec échelle intégrée.

**Consoles d'entrée** — Premières impressions élégantes en bois massif.

**Meubles de réception** — Pour halls d'hôtels, restaurants et espaces commerciaux.`,

    descriptionEn: `## Living Room Furniture — The Heart of Your Home

The living room is the ultimate living space. We create custom furniture that reflects your personality and sense of hospitality.

### Traditional Moroccan Living Room

Our specialty: the complete Moroccan living room in solid wood. Carved benches, ornate coffee tables, decorative wall shelves.

### Contemporary Furniture

**TV units** — Clean designs with integrated storage and cable management.
**Bookcases** — Custom, floor to ceiling, with integrated ladder.
**Entry consoles** — Elegant first impressions in solid wood.`,

    descriptionEs: `## Mobiliario de Salón — El Corazón de Su Hogar

El salón es el espacio de vida por excelencia. Creamos mobiliario a medida que refleja su personalidad.

### Salón Marroquí Tradicional
Nuestra especialidad: el salón marroquí completo en madera maciza.

### Mobiliario Contemporáneo
Muebles TV, bibliotecas, consolas de entrada y muebles de recepción.`,

    descriptionAr: `## أثاث غرفة المعيشة — قلب منزلك

غرفة المعيشة هي فضاء الحياة بامتياز. نصنع أثاثاً حسب الطلب يعكس شخصيتك وحس الضيافة لديك.

### صالون مغربي تقليدي
تخصصنا: الصالون المغربي الكامل من الخشب الصلب.

### أثاث معاصر
أثاث تلفاز، مكتبات، كونسولات مدخل وأثاث استقبال.`,

    icon: '🛋️',
  },

  'terrasses-pergolas': {
    titleFr: 'Terrasses & Pergolas',
    titleEn: 'Terraces & Pergolas',
    titleEs: 'Terrazas y Pérgolas',
    titleAr: 'شرفات وعرائش',

    shortDescFr: 'Terrasses en bois et composite, pergolas ajourées et structures extérieures sur mesure',
    shortDescEn: 'Wood and composite decks, openwork pergolas and custom outdoor structures',
    shortDescEs: 'Terrazas de madera y composite, pérgolas caladas y estructuras exteriores a medida',
    shortDescAr: 'شرفات من الخشب والمركب، عرائش مخرمة وهياكل خارجية حسب الطلب',

    descriptionFr: `## Terrasses & Pergolas — Votre Oasis Extérieure

Prolongez votre espace de vie vers l'extérieur avec nos terrasses et pergolas en bois. Conçues pour le climat méditerranéen, elles allient beauté naturelle et résistance aux intempéries.

### Terrasses

**Terrasse bois massif** — Lames en teck, ipé ou pin traité. Pose sur lambourdes avec ventilation naturelle.

**Terrasse composite** — Aspect bois avec zéro entretien. Résistant aux UV, à l'eau et aux rayures.

**Terrasse sur mesure** — Formes courbes, multi-niveaux, avec éclairage intégré et jardinières.

### Pergolas

**Pergola bois classique** — Structure en bois massif avec toiture ajourée ou pleine.

**Pergola bioclimatique** — Lames orientables pour contrôler l'ensoleillement.

**Pergola décorative** — Motifs marocains ajourés, jeux d'ombres et de lumière.

### Applications

Jardins privés, terrasses de restaurants, abords de piscines, rooftops et espaces commerciaux.`,

    descriptionEn: `## Terraces & Pergolas — Your Outdoor Oasis

Extend your living space outdoors with our wood terraces and pergolas. Designed for the Mediterranean climate.

### Terraces
**Solid wood deck** — Teak, ipe or treated pine planks.
**Composite deck** — Wood look with zero maintenance.
**Custom deck** — Curved shapes, multi-level, with integrated lighting.

### Pergolas
**Classic wood pergola** — Solid wood structure with open or full roof.
**Bioclimatic pergola** — Adjustable louvers to control sunlight.
**Decorative pergola** — Moroccan openwork patterns, shadow play.`,

    descriptionEs: `## Terrazas y Pérgolas — Su Oasis Exterior

Extienda su espacio de vida al exterior con nuestras terrazas y pérgolas de madera.

### Terrazas
Madera maciza, composite o a medida con formas curvas.

### Pérgolas
Clásica, bioclimática o decorativa con motivos marroquíes.`,

    descriptionAr: `## شرفات وعرائش — واحتك الخارجية

وسّع فضاء معيشتك نحو الخارج مع شرفاتنا وعرائشنا الخشبية.

### الشرفات
خشب صلب، مركب أو حسب الطلب بأشكال منحنية.

### العرائش
كلاسيكية، بيو مناخية أو ديكورية بزخارف مغربية.`,

    icon: '🌿',
  },

  'tables': {
    titleFr: 'Tables sur Mesure',
    titleEn: 'Custom Tables',
    titleEs: 'Mesas a Medida',
    titleAr: 'طاولات حسب الطلب',

    shortDescFr: 'Tables de salle à manger, tables basses et bureaux en bois massif',
    shortDescEn: 'Dining tables, coffee tables and desks in solid wood',
    shortDescEs: 'Mesas de comedor, mesas de centro y escritorios de madera maciza',
    shortDescAr: 'طاولات طعام، طاولات قهوة ومكاتب من الخشب الصلب',

    descriptionFr: `## Tables Artisanales — Pièces Maîtresses

Une belle table rassemble. Nos tables sont des pièces uniques en bois massif, conçues pour devenir le centre de vos moments de partage.

### Nos Créations

**Table de salle à manger** — Grande table familiale en chêne, noyer ou cèdre. Pieds tournés, design contemporain ou rustique.

**Table basse** — Formes organiques (nuage, ovale) ou géométriques. Bois brut, laqué ou combiné avec métal.

**Bureau** — Espace de travail en bois massif avec tiroirs intégrés et passage de câbles.

**Table d'appoint** — Petites pièces d'accent pour compléter votre mobilier.`,

    descriptionEn: `## Artisan Tables — Centerpieces

A beautiful table brings people together. Our tables are unique solid wood pieces.

**Dining table** — Large family table in oak, walnut or cedar.
**Coffee table** — Organic (cloud, oval) or geometric shapes.
**Desk** — Solid wood workspace with integrated drawers.`,

    descriptionEs: `## Mesas Artesanales — Piezas Centrales

Una hermosa mesa reúne. Nuestras mesas son piezas únicas de madera maciza.`,

    descriptionAr: `## طاولات حرفية — قطع مركزية

طاولة جميلة تجمع الناس. طاولاتنا قطع فريدة من الخشب الصلب.`,

    icon: '🪑',
  },

  'decoration': {
    titleFr: 'Décoration en Bois',
    titleEn: 'Wood Decoration',
    titleEs: 'Decoración en Madera',
    titleAr: 'ديكور خشبي',

    shortDescFr: 'Coffrets en marqueterie, sculptures, calligraphie arabe et objets décoratifs artisanaux',
    shortDescEn: 'Marquetry boxes, sculptures, Arabic calligraphy and artisan decorative objects',
    shortDescEs: 'Cofres de marquetería, esculturas, caligrafía árabe y objetos decorativos artesanales',
    shortDescAr: 'صناديق ترصيع، منحوتات، خط عربي وأغراض ديكورية حرفية',

    descriptionFr: `## Décoration Artisanale — L'Âme du Bois

Au-delà du mobilier, le bois est un matériau d'expression artistique. Nos artisans créent des pièces décoratives uniques qui apportent chaleur et caractère à vos espaces.

### Nos Créations

**Coffrets en marqueterie** — Boîtes et coffres ornés de zellige en bois, motifs géométriques traditionnels marocains. Parfaits comme cadeaux ou objets de collection.

**Calligraphie arabe** — Plaques et panneaux en bois sculpté avec versets coraniques ou poésie arabe. Art sacré réalisé avec respect et précision.

**Sculptures** — Pièces d'art contemporain et traditionnel en bois massif.

**Cadres et miroirs** — Encadrements sculptés pour photos, miroirs et tableaux.`,

    descriptionEn: `## Artisan Decoration — The Soul of Wood

Beyond furniture, wood is a medium of artistic expression.

**Marquetry boxes** — Boxes adorned with wood zellige, traditional Moroccan geometric patterns.
**Arabic calligraphy** — Carved wood plaques with Quranic verses or Arabic poetry.
**Sculptures** — Contemporary and traditional solid wood art pieces.
**Frames and mirrors** — Carved frames for photos, mirrors and paintings.`,

    descriptionEs: `## Decoración Artesanal — El Alma de la Madera

Más allá del mobiliario, la madera es un medio de expresión artística.`,

    descriptionAr: `## ديكور حرفي — روح الخشب

أبعد من الأثاث، الخشب مادة للتعبير الفني. حرفيونا يصنعون قطعاً ديكورية فريدة.`,

    icon: '🎨',
  },

  'lits': {
    titleFr: 'Lits en Bois',
    titleEn: 'Wooden Beds',
    titleEs: 'Camas de Madera',
    titleAr: 'أسرّة خشبية',

    shortDescFr: 'Lits et têtes de lit sculptées en bois massif, styles moderne et traditionnel',
    shortDescEn: 'Beds and carved headboards in solid wood, modern and traditional styles',
    shortDescEs: 'Camas y cabeceros tallados de madera maciza, estilos moderno y tradicional',
    shortDescAr: 'أسرّة ولوحات رأس منحوتة من الخشب الصلب',

    descriptionFr: `## Lits & Têtes de Lit — Dormez dans le Luxe du Bois

Votre chambre mérite un lit d'exception. Nos lits en bois massif allient confort, solidité et esthétique pour des nuits paisibles.

### Nos Réalisations

**Lit classique** — Structure en bois massif avec tête de lit sculptée. Finition vernis noir, naturel ou teinté.

**Lit moderne** — Lignes épurées, tête de lit capitonnée intégrée au cadre bois.

**Tête de lit sur mesure** — Panneau mural décoratif : sculptée, cannelée, avec éclairage LED intégré ou niches.`,

    descriptionEn: `## Beds & Headboards — Sleep in Wood Luxury

Your bedroom deserves an exceptional bed. Our solid wood beds combine comfort, solidity and aesthetics.

**Classic bed** — Solid wood frame with carved headboard.
**Modern bed** — Clean lines, upholstered headboard integrated into wood frame.
**Custom headboard** — Decorative wall panel: carved, fluted, with integrated LED.`,

    descriptionEs: `## Camas y Cabeceros — Duerma en el Lujo de la Madera

Su dormitorio merece una cama excepcional.`,

    descriptionAr: `## أسرّة ولوحات رأس — نم في رفاهية الخشب

غرفة نومك تستحق سريراً استثنائياً.`,

    icon: '🛏️',
  },

  'etageres': {
    titleFr: 'Étagères & Rayonnages',
    titleEn: 'Shelves & Shelving',
    titleEs: 'Estanterías',
    titleAr: 'رفوف',

    shortDescFr: 'Étagères murales, bibliothèques et rayonnages en bois massif sur mesure',
    shortDescEn: 'Wall shelves, bookcases and custom solid wood shelving',
    shortDescEs: 'Estanterías de pared, bibliotecas y estanterías de madera maciza a medida',
    shortDescAr: 'رفوف حائطية، مكتبات ورفوف من الخشب الصلب حسب الطلب',

    descriptionFr: `## Étagères — Rangement & Décoration

Nos étagères combinent fonction et beauté. Du simple rayonnage utilitaire à la bibliothèque murale design, chaque pièce est taillée sur mesure.

**Étagères murales** — Fixation invisible, bois massif, formes droites ou organiques.
**Bibliothèques** — Du sol au plafond, avec ou sans portes vitrées.
**Rayonnages commerciaux** — Pour boutiques, pharmacies et espaces professionnels.`,

    descriptionEn: `## Shelves — Storage & Decoration

Our shelves combine function and beauty. From simple utility shelving to designer wall libraries.`,

    descriptionEs: `## Estanterías — Almacenamiento y Decoración

Nuestras estanterías combinan función y belleza.`,

    descriptionAr: `## رفوف — تخزين وديكور

رفوفنا تجمع بين الوظيفة والجمال.`,

    icon: '📚',
  },

  'fenetres': {
    titleFr: 'Fenêtres & Volets',
    titleEn: 'Windows & Shutters',
    titleEs: 'Ventanas y Contraventanas',
    titleAr: 'نوافذ ومصاريع',

    shortDescFr: 'Fenêtres en bois massif, moucharabiehs et volets traditionnels',
    shortDescEn: 'Solid wood windows, moucharabiehs and traditional shutters',
    shortDescEs: 'Ventanas de madera maciza, moucharabiehs y contraventanas tradicionales',
    shortDescAr: 'نوافذ من الخشب الصلب، مشربيات ومصاريع تقليدية',

    descriptionFr: `## Fenêtres & Volets — Lumière et Tradition

Nos fenêtres et volets en bois apportent caractère et authenticité à votre façade.

**Fenêtres en bois massif** — Double vitrage avec cadre bois. Ouverture à la française, oscillo-battante ou coulissante.
**Moucharabieh** — Écrans ajourés traditionnels filtrant la lumière. Art ancestral marocain.
**Volets** — Pleins, persiennés ou ajourés. Protection solaire et sécurité.`,

    descriptionEn: `## Windows & Shutters — Light and Tradition

Our wood windows and shutters bring character and authenticity to your facade.

**Solid wood windows** — Double glazing with wood frame.
**Moucharabieh** — Traditional openwork screens filtering light.
**Shutters** — Solid, louvered or openwork.`,

    descriptionEs: `## Ventanas y Contraventanas — Luz y Tradición

Nuestras ventanas y contraventanas de madera aportan carácter y autenticidad.`,

    descriptionAr: `## نوافذ ومصاريع — نور وتراث

نوافذنا ومصاريعنا الخشبية تضفي طابعاً وأصالة على واجهتك.`,

    icon: '🪟',
  },

  'salles-de-bain': {
    titleFr: 'Salles de Bain',
    titleEn: 'Bathrooms',
    titleEs: 'Baños',
    titleAr: 'حمامات',

    shortDescFr: 'Meubles vasque, miroirs encadrés et rangements de salle de bain en bois traité',
    shortDescEn: 'Vanity units, framed mirrors and bathroom storage in treated wood',
    shortDescEs: 'Muebles de lavabo, espejos enmarcados y almacenamiento de baño en madera tratada',
    shortDescAr: 'أثاث حوض، مرايا مؤطرة وتخزين حمام من الخشب المعالج',

    descriptionFr: `## Salles de Bain — Le Bois Rencontre l'Eau

Le bois traité apporte chaleur et élégance à votre salle de bain. Nos meubles sont conçus pour résister à l'humidité tout en gardant la beauté naturelle du bois.

**Meuble vasque** — Sur mesure, simple ou double vasque, avec tiroirs et rangements.
**Miroir encadré** — Cadre en bois sculpté avec éclairage LED intégré.
**Colonnes et étagères** — Rangement vertical optimisé pour petits espaces.`,

    descriptionEn: `## Bathrooms — Wood Meets Water

Treated wood brings warmth and elegance to your bathroom.

**Vanity unit** — Custom, single or double basin, with drawers and storage.
**Framed mirror** — Carved wood frame with integrated LED lighting.
**Columns and shelves** — Optimized vertical storage for small spaces.`,

    descriptionEs: `## Baños — La Madera Encuentra el Agua

La madera tratada aporta calidez y elegancia a su baño.`,

    descriptionAr: `## حمامات — الخشب يلتقي بالماء

الخشب المعالج يضفي دفئاً وأناقة على حمامك.`,

    icon: '🚿',
  },

  'chaises': {
    titleFr: 'Chaises & Bancs',
    titleEn: 'Chairs & Benches',
    titleEs: 'Sillas y Bancos',
    titleAr: 'كراسي ومقاعد',

    shortDescFr: 'Chaises, bancs et assises en bois massif, artisanales et contemporaines',
    shortDescEn: 'Chairs, benches and seating in solid wood, artisan and contemporary',
    shortDescEs: 'Sillas, bancos y asientos de madera maciza, artesanales y contemporáneos',
    shortDescAr: 'كراسي ومقاعد وجلوس من الخشب الصلب، حرفية ومعاصرة',

    descriptionFr: `## Chaises & Bancs — Assises d'Exception

Du tabouret d'atelier au banc de jardin sculptée, nos assises sont conçues pour le confort et la durabilité.

**Chaises de table** — Assorties à nos tables, en bois massif avec ou sans coussin.
**Bancs** — Bancs d'entrée, de jardin ou de salle à manger. Bois brut ou laqué.
**Tabourets** — De bar, de comptoir ou décoratifs.`,

    descriptionEn: `## Chairs & Benches — Exceptional Seating

From workshop stools to carved garden benches, our seating is designed for comfort and durability.`,

    descriptionEs: `## Sillas y Bancos — Asientos de Excepción

Desde taburetes de taller hasta bancos de jardín tallados.`,

    descriptionAr: `## كراسي ومقاعد — جلوس استثنائي

من كراسي الورشة إلى مقاعد الحديقة المنحوتة.`,

    icon: '💺',
  },
};


// ══════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════

async function main() {
  console.log('🪵 TATCH BOIS - Updating Services with Rich Content');
  console.log('='.repeat(55));

  // For each service, also get the best images from related projects
  for (const [slug, content] of Object.entries(SERVICES_CONTENT)) {
    console.log(`\n  📋 ${content.titleFr} (${slug})`);

    // Find the best cover image from projects in this category
    const category = await prisma.portfolioCategory.findFirst({
      where: { slug },
    });

    let serviceImage = null;
    if (category) {
      // Get the project with most afterImages (best showcase)
      const bestProject = await prisma.portfolioProject.findFirst({
        where: {
          categoryId: category.id,
          coverImage: { not: null },
        },
        orderBy: { order: 'asc' },
      });

      if (bestProject?.coverImage) {
        serviceImage = bestProject.coverImage;
        console.log(`     🖼️  Image: ${serviceImage.substring(0, 60)}...`);
      }
    }

    // Update the service
    try {
      await prisma.siteService.upsert({
        where: { slug },
        update: {
          titleFr: content.titleFr,
          titleEn: content.titleEn,
          titleEs: content.titleEs,
          titleAr: content.titleAr,
          shortDescFr: content.shortDescFr,
          shortDescEn: content.shortDescEn,
          descriptionFr: content.descriptionFr,
          descriptionEn: content.descriptionEn,
          descriptionEs: content.descriptionEs,
          descriptionAr: content.descriptionAr,
          icon: content.icon,
          ...(serviceImage && { image: serviceImage }),
        },
        create: {
          slug,
          titleFr: content.titleFr,
          titleEn: content.titleEn,
          titleEs: content.titleEs,
          titleAr: content.titleAr,
          shortDescFr: content.shortDescFr,
          shortDescEn: content.shortDescEn,
          descriptionFr: content.descriptionFr,
          descriptionEn: content.descriptionEn,
          descriptionEs: content.descriptionEs,
          descriptionAr: content.descriptionAr,
          icon: content.icon,
          image: serviceImage,
          isActive: true,
          isFeatured: true,
        },
      });
      console.log(`     ✅ Updated`);
    } catch (err) {
      console.log(`     ❌ ${err.message}`);
    }
  }

  const total = await prisma.siteService.count();
  console.log(`\n${'='.repeat(55)}`);
  console.log(`🎉 Done! ${total} services updated with rich content.`);
  console.log(`💡 Run: npm run dev → http://localhost:3000/fr/services/portes`);
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
