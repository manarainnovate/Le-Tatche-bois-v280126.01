"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronUp, List } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface LegalSection {
  id: string;
  title: string;
  content: string | string[];
  subsections?: {
    title: string;
    content: string | string[];
  }[];
}

export interface LegalPageContentProps {
  locale: string;
  title: string;
  lastUpdated: string;
  lastUpdatedLabel: string;
  tocTitle: string;
  sections: LegalSection[];
  backToTop?: string;
}

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function LegalPageContent({
  locale,
  title,
  lastUpdated,
  lastUpdatedLabel,
  tocTitle,
  sections,
  backToTop = "Back to top",
}: LegalPageContentProps) {
  const isRTL = locale === "ar";
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Handle scroll for back to top button and active section
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Find active section
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section?.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // Render content (string or array of paragraphs)
  const renderContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return content.map((paragraph, index) => (
        <p key={index} className="text-wood-dark/80 leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      ));
    }
    return <p className="text-wood-dark/80 leading-relaxed">{content}</p>;
  };

  return (
    <main className={cn("min-h-screen bg-wood-light", isRTL && "rtl")}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wood-dark via-wood-primary to-wood-dark py-16 lg:py-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-white/70">
              {lastUpdatedLabel}: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Table of Contents - Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 bg-white rounded-xl shadow-md p-6">
                <div className={cn("flex items-center gap-2 mb-4", isRTL && "flex-row-reverse")}>
                  <List className="w-5 h-5 text-wood-primary" />
                  <h2 className="font-semibold text-wood-dark">{tocTitle}</h2>
                </div>
                <nav>
                  <ul className="space-y-2">
                    {sections.map((section, index) => (
                      <li key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={cn(
                            "w-full text-sm py-2 px-3 rounded-lg transition-all text-left",
                            isRTL && "text-right",
                            activeSection === section.id
                              ? "bg-wood-primary/10 text-wood-primary font-medium"
                              : "text-wood-muted hover:bg-wood-light hover:text-wood-dark"
                          )}
                        >
                          <span className={cn("mr-2", isRTL && "ml-2 mr-0")}>
                            {index + 1}.
                          </span>
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-xl shadow-md p-8 lg:p-10">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className={cn(
                      "scroll-mt-28",
                      index !== sections.length - 1 && "mb-10 pb-10 border-b border-wood-secondary/20"
                    )}
                  >
                    <h2 className="text-xl lg:text-2xl font-bold text-wood-dark mb-4">
                      <span className="text-wood-primary mr-2">{index + 1}.</span>
                      {section.title}
                    </h2>
                    <div className="prose prose-wood max-w-none">
                      {renderContent(section.content)}

                      {/* Subsections */}
                      {section.subsections?.map((subsection, subIndex) => (
                        <div key={subIndex} className="mt-6">
                          <h3 className="text-lg font-semibold text-wood-dark mb-3">
                            {subsection.title}
                          </h3>
                          {renderContent(subsection.content)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 z-50 p-3 bg-wood-primary text-white rounded-full shadow-lg transition-all hover:bg-wood-dark",
          isRTL ? "left-6" : "right-6",
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
        aria-label={backToTop}
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </main>
  );
}
