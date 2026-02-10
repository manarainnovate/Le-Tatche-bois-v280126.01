import { prisma } from "@/lib/prisma";
import HeroSlider from "./HeroSlider";

// ═══════════════════════════════════════════════════════════
// Hero Section - Server Component
// Fetches slides from database and renders HeroSlider
// ═══════════════════════════════════════════════════════════

interface HeroSectionProps {
  page: string; // 'home', 'services', 'portfolio', 'workshop', 'shop', 'contact'
  locale?: string;
  height?: string;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  pauseOnHover?: boolean;
}

async function getHeroSlides(page: string) {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: {
        targetPage: page,
        isActive: true,
      },
      orderBy: { order: "asc" },
    });
    return slides;
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return [];
  }
}

export default async function HeroSection({
  page,
  locale = "fr",
  height = "70vh",
  autoPlayInterval = 3000,
  showControls = true,
  showIndicators = true,
  pauseOnHover = true,
}: HeroSectionProps) {
  const slides = await getHeroSlides(page);

  return (
    <HeroSlider
      slides={slides}
      locale={locale}
      height={height}
      autoPlayInterval={autoPlayInterval}
      showControls={showControls}
      showIndicators={showIndicators}
      pauseOnHover={pauseOnHover}
    />
  );
}
