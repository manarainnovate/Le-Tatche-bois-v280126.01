"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { Accordion } from "@/components/ui/Accordion";
import ImageSliderGallery from "@/components/public/ImageSliderGallery";
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Award,
  Shield,
  Sparkles,
  Users,
  MessageSquare,
  PenTool,
  Hammer,
  Truck,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ServiceData {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  titleEs: string;
  titleAr: string;
  shortDescFr: string;
  shortDescEn: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionEs: string;
  descriptionAr: string;
  icon: string;
  image: string;
}

interface ProjectData {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  titleEs: string;
  titleAr: string;
  descriptionFr: string;
  descriptionEn: string;
  descriptionEs: string;
  descriptionAr: string;
  coverImage: string;
  afterImages: string[];
  isFeatured: boolean;
}

interface ServiceDetailContentProps {
  locale: string;
  service: ServiceData;
  galleryImages: string[];
  projects: ProjectData[];
  translations: {
    requestQuote: string;
    backToServices: string;
    processTitle: string;
    processSubtitle: string;
    processStepLabel: string;
    processSteps: Record<string, { title: string; description: string }>;
    whyUsTitle: string;
    whyUs: Record<string, { title: string; description: string }>;
    faqTitle: string;
    faqSubtitle: string;
    faqItems: Record<string, { question: string; answer: string }>;
    ctaTitle: string;
    ctaDescription: string;
    ctaButton: string;
    galleryTitle: string;
    relatedProjectsTitle: string;
    viewProject: string;
  };
}

// ═══════════════════════════════════════════════════════════
// LOCALE HELPER
// ═══════════════════════════════════════════════════════════

