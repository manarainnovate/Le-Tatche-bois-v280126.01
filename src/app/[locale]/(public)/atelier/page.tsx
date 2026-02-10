'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Award, Users, Clock, Target, Leaf, Sparkles,
  Cog, Hammer, Ruler, Palette, ArrowRight,
  ChevronLeft, ChevronRight, MapPin, Heart, Briefcase
} from 'lucide-react';
import { HeroSection } from '@/components/home/HeroSection';
import { useThemeSettings } from '@/stores/themeSettings';
import { hexToRgba } from '@/lib/utils';

type Locale = 'fr' | 'en' | 'ar' | 'es';

// Section data from database
interface DbSection {
  sectionKey: string;
  titleFr?: string; titleEn?: string; titleEs?: string; titleAr?: string;
  subtitleFr?: string; subtitleEn?: string; subtitleEs?: string; subtitleAr?: string;
  contentFr?: string; contentEn?: string; contentEs?: string; contentAr?: string;
  imageUrl?: string;
  videoUrl?: string;
  bgImage?: string;
  ctaTextFr?: string; ctaTextEn?: string; ctaTextEs?: string; ctaTextAr?: string;
  ctaUrl?: string;
  isActive?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR GRADIENT COMPONENT - Fallback for missing team images
// ═══════════════════════════════════════════════════════════════════════════
const avatarGradients = [
  'from-wood-primary to-wood-secondary',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
];

function AvatarFallback({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center`}
    >
      <span className="text-4xl md:text-5xl font-bold text-white/90">
        {initials}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY PLACEHOLDER COMPONENT - Colorful visual placeholders
// ═══════════════════════════════════════════════════════════════════════════
const galleryItems = [
  { emoji: '🪵', bg: 'from-amber-100 to-amber-200', label: { fr: 'Sélection du bois', en: 'Wood Selection', ar: 'اختيار الخشب', es: 'Selección de madera' } },
  { emoji: '✏️', bg: 'from-blue-100 to-blue-200', label: { fr: 'Design & Plans', en: 'Design & Plans', ar: 'التصميم والخطط', es: 'Diseño y Planos' } },
  { emoji: '⚙️', bg: 'from-gray-100 to-gray-200', label: { fr: 'Usinage CNC', en: 'CNC Machining', ar: 'التصنيع CNC', es: 'Mecanizado CNC' } },
  { emoji: '🔨', bg: 'from-orange-100 to-orange-200', label: { fr: 'Artisanat', en: 'Craftsmanship', ar: 'الحرفية', es: 'Artesanía' } },
  { emoji: '🎨', bg: 'from-purple-100 to-purple-200', label: { fr: 'Finition', en: 'Finishing', ar: 'التشطيب', es: 'Acabado' } },
  { emoji: '✨', bg: 'from-yellow-100 to-yellow-200', label: { fr: 'Résultat Final', en: 'Final Result', ar: 'النتيجة النهائية', es: 'Resultado Final' } },
];

export default function AtelierPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'fr';
  const isRTL = locale === 'ar';

  const [activeProcess, setActiveProcess] = useState(0);
  const [dbSections, setDbSections] = useState<Record<string, DbSection>>({});
  const [galleryProjects, setGalleryProjects] = useState<{ id: string; slug: string; titleFr: string; titleEn: string | null; titleEs: string | null; titleAr: string | null; coverImage: string | null; afterImages: string[]; location: string | null; category: { nameFr: string; nameEn: string | null; nameEs: string | null; nameAr: string | null; icon: string | null } | null }[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const theme = useThemeSettings();

  // Helper: build background style from a theme section
  const sectionBg = (section: typeof theme.atelierStats) => {
    const style: React.CSSProperties = {};
    if (section.type === 'color') {
      style.backgroundColor = section.color;
    } else if (section.type === 'image' && section.image) {
      style.backgroundImage = `url(${section.image})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    return style;
  };

  // Fetch editable sections from database
  useEffect(() => {
    fetch('/api/cms/pages/atelier/sections')
      .then((res) => (res.ok ? res.json() : { sections: [] }))
      .then((data) => {
        const map: Record<string, DbSection> = {};
        (data.sections || []).forEach((s: DbSection) => {
          map[s.sectionKey] = s;
        });
        setDbSections(map);
      })
      .catch(() => {});
  }, []);

  // Fetch portfolio projects for gallery
  useEffect(() => {
    setGalleryLoading(true);
    fetch('/api/cms/portfolio?limit=6')
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data) => setGalleryProjects(data.projects || []))
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  // Get DB text for a section field, fallback to hardcoded
  const db = (sectionKey: string, field: string, fallback: Record<string, string>): string => {
    const section = dbSections[sectionKey];
    if (!section) return fallback[locale] ?? fallback.fr ?? '';
    const localeMap: Record<string, string> = { fr: 'Fr', en: 'En', es: 'Es', ar: 'Ar' };
    const dbValue = (section as unknown as Record<string, unknown>)[`${field}${localeMap[locale] || 'Fr'}`] as string;
    return dbValue || (fallback[locale] ?? fallback.fr ?? '');
  };

  // Get DB image for a section
  const dbImage = (sectionKey: string): string | null => {
    return dbSections[sectionKey]?.imageUrl || null;
  };

  // Parse machine equipment images from bgImage JSON
  const machineImages: Record<string, string> = (() => {
    try { return JSON.parse(dbSections.machines?.bgImage || '{}'); }
    catch { return {}; }
  })();

  // Parse process step images from videoUrl JSON
  const processImages: Record<string, string> = (() => {
    try { return JSON.parse(dbSections.process?.videoUrl || '{}'); }
    catch { return {}; }
  })();

  // Parse team members from bgImage JSON
  interface DbTeamMember { name: string; role: string; experience: string; specialty: string; photo: string; }
  const [brokenPhotos, setBrokenPhotos] = useState<Set<number>>(new Set());
  const dbTeamMembers: DbTeamMember[] = (() => {
    try { const parsed = JSON.parse(dbSections.team?.bgImage || '[]'); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSLATIONS - All hardcoded to avoid translation key issues
  // ═══════════════════════════════════════════════════════════════════════════

  const t = {
    // Hero Section
    hero: {
      badge: {
        fr: 'Depuis 1995',
        en: 'Since 1995',
        ar: 'منذ 1995',
        es: 'Desde 1995'
      },
      title: {
        fr: "L'Atelier",
        en: 'The Workshop',
        ar: 'الورشة',
        es: 'El Taller'
      },
      subtitle: {
        fr: "Où l'Art du Bois Prend Vie",
        en: 'Where the Art of Wood Comes to Life',
        ar: 'حيث يولد فن الخشب',
        es: 'Donde el Arte de la Madera Cobra Vida'
      },
      description: {
        fr: 'Découvrez notre atelier de 500m² où tradition et modernité se rencontrent pour créer des pièces uniques.',
        en: 'Discover our 500m² workshop where tradition and modernity meet to create unique pieces.',
        ar: 'اكتشف ورشتنا البالغة مساحتها 500 متر مربع حيث تلتقي التقاليد والحداثة لإنشاء قطع فريدة.',
        es: 'Descubre nuestro taller de 500m² donde tradición y modernidad se unen para crear piezas únicas.'
      },
      cta: {
        fr: "Visiter l'atelier",
        en: 'Visit the workshop',
        ar: 'زيارة الورشة',
        es: 'Visitar el taller'
      },
      watchVideo: {
        fr: 'Voir la vidéo',
        en: 'Watch video',
        ar: 'شاهد الفيديو',
        es: 'Ver video'
      }
    },

    // Stats
    stats: {
      experience: { fr: "Années d'expérience", en: 'Years of experience', ar: 'سنة خبرة', es: 'Años de experiencia' },
      projects: { fr: 'Projets réalisés', en: 'Projects completed', ar: 'مشروع منجز', es: 'Proyectos realizados' },
      artisans: { fr: 'Artisans qualifiés', en: 'Skilled artisans', ar: 'حرفي ماهر', es: 'Artesanos cualificados' },
      surface: { fr: "m² d'atelier", en: 'm² workshop', ar: 'م² ورشة', es: 'm² de taller' }
    },

    // Story Section
    story: {
      badge: { fr: 'Notre Histoire', en: 'Our Story', ar: 'قصتنا', es: 'Nuestra Historia' },
      title: { fr: 'Une Passion Transmise de Génération en Génération', en: 'A Passion Passed Down Through Generations', ar: 'شغف ينتقل عبر الأجيال', es: 'Una Pasión Transmitida de Generación en Generación' },
      content1: {
        fr: "Fondé en 1995 par Maître Zaki, LE TATCHE BOIS est né d'une passion profonde pour le travail du bois et l'artisanat marocain traditionnel. Ce qui a commencé comme un petit atelier familial est devenu aujourd'hui une référence incontournable dans la menuiserie d'art au Maroc.",
        en: "Founded in 1995 by Master Zaki, LE TATCHE BOIS was born from a deep passion for woodworking and traditional Moroccan craftsmanship. What began as a small family workshop has become an unmissable reference in art woodworking in Morocco.",
        ar: "تأسس LE TATCHE BOIS عام 1995 على يد المعلم زكي، من شغف عميق بالنجارة والحرف المغربية التقليدية. ما بدأ كورشة عائلية صغيرة أصبح اليوم مرجعاً لا غنى عنه في النجارة الفنية بالمغرب.",
        es: "Fundado en 1995 por el Maestro Zaki, LE TATCHE BOIS nació de una profunda pasión por la carpintería y la artesanía tradicional marroquí."
      },
      content2: {
        fr: "Notre engagement envers l'excellence et la préservation des techniques ancestrales nous a permis de réaliser des projets prestigieux : riads historiques, villas de luxe, hôtels 5 étoiles et palais royaux. Chaque création témoigne de notre savoir-faire unique.",
        en: "Our commitment to excellence and preservation of ancestral techniques has enabled us to complete prestigious projects: historic riads, luxury villas, 5-star hotels and royal palaces. Each creation reflects our unique expertise.",
        ar: "التزامنا بالتميز والحفاظ على التقنيات الموروثة مكننا من إنجاز مشاريع مرموقة: رياض تاريخية، فيلات فاخرة، فنادق 5 نجوم وقصور ملكية.",
        es: "Nuestro compromiso con la excelencia nos ha permitido completar proyectos prestigiosos: riads históricos, villas de lujo, hoteles 5 estrellas y palacios reales."
      },
      mission: {
        title: { fr: 'Notre Mission', en: 'Our Mission', ar: 'مهمتنا', es: 'Nuestra Misión' },
        content: {
          fr: "Créer des pièces uniques qui allient tradition et modernité, tout en préservant le patrimoine artisanal marocain pour les générations futures.",
          en: "Create unique pieces that blend tradition and modernity, while preserving Moroccan artisanal heritage for future generations.",
          ar: "إنشاء قطع فريدة تجمع بين التقاليد والحداثة، مع الحفاظ على التراث الحرفي المغربي للأجيال القادمة.",
          es: "Crear piezas únicas que combinen tradición y modernidad, preservando el patrimonio artesanal marroquí."
        }
      }
    },

    // Gallery Section
    gallery: {
      badge: { fr: 'Notre Travail', en: 'Our Work', ar: 'أعمالنا', es: 'Nuestro Trabajo' },
      title: { fr: "De l'Idée à la Réalité", en: 'From Idea to Reality', ar: 'من الفكرة إلى الواقع', es: 'De la Idea a la Realidad' },
      subtitle: { fr: 'Aperçu de notre processus créatif', en: 'A glimpse of our creative process', ar: 'لمحة عن عمليتنا الإبداعية', es: 'Un vistazo a nuestro proceso creativo' }
    },

    // Process Section
    process: {
      badge: { fr: 'Notre Processus', en: 'Our Process', ar: 'عمليتنا', es: 'Nuestro Proceso' },
      title: { fr: "De la Matière Première à l'Œuvre d'Art", en: 'From Raw Material to Work of Art', ar: 'من المواد الخام إلى العمل الفني', es: 'De la Materia Prima a la Obra de Arte' },
      subtitle: { fr: 'Chaque étape est réalisée avec passion et précision', en: 'Each step is carried out with passion and precision', ar: 'كل خطوة تتم بشغف ودقة', es: 'Cada paso se realiza con pasión y precisión' },
      steps: [
        {
          icon: 'wood',
          title: { fr: 'Sélection du Bois', en: 'Wood Selection', ar: 'اختيار الخشب', es: 'Selección de Madera' },
          description: {
            fr: "Nous sélectionnons minutieusement les meilleurs bois nobles : cèdre de l'Atlas, noyer, thuya et chêne. Chaque pièce est choisie pour sa qualité, son grain et sa durabilité.",
            en: 'We carefully select the finest noble woods: Atlas cedar, walnut, thuya and oak. Each piece is chosen for its quality, grain and durability.',
            ar: 'نختار بعناية أجود الأخشاب النبيلة: أرز الأطلس، الجوز، الثويا والبلوط. كل قطعة تُختار لجودتها وتعرجاتها ومتانتها.',
            es: 'Seleccionamos cuidadosamente las mejores maderas nobles: cedro del Atlas, nogal, tuya y roble.'
          }
        },
        {
          icon: 'design',
          title: { fr: 'Conception & Design', en: 'Design & Planning', ar: 'التصميم والتخطيط', es: 'Diseño y Planificación' },
          description: {
            fr: 'Nos designers créent des plans détaillés en collaboration avec vous. Nous utilisons des logiciels 3D pour visualiser le résultat final avant la fabrication.',
            en: 'Our designers create detailed plans in collaboration with you. We use 3D software to visualize the final result before manufacturing.',
            ar: 'يقوم مصممونا بإنشاء خطط تفصيلية بالتعاون معك. نستخدم برامج ثلاثية الأبعاد لتصور النتيجة النهائية قبل التصنيع.',
            es: 'Nuestros diseñadores crean planos detallados en colaboración con usted.'
          }
        },
        {
          icon: 'cnc',
          title: { fr: 'Découpe CNC', en: 'CNC Cutting', ar: 'قطع CNC', es: 'Corte CNC' },
          description: {
            fr: 'Notre machine CNC de dernière génération assure une précision millimétrique pour les découpes complexes et les motifs géométriques traditionnels marocains.',
            en: 'Our latest generation CNC machine ensures millimetric precision for complex cuts and traditional Moroccan geometric patterns.',
            ar: 'تضمن ماكينة CNC الحديثة لدينا دقة بالملليمتر للقطع المعقدة والأنماط الهندسية المغربية التقليدية.',
            es: 'Nuestra máquina CNC de última generación asegura precisión milimétrica.'
          }
        },
        {
          icon: 'handcraft',
          title: { fr: 'Sculpture à la Main', en: 'Hand Carving', ar: 'النحت اليدوي', es: 'Tallado a Mano' },
          description: {
            fr: 'Nos maîtres artisans sculptent à la main les détails fins et les ornements. Un savoir-faire ancestral transmis de génération en génération.',
            en: 'Our master craftsmen hand-carve fine details and ornaments. An ancestral know-how passed down through generations.',
            ar: 'ينحت حرفيونا المهرة التفاصيل الدقيقة والزخارف يدوياً. معرفة موروثة تنتقل عبر الأجيال.',
            es: 'Nuestros maestros artesanos tallan a mano los detalles finos y ornamentos.'
          }
        },
        {
          icon: 'assembly',
          title: { fr: 'Assemblage', en: 'Assembly', ar: 'التجميع', es: 'Ensamblaje' },
          description: {
            fr: 'Assemblage traditionnel par tenon et mortaise, sans clous ni vis apparents. Cette technique garantit solidité et longévité exceptionnelles.',
            en: 'Traditional mortise and tenon assembly, without visible nails or screws. This technique guarantees exceptional strength and longevity.',
            ar: 'تجميع تقليدي بالنقر واللسان، بدون مسامير أو براغي ظاهرة. تضمن هذه التقنية قوة وعمراً استثنائيين.',
            es: 'Ensamblaje tradicional por espiga y mortaja, sin clavos ni tornillos visibles.'
          }
        },
        {
          icon: 'finish',
          title: { fr: 'Finition & Vernissage', en: 'Finishing & Varnishing', ar: 'التشطيب والتلميع', es: 'Acabado y Barnizado' },
          description: {
            fr: "Ponçage fin, application d'huiles naturelles ou de vernis écologiques. Chaque surface est polie à la perfection pour révéler la beauté du bois.",
            en: "Fine sanding, application of natural oils or eco-friendly varnishes. Each surface is polished to perfection to reveal the wood's beauty.",
            ar: 'صنفرة ناعمة، تطبيق زيوت طبيعية أو ورنيش صديق للبيئة. يتم تلميع كل سطح للكمال لإظهار جمال الخشب.',
            es: 'Lijado fino, aplicación de aceites naturales o barnices ecológicos.'
          }
        }
      ]
    },

    // Machines Section
    machines: {
      badge: { fr: 'Nos Équipements', en: 'Our Equipment', ar: 'معداتنا', es: 'Nuestros Equipos' },
      title: { fr: "Technologie de Pointe au Service de l'Artisanat", en: 'Cutting-Edge Technology at the Service of Craftsmanship', ar: 'تكنولوجيا متقدمة في خدمة الحرف', es: 'Tecnología de Vanguardia al Servicio de la Artesanía' },
      list: [
        {
          name: { fr: 'CNC 5 Axes', en: '5-Axis CNC', ar: 'CNC 5 محاور', es: 'CNC 5 Ejes' },
          description: { fr: 'Découpe de précision pour motifs complexes', en: 'Precision cutting for complex patterns', ar: 'قطع دقيق للأنماط المعقدة', es: 'Corte de precisión para patrones complejos' },
          specs: ['Précision 0.01mm', '2500x1250mm', 'Motifs 3D']
        },
        {
          name: { fr: 'Scie à Panneaux', en: 'Panel Saw', ar: 'منشار الألواح', es: 'Sierra de Paneles' },
          description: { fr: 'Découpe précise des grandes pièces', en: 'Precise cutting of large pieces', ar: 'قطع دقيق للقطع الكبيرة', es: 'Corte preciso de piezas grandes' },
          specs: ['3200mm max', 'Guidage laser', 'Aspiration']
        },
        {
          name: { fr: 'Dégauchisseuse-Raboteuse', en: 'Jointer-Planer', ar: 'مسوي-مسحجة', es: 'Cepilladora-Regruesadora' },
          description: { fr: 'Surfaces parfaitement planes', en: 'Perfectly flat surfaces', ar: 'أسطح مستوية تماماً', es: 'Superficies perfectamente planas' },
          specs: ['410mm largeur', 'Précision 0.1mm', 'Hélicoidale']
        },
        {
          name: { fr: 'Tour à Bois', en: 'Wood Lathe', ar: 'مخرطة خشب', es: 'Torno de Madera' },
          description: { fr: 'Création de pièces tournées', en: 'Creation of turned pieces', ar: 'إنشاء قطع مخروطة', es: 'Creación de piezas torneadas' },
          specs: ['1000mm entre-pointes', 'Variable 500-3000rpm', 'Digital']
        },
        {
          name: { fr: 'Cabine de Finition', en: 'Finishing Booth', ar: 'كابينة التشطيب', es: 'Cabina de Acabado' },
          description: { fr: 'Application vernis et peinture', en: 'Varnish and paint application', ar: 'تطبيق الورنيش والطلاء', es: 'Aplicación de barniz y pintura' },
          specs: ['Filtration HEPA', 'Temp. contrôlée', 'Éclairage LED']
        },
        {
          name: { fr: 'Outils Traditionnels', en: 'Traditional Tools', ar: 'أدوات تقليدية', es: 'Herramientas Tradicionales' },
          description: { fr: 'Ciseaux, gouges, rabots artisanaux', en: 'Chisels, gouges, artisan planes', ar: 'أزاميل، محافر، مساحج حرفية', es: 'Cinceles, gubias, cepillos artesanales' },
          specs: ['Acier forgé', 'Fait main', 'Collection unique']
        }
      ]
    },

    // Values Section
    values: {
      badge: { fr: 'Nos Valeurs', en: 'Our Values', ar: 'قيمنا', es: 'Nuestros Valores' },
      title: { fr: 'Ce Qui Nous Anime', en: 'What Drives Us', ar: 'ما يحركنا', es: 'Lo Que Nos Impulsa' },
      list: [
        {
          icon: 'quality',
          title: { fr: 'Excellence', en: 'Excellence', ar: 'التميز', es: 'Excelencia' },
          description: { fr: 'Nous visons la perfection dans chaque détail', en: 'We strive for perfection in every detail', ar: 'نسعى للكمال في كل تفصيل', es: 'Buscamos la perfección en cada detalle' }
        },
        {
          icon: 'tradition',
          title: { fr: 'Tradition', en: 'Tradition', ar: 'التقاليد', es: 'Tradición' },
          description: { fr: 'Préservation du savoir-faire ancestral', en: 'Preserving ancestral know-how', ar: 'الحفاظ على المعرفة الموروثة', es: 'Preservando el saber hacer ancestral' }
        },
        {
          icon: 'innovation',
          title: { fr: 'Innovation', en: 'Innovation', ar: 'الابتكار', es: 'Innovación' },
          description: { fr: 'Technologies modernes pour résultats exceptionnels', en: 'Modern technologies for exceptional results', ar: 'تقنيات حديثة لنتائج استثنائية', es: 'Tecnologías modernas para resultados excepcionales' }
        },
        {
          icon: 'eco',
          title: { fr: 'Éco-responsabilité', en: 'Eco-responsibility', ar: 'المسؤولية البيئية', es: 'Eco-responsabilidad' },
          description: { fr: 'Bois certifiés et pratiques durables', en: 'Certified wood and sustainable practices', ar: 'خشب معتمد وممارسات مستدامة', es: 'Madera certificada y prácticas sostenibles' }
        }
      ]
    },

    // Team Section
    team: {
      badge: { fr: 'Notre Équipe', en: 'Our Team', ar: 'فريقنا', es: 'Nuestro Equipo' },
      title: { fr: 'Les Mains Expertes Derrière Chaque Création', en: 'The Expert Hands Behind Every Creation', ar: 'الأيدي الخبيرة وراء كل إبداع', es: 'Las Manos Expertas Detrás de Cada Creación' },
      teamStats: {
        totalExperience: { fr: "Années d'expérience cumulées", en: 'Combined years of experience', ar: 'سنوات الخبرة المجمعة', es: 'Años de experiencia combinados' },
        projectsCompleted: { fr: 'Projets complétés ensemble', en: 'Projects completed together', ar: 'مشاريع منجزة معاً', es: 'Proyectos completados juntos' },
        clientSatisfaction: { fr: 'Satisfaction client', en: 'Client satisfaction', ar: 'رضا العملاء', es: 'Satisfacción del cliente' }
      },
      members: [
        {
          name: 'Maître Zaki',
          initials: 'MZ',
          role: { fr: 'Fondateur & Maître Artisan', en: 'Founder & Master Craftsman', ar: 'المؤسس والحرفي الرئيسي', es: 'Fundador y Maestro Artesano' },
          experience: '30+',
          specialty: { fr: 'Sculpture traditionnelle', en: 'Traditional carving', ar: 'النحت التقليدي', es: 'Tallado tradicional' }
        },
        {
          name: 'Ahmed Bennani',
          initials: 'AB',
          role: { fr: "Chef d'Atelier", en: 'Workshop Chief', ar: 'رئيس الورشة', es: 'Jefe de Taller' },
          experience: '20+',
          specialty: { fr: 'Assemblage & finition', en: 'Assembly & finishing', ar: 'التجميع والتشطيب', es: 'Ensamblaje y acabado' }
        },
        {
          name: 'Youssef Tazi',
          initials: 'YT',
          role: { fr: 'Designer & Concepteur', en: 'Designer', ar: 'المصمم', es: 'Diseñador' },
          experience: '15+',
          specialty: { fr: 'Design 3D & CNC', en: '3D Design & CNC', ar: 'تصميم ثلاثي الأبعاد و CNC', es: 'Diseño 3D y CNC' }
        },
        {
          name: 'Karim Idrissi',
          initials: 'KI',
          role: { fr: 'Artisan Senior', en: 'Senior Artisan', ar: 'حرفي أول', es: 'Artesano Senior' },
          experience: '18+',
          specialty: { fr: 'Marqueterie & incrustation', en: 'Marquetry & inlay', ar: 'الترصيع والتطعيم', es: 'Marquetería e incrustación' }
        }
      ]
    },

    // CTA Section
    cta: {
      title: { fr: 'Visitez Notre Atelier', en: 'Visit Our Workshop', ar: 'زُر ورشتنا', es: 'Visite Nuestro Taller' },
      description: { fr: 'Venez découvrir notre savoir-faire et discuter de votre projet en personne.', en: 'Come discover our expertise and discuss your project in person.', ar: 'تعال لاكتشاف خبرتنا ومناقشة مشروعك شخصياً.', es: 'Venga a descubrir nuestra experiencia y discuta su proyecto en persona.' },
      address: 'Lot Hamane El Fetouaki N°365, Lamhamid, Marrakech',
      hours: { fr: 'Lun - Sam: 9h00 - 18h00', en: 'Mon - Sat: 9:00 AM - 6:00 PM', ar: 'الإثنين - السبت: 9:00 - 18:00', es: 'Lun - Sáb: 9:00 - 18:00' },
      visitBtn: { fr: 'Planifier une visite', en: 'Schedule a visit', ar: 'حجز زيارة', es: 'Programar una visita' },
      quoteBtn: { fr: 'Demander un devis', en: 'Request a quote', ar: 'طلب عرض سعر', es: 'Solicitar presupuesto' }
    },

    // Navigation
    nav: {
      previous: { fr: 'Précédent', en: 'Previous', ar: 'السابق', es: 'Anterior' },
      next: { fr: 'Suivant', en: 'Next', ar: 'التالي', es: 'Siguiente' },
      experience: { fr: 'Expérience', en: 'Experience', ar: 'خبرة', es: 'Experiencia' },
      specialty: { fr: 'Spécialité', en: 'Specialty', ar: 'تخصص', es: 'Especialidad' },
      years: { fr: 'ans', en: 'years', ar: 'سنة', es: 'años' }
    }
  };

  const getText = (obj: Record<string, string>): string => obj[locale] ?? obj.fr ?? '';

  // Process step icon keys
  const processIconKeys = ['wood', 'design', 'cnc', 'handcraft', 'assembly', 'finish'] as const;

  // Process step icons
  const processIcons: Record<string, React.ReactNode> = {
    wood: <span className="text-4xl">🪵</span>,
    design: <Ruler className="w-10 h-10" />,
    cnc: <Cog className="w-10 h-10" />,
    handcraft: <Hammer className="w-10 h-10" />,
    assembly: <span className="text-4xl">🔧</span>,
    finish: <Palette className="w-10 h-10" />
  };

  // Value icons
  const valueIcons: Record<string, React.ReactNode> = {
    quality: <Award className="w-8 h-8" />,
    tradition: <span className="text-3xl">🏛️</span>,
    innovation: <Sparkles className="w-8 h-8" />,
    eco: <Leaf className="w-8 h-8" />
  };

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO SECTION - Dynamic slider managed from admin
      ═══════════════════════════════════════════════════════════════════════════ */}
      <HeroSection page="atelier" autoPlayInterval={5000} />

      {/* ═══════════════════════════════════════════════════════════════════════════
          STATS BANNER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 relative overflow-hidden" style={sectionBg(theme.atelierStats)}>
        {theme.atelierStats.type === 'image' && theme.atelierStats.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierStats.overlayColor, theme.atelierStats.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '30', suffix: '+', label: t.stats.experience },
              { value: '500', suffix: '+', label: t.stats.projects },
              { value: '15', suffix: '', label: t.stats.artisans },
              { value: '500', suffix: '', label: t.stats.surface }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold mb-1 font-heading" style={{ color: theme.atelierStats.titleColor }}>
                  {stat.value}<span>{stat.suffix}</span>
                </div>
                <div className="text-sm" style={{ color: theme.atelierStats.bodyColor }}>{getText(stat.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          STORY SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={sectionBg(theme.atelierStory)}>
        {theme.atelierStory.type === 'image' && theme.atelierStory.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierStory.overlayColor, theme.atelierStory.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-wood-light via-wood-cream to-white">
                {dbImage('story') ? (
                  <Image src={dbImage('story')!} alt={db('story', 'title', t.story.badge)} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <span className="text-8xl mb-4 block">🪵</span>
                        <span className="text-6xl mb-4 block">🔨</span>
                        <span className="text-4xl block">✨</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute left-0 right-0 h-px bg-wood-primary"
                          style={{ top: `${10 + i * 10}%`, transform: `rotate(${i * 0.5}deg)` }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 bg-wood-primary text-white p-6 rounded-2xl shadow-xl">
                <div className="text-5xl font-bold font-heading">1995</div>
                <div className="text-wood-cream">{getText(t.story.badge)}</div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-wood-cream rounded-2xl -z-10" />
            </div>

            {/* Content Side */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: theme.atelierStory.paginationActiveBg, color: theme.atelierStory.paginationActiveColor }}>
                {getText(t.story.badge)}
              </span>

              <h2 className="text-3xl md:text-4xl font-bold mb-8 font-heading" style={{ color: theme.atelierStory.titleColor }}>
                {db('story', 'title', t.story.title)}
              </h2>

              <div className="text-lg mb-6 leading-relaxed whitespace-pre-line" style={{ color: theme.atelierStory.bodyColor }}>
                {db('story', 'content', t.story.content1) || getText(t.story.content1)}
              </div>

              {!dbSections.story?.contentFr && (
                <p className="text-lg mb-8 leading-relaxed" style={{ color: theme.atelierStory.bodyColor }}>
                  {getText(t.story.content2)}
                </p>
              )}

              {/* Mission Box */}
              <div className="bg-gradient-to-br from-wood-cream to-white p-8 rounded-2xl border-l-4 border-wood-primary">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: theme.atelierStory.titleColor }}>
                  <Target size={24} className="text-wood-primary" />
                  {getText(t.story.mission.title)}
                </h3>
                <p className="italic" style={{ color: theme.atelierStory.bodyColor }}>
                  &ldquo;{getText(t.story.mission.content)}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          GALLERY SECTION - Real portfolio projects
      ═══════════════════════════════════════════════════════════════════════════ */}
      {!galleryLoading && galleryProjects.length === 0 ? null : (
      <section className="py-20 relative overflow-hidden" style={sectionBg(theme.atelierGallery)}>
        {theme.atelierGallery.type === 'image' && theme.atelierGallery.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierGallery.overlayColor, theme.atelierGallery.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: theme.atelierGallery.paginationActiveBg, color: theme.atelierGallery.paginationActiveColor }}>
              <Sparkles size={16} />
              {getText(t.gallery.badge)}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading" style={{ color: theme.atelierGallery.titleColor }}>
              {getText(t.gallery.title)}
            </h2>
            <p className="text-lg" style={{ color: theme.atelierGallery.bodyColor }}>
              {getText(t.gallery.subtitle)}
            </p>
          </div>

          {/* Gallery Grid - Real projects */}
          {galleryLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-wood-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryProjects.map((project) => {
                  const img = project.coverImage || project.afterImages?.[0];
                  const title = locale === 'en' && project.titleEn ? project.titleEn
                    : locale === 'es' && project.titleEs ? project.titleEs
                    : locale === 'ar' && project.titleAr ? project.titleAr
                    : project.titleFr;
                  const catName = project.category
                    ? (locale === 'en' && project.category.nameEn ? project.category.nameEn
                      : locale === 'es' && project.category.nameEs ? project.category.nameEs
                      : locale === 'ar' && project.category.nameAr ? project.category.nameAr
                      : project.category.nameFr)
                    : '';

                  return (
                    <Link
                      key={project.id}
                      href={`/${locale}/realisations/${project.slug}`}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <span className="absolute inset-0 bg-gradient-to-br from-wood-primary to-wood-dark flex items-center justify-center">
                          <span className="text-6xl opacity-60">{project.category?.icon || '🪵'}</span>
                        </span>
                      )}
                      {/* Overlay */}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                      {/* Content */}
                      <span className="absolute inset-0 p-4 flex flex-col justify-end">
                        {catName && (
                          <span className="inline-block px-2 py-0.5 mb-2 w-fit bg-wood-primary/90 text-white text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            {project.category?.icon} {catName}
                          </span>
                        )}
                        <span className="block font-heading text-base md:text-lg text-white font-semibold line-clamp-2">
                          {title}
                        </span>
                        {project.location && (
                          <span className="flex items-center gap-1 text-white/80 text-xs mt-1">
                            <MapPin size={12} /> {project.location}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* View All CTA */}
              <div className="text-center mt-10">
                <Link
                  href={`/${locale}/realisations`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-wood-dark text-white rounded-lg hover:bg-wood-primary transition-colors font-medium"
                >
                  {locale === 'ar' ? 'عرض جميع المشاريع' : locale === 'es' ? 'Ver todos los proyectos' : locale === 'en' ? 'View all projects' : 'Voir tous les projets'}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          PROCESS SECTION - Interactive Timeline
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={sectionBg(theme.atelierProcess)}>
        {theme.atelierProcess.type === 'image' && theme.atelierProcess.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierProcess.overlayColor, theme.atelierProcess.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: theme.atelierProcess.paginationActiveBg, color: theme.atelierProcess.paginationActiveColor }}>
              <Cog size={16} />
              {getText(t.process.badge)}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading" style={{ color: theme.atelierProcess.titleColor }}>
              {getText(t.process.title)}
            </h2>
            <p className="text-lg" style={{ color: theme.atelierProcess.bodyColor }}>
              {getText(t.process.subtitle)}
            </p>
          </div>

          {/* Process Steps */}
          <div className="relative">
            {/* Progress Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-wood-primary transition-all duration-500"
                style={{ width: `${(activeProcess / (t.process.steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps Navigation */}
            <div className="hidden lg:flex justify-between mb-12 relative">
              {t.process.steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveProcess(i)}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    i === activeProcess
                      ? 'bg-wood-primary text-white scale-110 shadow-lg'
                      : i < activeProcess
                      ? 'bg-wood-secondary text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400 group-hover:border-wood-primary'
                  }`}>
                    {processIcons[processIconKeys[i] ?? 'wood']}
                  </div>
                  <span className={`mt-3 text-sm font-medium transition-colors`} style={{ color: i === activeProcess ? theme.atelierProcess.titleColor : theme.atelierProcess.bodyColor }}>
                    {getText(step.title)}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Step Content */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Process step image or emoji fallback */}
                <div className={`relative min-h-[300px] lg:min-h-[400px] ${processImages[String(activeProcess)] ? 'bg-gray-900' : `bg-gradient-to-br ${galleryItems[activeProcess]?.bg || 'from-wood-light to-wood-cream'}`}`}>
                  {processImages[String(activeProcess)] ? (
                    <Image
                      src={processImages[String(activeProcess)]}
                      alt={getText(t.process.steps[activeProcess]?.title ?? { fr: '', en: '', ar: '', es: '' })}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl md:text-9xl">
                        {galleryItems[activeProcess]?.emoji || '🪵'}
                      </span>
                    </div>
                  )}
                  {/* Step Number */}
                  <div className="absolute top-6 left-6 w-14 h-14 bg-wood-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                    {activeProcess + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="text-wood-primary mb-4">
                    {processIcons[processIconKeys[activeProcess] ?? 'wood']}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-wood-dark mb-4 font-heading">
                    {getText(t.process.steps[activeProcess]?.title ?? { fr: '', en: '', ar: '', es: '' })}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {getText(t.process.steps[activeProcess]?.description ?? { fr: '', en: '', ar: '', es: '' })}
                  </p>

                  {/* Navigation */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveProcess(Math.max(0, activeProcess - 1))}
                      disabled={activeProcess === 0}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
                      {getText(t.nav.previous)}
                    </button>
                    <button
                      onClick={() => setActiveProcess(Math.min(t.process.steps.length - 1, activeProcess + 1))}
                      disabled={activeProcess === t.process.steps.length - 1}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-wood-primary text-white hover:bg-wood-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {getText(t.nav.next)}
                      <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Steps */}
            <div className="lg:hidden mt-8 flex gap-2 overflow-x-auto pb-4">
              {t.process.steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveProcess(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    i === activeProcess
                      ? 'bg-wood-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}. {getText(step.title)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          MACHINES SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={sectionBg(theme.atelierMachines)}>
        {theme.atelierMachines.type === 'image' && theme.atelierMachines.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierMachines.overlayColor, theme.atelierMachines.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: theme.atelierMachines.paginationActiveBg, color: theme.atelierMachines.paginationActiveColor }}>
              <Cog size={16} />
              {getText(t.machines.badge)}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading" style={{ color: theme.atelierMachines.titleColor }}>
              {db('machines', 'title', t.machines.title)}
            </h2>
            {db('machines', 'subtitle', {}) && (
              <p className="text-lg" style={{ color: theme.atelierMachines.bodyColor }}>{db('machines', 'subtitle', {})}</p>
            )}
          </div>

          {/* Machines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.machines.list.map((machine, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all group"
              >
                {/* Equipment Image or Icon Fallback */}
                {machineImages[String(i)] ? (
                  <div className="w-full h-[200px] bg-black/20 overflow-hidden">
                    <Image
                      src={machineImages[String(i)]}
                      alt={getText(machine.name)}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] bg-wood-primary/10">
                    <Cog size={48} className="text-wood-cream/50" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: theme.atelierMachines.titleColor }}>
                    {getText(machine.name)}
                  </h3>
                  <p className="mb-4" style={{ color: theme.atelierMachines.bodyColor }}>
                    {getText(machine.description)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {machine.specs.map((spec, j) => (
                      <span key={j} className="px-3 py-1 bg-wood-primary/20 text-xs rounded-full" style={{ color: theme.atelierMachines.titleColor }}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          VALUES SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={sectionBg(theme.atelierValues)}>
        {theme.atelierValues.type === 'image' && theme.atelierValues.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierValues.overlayColor, theme.atelierValues.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: theme.atelierValues.paginationActiveBg, color: theme.atelierValues.paginationActiveColor }}>
              <Heart size={16} />
              {getText(t.values.badge)}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: theme.atelierValues.titleColor }}>
              {db('values', 'title', t.values.title)}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.values.list.map((value, i) => (
              <div
                key={i}
                className="text-center p-8 bg-gradient-to-b from-white to-wood-cream/30 rounded-2xl border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-wood-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-wood-primary group-hover:bg-wood-primary group-hover:text-white transition-all">
                  {valueIcons[value.icon]}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.atelierValues.titleColor }}>
                  {getText(value.title)}
                </h3>
                <p style={{ color: theme.atelierValues.bodyColor }}>
                  {getText(value.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TEAM SECTION with Avatar Fallbacks
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={sectionBg(theme.atelierTeam)}>
        {theme.atelierTeam.type === 'image' && theme.atelierTeam.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierTeam.overlayColor, theme.atelierTeam.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: theme.atelierTeam.paginationActiveBg, color: theme.atelierTeam.paginationActiveColor }}>
              <Users size={16} />
              {getText(t.team.badge)}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading" style={{ color: theme.atelierTeam.titleColor }}>
              {db('team', 'title', t.team.title)}
            </h2>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-wood-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-wood-primary" />
              </div>
              <div className="text-3xl font-bold text-wood-primary mb-1">83+</div>
              <div className="text-sm" style={{ color: theme.atelierTeam.bodyColor }}>{getText(t.team.teamStats.totalExperience)}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-wood-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-wood-primary" />
              </div>
              <div className="text-3xl font-bold text-wood-primary mb-1">500+</div>
              <div className="text-sm" style={{ color: theme.atelierTeam.bodyColor }}>{getText(t.team.teamStats.projectsCompleted)}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-wood-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-wood-primary" />
              </div>
              <div className="text-3xl font-bold text-wood-primary mb-1">98%</div>
              <div className="text-sm" style={{ color: theme.atelierTeam.bodyColor }}>{getText(t.team.teamStats.clientSatisfaction)}</div>
            </div>
          </div>

          {/* Team Members with Avatar Fallbacks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {(dbTeamMembers.length > 0 ? dbTeamMembers : t.team.members).map((member, i) => {
              const isDb = dbTeamMembers.length > 0;
              const memberName = isDb ? (member as DbTeamMember).name : (member as typeof t.team.members[0]).name;
              const memberRole = isDb ? (member as DbTeamMember).role : getText((member as typeof t.team.members[0]).role);
              const memberExp = isDb ? (member as DbTeamMember).experience : (member as typeof t.team.members[0]).experience;
              const memberSpecialty = isDb ? (member as DbTeamMember).specialty : getText((member as typeof t.team.members[0]).specialty);
              const memberPhoto = isDb ? (member as DbTeamMember).photo : '';
              const hasValidPhoto = memberPhoto && !brokenPhotos.has(i);

              return (
                <div
                  key={`team-${memberName}-${i}`}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 flex items-center gap-5"
                >
                  {/* Avatar 150x150 */}
                  <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                    {hasValidPhoto ? (
                      <Image
                        src={memberPhoto}
                        alt={memberName}
                        width={150}
                        height={150}
                        className="object-cover w-full h-full"
                        onError={() => setBrokenPhotos(prev => new Set(prev).add(i))}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-wood-dark text-base">{memberName}</div>
                    <div className="text-sm text-wood-primary">{memberRole}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {memberExp && (
                        <span>{getText(t.nav.experience)}: <strong className="text-wood-dark">{memberExp} {getText(t.nav.years)}</strong></span>
                      )}
                      {memberSpecialty && (
                        <span>{getText(t.nav.specialty)}: <strong className="text-wood-dark">{memberSpecialty}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={sectionBg(theme.atelierCta)}>
        {theme.atelierCta.type === 'image' && theme.atelierCta.overlayEnabled && (
          <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(theme.atelierCta.overlayColor, theme.atelierCta.overlayOpacity / 100) }} />
        )}
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-heading" style={{ color: theme.atelierCta.titleColor }}>
              {db('cta', 'title', t.cta.title)}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: theme.atelierCta.bodyColor }}>
              {db('cta', 'content', t.cta.description)}
            </p>

            {/* Address & Hours */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10">
              <div className="flex items-center gap-2" style={{ color: theme.atelierCta.bodyColor }}>
                <MapPin size={20} />
                {t.cta.address}
              </div>
              <div className="flex items-center gap-2" style={{ color: theme.atelierCta.bodyColor }}>
                <Clock size={20} />
                {getText(t.cta.hours)}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-wood-primary font-bold rounded-xl hover:bg-wood-cream transition-all"
              >
                <MapPin size={20} />
                {getText(t.cta.visitBtn)}
              </Link>
              <Link
                href={`/${locale}/devis`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 font-bold rounded-xl hover:bg-white/10 transition-all"
                style={{ borderColor: theme.atelierCta.titleColor, color: theme.atelierCta.titleColor }}
              >
                {getText(t.cta.quoteBtn)}
                <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