function t(item: Record<string, string>, field: string, locale: string): string {
  const suffix = locale === "fr" ? "Fr" : locale === "en" ? "En" : locale === "es" ? "Es" : "Ar";
  return item[`${field}${suffix}`] || item[`${field}Fr`] || "";
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const processSteps = [
  { icon: MessageSquare, key: "consultation" },
  { icon: PenTool, key: "design" },
  { icon: Hammer, key: "fabrication" },
  { icon: Truck, key: "installation" },
];

const whyUsItems = [
  { icon: Award, key: "experience" },
  { icon: Sparkles, key: "quality" },
  { icon: Users, key: "custom" },
  { icon: Shield, key: "warranty" },
];

const faqKeys = ["delays", "woodTypes", "warranty", "howToQuote"];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function ServiceDetailContent({
  locale,
  service,
  galleryImages,
  projects,
  translations,
}: ServiceDetailContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";

  const title = t(service, "title", locale);
  const shortDesc = t(
    { shortDescFr: service.shortDescFr, shortDescEn: service.shortDescEn },
    "shortDesc",
    locale
  );
  const description = t(service, "description", locale);

  // Hero slideshow state
  const heroImages = galleryImages.length > 0 ? galleryImages : [];
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroNext = useCallback(() => {
    if (heroImages.length <= 1) return;
    setHeroIndex((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  const heroPrev = useCallback(() => {
    if (heroImages.length <= 1) return;
    setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }, [heroImages.length]);

  // Auto-play hero slideshow
  useEffect(() => {
    if (heroImages.length <= 1 || isPaused) return;
    const interval = setInterval(heroNext, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length, isPaused, heroNext]);

  return (
    <>
      {/* Hero Section - Full-width background slideshow */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "75vh", minHeight: "500px" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Slides - only render current, prev, next for performance */}
        <div className="absolute inset-0">
          {heroImages.length > 0 ? (
            heroImages.map((img, i) => {
              const prev = (heroIndex - 1 + heroImages.length) % heroImages.length;
              const next = (heroIndex + 1) % heroImages.length;
              const isVisible = i === heroIndex || i === prev || i === next;
              if (!isVisible) return null;
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 bg-cover bg-center bg-no-repeat",
                    i === heroIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  )}
                  style={{ backgroundImage: `url(${img})` }}
                />
              );
            })
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-wood-primary via-wood-secondary to-wood-dark" />
          )}
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 z-20 bg-black/50" />

        {/* Content */}
        <div className="relative z-30 h-full flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            {/* Back Link */}
            <Link
              href={`/${locale}/services`}
              className={cn(
                "inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors",
                isRTL && "flex-row-reverse"
              )}
            >
              {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              <span>{translations.backToServices}</span>
            </Link>

            <div className={cn("max-w-2xl", isRTL && "ml-auto")}>
              {/* Icon Badge */}
              {service.icon && (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-white/20 backdrop-blur-sm shadow-lg">
                  <span className="text-3xl">{service.icon}</span>
                </div>
              )}

              <h1
                className={cn(
                  "font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6",
                  isRTL && "text-right"
                )}
              >
                {title}
              </h1>

              <p
                className={cn(
                  "text-xl text-white/90 mb-8 leading-relaxed",
                  isRTL && "text-right"
                )}
              >
                {shortDesc}
              </p>

              {/* CTA Button */}
              <Link
                href={`/${locale}/devis?service=${service.slug}`}
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "px-8 py-4 text-lg font-semibold rounded-xl",
                  "bg-white text-wood-primary",
                  "shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
                  isRTL && "flex-row-reverse"
                )}
              >
                {translations.requestQuote}
                {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={heroPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={heroNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {heroImages.length > 1 && heroImages.length <= 20 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={cn(
                  "h-3 rounded-full transition-all",
                  i === heroIndex
                    ? "bg-amber-500 w-8"
                    : "bg-white/50 hover:bg-white/80 w-3"
                )}
              />
            ))}
          </div>
        )}

        {/* Counter (for large galleries) */}
        {heroImages.length > 20 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/40 rounded-full text-white text-sm font-medium">
            {heroIndex + 1} / {heroImages.length}
          </div>
        )}

        {/* Slide Counter - top right */}
        {heroImages.length > 1 && (
          <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-black/30 rounded-full text-white text-sm">
            {heroIndex + 1} / {heroImages.length}
          </div>
        )}
      </section>

      {/* Description Section (Markdown) */}
      {description && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div
              className={cn(
                "prose prose-lg prose-wood max-w-none",
                "prose-headings:text-wood-dark prose-headings:font-heading",
                "prose-p:text-wood-muted prose-p:leading-relaxed",
                "prose-strong:text-wood-dark",
                "prose-ul:text-wood-muted prose-li:text-wood-muted",
                "prose-a:text-wood-primary hover:prose-a:text-wood-secondary",
                isRTL && "text-right"
              )}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <ReactMarkdown>{description}</ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Slider Section */}
      {galleryImages.length > 1 && (
        <section className="py-16 bg-wood-cream">
          <div className="max-w-5xl mx-auto px-4">
            <h2
              className={cn(
                "font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-8 text-center",
                isRTL && "text-right"
              )}
            >
              {translations.galleryTitle}
            </h2>

            <ImageSliderGallery
              images={galleryImages}
              title={title}
            />
          </div>
        </section>
      )}

      {/* Related Projects Section */}
      {projects.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2
              className={cn(
                "font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-8 text-center",
                isRTL && "text-right"
              )}
            >
              {translations.relatedProjectsTitle}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => {
                const projectTitle = t(project, "title", locale);
                const projectDesc = t(project, "description", locale);
                const projectImage = project.coverImage || project.afterImages[0] || "";

                return (
                  <Link
                    key={project.id}
                    href={`/${locale}/realisations/${project.slug}`}
                    className="group bg-wood-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    {projectImage && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={projectImage}
                          alt={projectTitle}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3
                        className={cn(
                          "text-lg font-bold text-wood-dark mb-2 group-hover:text-wood-primary transition-colors",
                          isRTL && "text-right"
                        )}
                      >
                        {projectTitle}
                      </h3>
                      {projectDesc && (
                        <p
                          className={cn(
                            "text-wood-muted text-sm line-clamp-2",
                            isRTL && "text-right"
                          )}
                        >
                          {projectDesc}
                        </p>
                      )}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 mt-3 text-sm font-medium text-wood-primary",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        {translations.viewProject}
                        {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Why Us Section */}
      <section className="py-16 bg-wood-cream">
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className={cn(
              "font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-12 text-center",
              isRTL && "text-right"
            )}
          >
            {translations.whyUsTitle}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUsItems.map((item, index) => {
              const ItemIcon = item.icon;
              const data = translations.whyUs[item.key];
              return (
                <div
                  key={index}
                  className={cn(
                    "text-center p-6 rounded-2xl bg-white/80 hover:bg-white transition-colors",
                    isRTL && "text-right"
                  )}
                >
                  <div
                    className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-2xl",
                      "bg-gradient-to-br from-wood-primary to-wood-secondary",
                      "flex items-center justify-center shadow-lg"
                    )}
                  >
                    <ItemIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-wood-dark mb-2">
                    {data?.title}
                  </h3>
                  <p className="text-wood-muted text-sm">{data?.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className={cn("text-center mb-12", isRTL && "text-right")}>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-4">
              {translations.processTitle}
            </h2>
            <p className="text-wood-muted text-lg max-w-2xl mx-auto">
              {translations.processSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const StepIcon = step.icon;
              const stepData = translations.processSteps[step.key];
              return (
                <div
                  key={index}
                  className={cn(
                    "relative text-center p-6",
                    isRTL && "text-right"
                  )}
                >
                  {index < processSteps.length - 1 && (
                    <div
                      className={cn(
                        "hidden lg:block absolute top-12 h-0.5 bg-wood-primary/30",
                        isRTL ? "left-0 right-1/2" : "left-1/2 right-0"
                      )}
                    />
                  )}

                  <div className="relative z-10">
                    <div
                      className={cn(
                        "w-20 h-20 mx-auto mb-4 rounded-2xl",
                        "bg-gradient-to-br from-wood-primary to-wood-secondary",
                        "flex items-center justify-center shadow-lg"
                      )}
                    >
                      <StepIcon className="w-10 h-10 text-white" />
                    </div>

                    <span className="inline-block px-3 py-1 mb-3 bg-wood-light/50 rounded-full text-sm font-medium text-wood-primary">
                      {translations.processStepLabel.replace(
                        "{number}",
                        String(index + 1)
                      )}
                    </span>

                    <h3 className="text-lg font-bold text-wood-dark mb-2">
                      {stepData?.title}
                    </h3>
                    <p className="text-wood-muted text-sm">
                      {stepData?.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-wood-cream">
        <div className="max-w-3xl mx-auto px-4">
          <div className={cn("text-center mb-12", isRTL && "text-right")}>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-wood-dark mb-4">
              {translations.faqTitle}
            </h2>
            <p className="text-wood-muted text-lg">
              {translations.faqSubtitle}
            </p>
          </div>

          <Accordion type="single" collapsible>
            {faqKeys.map((key) => {
              const faq = translations.faqItems[key];
              if (!faq) return null;
              return (
                <Accordion.Item key={key} value={key}>
                  <Accordion.Trigger>{faq.question}</Accordion.Trigger>
                  <Accordion.Content>{faq.answer}</Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-wood-dark to-wood-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2
            className={cn(
              "font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6",
              isRTL && "text-right"
            )}
          >
            {translations.ctaTitle}
          </h2>
          <p
            className={cn(
              "text-white/80 text-lg mb-8 max-w-2xl mx-auto",
              isRTL && "text-right"
            )}
          >
            {translations.ctaDescription}
          </p>
          <Link
            href={`/${locale}/devis?service=${service.slug}`}
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "px-8 py-4 text-lg font-medium rounded-xl",
              "bg-white text-wood-primary",
              "shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
              isRTL && "flex-row-reverse"
            )}
          >
            {translations.ctaButton}
            {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
          </Link>
        </div>
      </section>
    </>
  );
}

ServiceDetailContent.displayName = "ServiceDetailContent";
