"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  FileText,
  FileCheck,
  Truck,
  ClipboardCheck,
  Receipt,
  CreditCard,
  Package,
  Boxes,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Target,
  Building2,
  Calendar,
  Wrench,
  Tags,
  Image,
  MessageSquare,
  ShoppingCart,
  Layout,
  Menu,
  Quote,
  Star,
  PanelBottom,
  Images,
  Palette,
  Hammer,
  Printer,
  Award,
  Banknote,
  FileSpreadsheet,
  Send,
} from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/stores/siteSettings";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type UserRole = "ADMIN" | "MANAGER" | "COMMERCIAL" | "CHEF_ATELIER" | "COMPTABLE" | "READONLY";

interface LocalizedString {
  fr: string;
  en: string;
  es: string;
  ar: string;
}

interface NavItem {
  name: LocalizedString;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: number;
  isSubheader?: boolean; // For non-clickable group labels
  external?: boolean; // For external links (opens in new tab)
}

interface NavSection {
  id: string;
  title: LocalizedString;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  items: NavItem[];
  subsections?: NavSubSection[]; // For nested sections
}

interface NavSubSection {
  id: string;
  title: LocalizedString;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  items: NavItem[];
}

// ═══════════════════════════════════════════════════════════
// Navigation Configuration
// ═══════════════════════════════════════════════════════════

const navigationSections: NavSection[] = [
  // ─────────────────────────────────────────────────────────
  // Dashboard (standalone)
  // ─────────────────────────────────────────────────────────
  {
    id: "dashboard",
    title: { fr: "Tableau de bord", en: "Dashboard", es: "Panel", ar: "لوحة التحكم" },
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER", "COMPTABLE", "READONLY"],
    items: [
      {
        name: { fr: "Tableau de bord", en: "Dashboard", es: "Panel", ar: "لوحة التحكم" },
        href: "/admin",
        icon: LayoutDashboard,
        roles: ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER", "COMPTABLE", "READONLY"],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // B2C - E-COMMERCE (Website Sales)
  // ═══════════════════════════════════════════════════════════
  {
    id: "b2c-ecommerce",
    title: { fr: "E-Commerce (B2C)", en: "E-Commerce (B2C)", es: "E-Commerce (B2C)", ar: "التجارة الإلكترونية" },
    icon: ShoppingCart,
    roles: ["ADMIN", "MANAGER"],
    items: [
      {
        name: { fr: "Commandes Web", en: "Web Orders", es: "Pedidos Web", ar: "طلبات الويب" },
        href: "/admin/ecommerce/commandes",
        icon: ShoppingCart,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Demandes Devis", en: "Quote Requests", es: "Solicitudes", ar: "طلبات عروض الأسعار" },
        href: "/admin/ecommerce/devis-web",
        icon: FileText,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Produits Boutique", en: "Shop Products", es: "Productos Tienda", ar: "منتجات المتجر" },
        href: "/admin/ecommerce/produits",
        icon: Package,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Catégories Site", en: "Site Categories", es: "Categorías Web", ar: "فئات الموقع" },
        href: "/admin/ecommerce/categories",
        icon: Tags,
        roles: ["ADMIN", "MANAGER"],
      },
      // NOTE: "Réalisations/Portfolio" and "Services du site" moved to "Contenu" section below
      // to avoid duplication in sidebar navigation
      {
        name: { fr: "Messages", en: "Messages", es: "Mensajes", ar: "الرسائل" },
        href: "/admin/messages",
        icon: MessageSquare,
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // B2B - UNIFIED SECTION (CRM, Projects, Invoicing, Payments)
  // ═══════════════════════════════════════════════════════════
  {
    id: "b2b",
    title: { fr: "B2B", en: "B2B", es: "B2B", ar: "B2B" },
    icon: Building2,
    roles: ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER", "COMPTABLE"],
    items: [],
    subsections: [
      // ─────────────────────────────────────────────────────────
      // CRM Sub-section
      // ─────────────────────────────────────────────────────────
      {
        id: "b2b-crm",
        title: { fr: "CRM", en: "CRM", es: "CRM", ar: "إدارة العملاء" },
        icon: Users,
        roles: ["ADMIN", "MANAGER", "COMMERCIAL"],
        items: [
          {
            name: { fr: "Leads", en: "Leads", es: "Prospectos", ar: "العملاء المحتملون" },
            href: "/admin/crm/leads",
            icon: Target,
            roles: ["ADMIN", "MANAGER", "COMMERCIAL"],
          },
          {
            name: { fr: "Clients", en: "Clients", es: "Clientes", ar: "العملاء" },
            href: "/admin/crm/clients",
            icon: Building2,
            roles: ["ADMIN", "MANAGER", "COMMERCIAL"],
          },
          {
            name: { fr: "Rendez-vous", en: "Appointments", es: "Citas", ar: "المواعيد" },
            href: "/admin/crm/rendez-vous",
            icon: Calendar,
            roles: ["ADMIN", "MANAGER", "COMMERCIAL"],
          },
        ],
      },
      // ─────────────────────────────────────────────────────────
      // Projects Sub-section
      // ─────────────────────────────────────────────────────────
      {
        id: "b2b-projets",
        title: { fr: "Chantiers", en: "Projects", es: "Proyectos", ar: "المشاريع" },
        icon: FolderKanban,
        roles: ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER"],
        items: [
          {
            name: { fr: "Tous les projets", en: "All Projects", es: "Todos", ar: "كل المشاريع" },
            href: "/admin/projets",
            icon: FolderKanban,
            roles: ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER"],
          },
        ],
      },
      // ─────────────────────────────────────────────────────────
      // Invoicing Sub-section
      // ─────────────────────────────────────────────────────────
      {
        id: "b2b-facturation",
        title: { fr: "Facturation", en: "Invoicing", es: "Facturación", ar: "الفواتير" },
        icon: FileText,
        roles: ["ADMIN", "MANAGER", "COMMERCIAL", "COMPTABLE"],
        items: [
          // CHANGE 1: Reordered - Factures FIRST (most important)
          {
            name: { fr: "Factures", en: "Invoices", es: "Facturas", ar: "الفواتير" },
            href: "/admin/facturation/factures",
            icon: Receipt,
            roles: ["ADMIN", "MANAGER", "COMPTABLE"],
          },
          {
            name: { fr: "Devis", en: "Quotes", es: "Presupuestos", ar: "عروض الأسعار" },
            href: "/admin/facturation/devis",
            icon: FileText,
            roles: ["ADMIN", "MANAGER", "COMMERCIAL"],
          },
          {
            name: { fr: "Bons de commande", en: "Purchase Orders", es: "Órdenes de compra", ar: "أوامر الشراء" },
            href: "/admin/facturation/bc",
            icon: FileCheck,
            roles: ["ADMIN", "MANAGER", "COMMERCIAL"],
          },
          {
            name: { fr: "Bons de livraison", en: "Delivery Notes", es: "Albaranes de entrega", ar: "سندات التسليم" },
            href: "/admin/facturation/bl",
            icon: Truck,
            roles: ["ADMIN", "MANAGER", "CHEF_ATELIER"],
          },
          {
            name: { fr: "PV de réception", en: "Reception Reports", es: "Actas de recepción", ar: "محاضر الاستلام" },
            href: "/admin/facturation/rft",
            icon: ClipboardCheck,
            roles: ["ADMIN", "MANAGER", "CHEF_ATELIER"],
          },
          {
            name: { fr: "Avoirs", en: "Credit Notes", es: "Abonos", ar: "الإشعارات الدائنة" },
            href: "/admin/facturation/avoirs",
            icon: Receipt,
            roles: ["ADMIN", "MANAGER", "COMPTABLE"],
          },
          // CHANGE 2: NEW - Papier en-tête (blank letterhead PDF)
          {
            name: { fr: "Papier en-tête", en: "Letterhead", es: "Papel con membrete", ar: "ورقة برأسية" },
            href: "/api/crm/documents/papier-entete",
            icon: Printer,
            roles: ["ADMIN", "MANAGER", "COMMERCIAL", "COMPTABLE"],
            external: true, // Opens PDF in new tab
          },
        ],
      },
      // ─────────────────────────────────────────────────────────
      // Payments Sub-section
      // ─────────────────────────────────────────────────────────
      {
        id: "b2b-paiements",
        title: { fr: "Paiements", en: "Payments", es: "Pagos", ar: "المدفوعات" },
        icon: CreditCard,
        roles: ["ADMIN", "MANAGER", "COMPTABLE"],
        items: [
          {
            name: { fr: "Tous les paiements", en: "All Payments", es: "Todos", ar: "كل المدفوعات" },
            href: "/admin/facturation/paiements",
            icon: CreditCard,
            roles: ["ADMIN", "MANAGER", "COMPTABLE"],
          },
          {
            name: { fr: "Impayés", en: "Unpaid", es: "Impagados", ar: "غير مدفوع" },
            href: "/admin/facturation/impayes",
            icon: Receipt,
            roles: ["ADMIN", "MANAGER", "COMPTABLE"],
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CHANGE 3: NEW - DOCUMENTS RH (HR Documents)
  // ═══════════════════════════════════════════════════════════
  {
    id: "documents-rh",
    title: { fr: "Documents RH", en: "HR Documents", es: "Documentos RRHH", ar: "مستندات الموارد البشرية" },
    icon: Users,
    roles: ["ADMIN", "MANAGER"],
    items: [
      {
        name: { fr: "Note de frais", en: "Expense Report", es: "Nota de gastos", ar: "مذكرة نفقات" },
        href: "/admin/documents-rh/note-de-frais",
        icon: Receipt,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Attestation de travail", en: "Work Certificate", es: "Certificado de trabajo", ar: "شهادة عمل" },
        href: "/admin/documents-rh/attestation-travail",
        icon: Award,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Attestation de salaire", en: "Salary Certificate", es: "Certificado de salario", ar: "شهادة راتب" },
        href: "/admin/documents-rh/attestation-salaire",
        icon: Banknote,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Bulletin de paie", en: "Payslip", es: "Nómina", ar: "قسيمة راتب" },
        href: "/admin/documents-rh/bulletin-paie",
        icon: FileSpreadsheet,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Ordre de mission", en: "Mission Order", es: "Orden de misión", ar: "أمر مهمة" },
        href: "/admin/documents-rh/ordre-mission",
        icon: Send,
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // SHARED - Catalog & Stock
  // ═══════════════════════════════════════════════════════════
  {
    id: "catalogue",
    title: { fr: "Catalogue", en: "Catalog", es: "Catálogo", ar: "الكتالوج" },
    icon: Package,
    roles: ["ADMIN", "MANAGER"],
    items: [
      {
        name: { fr: "Articles", en: "Items", es: "Artículos", ar: "المقالات" },
        href: "/admin/catalogue/produits",
        icon: Package,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Services (facturables)", en: "Services (billable)", es: "Servicios (facturables)", ar: "الخدمات (قابلة للفوترة)" },
        href: "/admin/catalogue/services",
        icon: Wrench,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Catégories", en: "Categories", es: "Categorías", ar: "الفئات" },
        href: "/admin/catalogue/categories",
        icon: Tags,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Stock", en: "Stock", es: "Stock", ar: "المخزون" },
        href: "/admin/catalogue/stock",
        icon: Boxes,
        roles: ["ADMIN", "MANAGER", "CHEF_ATELIER"],
      },
      {
        name: { fr: "Fournisseurs", en: "Suppliers", es: "Proveedores", ar: "الموردون" },
        href: "/admin/catalogue/fournisseurs",
        icon: Building2,
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // REPORTS - Combined B2C + B2B
  // ═══════════════════════════════════════════════════════════
  {
    id: "rapports",
    title: { fr: "Rapports", en: "Reports", es: "Informes", ar: "التقارير" },
    icon: BarChart3,
    roles: ["ADMIN", "MANAGER", "COMPTABLE"],
    items: [
      {
        name: { fr: "Vue Globale", en: "Overview", es: "General", ar: "نظرة عامة" },
        href: "/admin/rapports",
        icon: BarChart3,
        roles: ["ADMIN", "MANAGER", "COMPTABLE"],
      },
      {
        name: { fr: "Rapport B2C", en: "B2C Report", es: "Informe B2C", ar: "تقرير B2C" },
        href: "/admin/rapports/b2c",
        icon: ShoppingCart,
        roles: ["ADMIN", "MANAGER", "COMPTABLE"],
      },
      {
        name: { fr: "Rapport B2B", en: "B2B Report", es: "Informe B2B", ar: "تقرير B2B" },
        href: "/admin/rapports/b2b",
        icon: Building2,
        roles: ["ADMIN", "MANAGER", "COMPTABLE"],
      },
      {
        name: { fr: "CA & Ventes", en: "Sales", es: "Ventas", ar: "المبيعات" },
        href: "/admin/rapports/ventes",
        icon: Receipt,
        roles: ["ADMIN", "MANAGER", "COMPTABLE"],
      },
      {
        name: { fr: "Créances", en: "Receivables", es: "Cuentas por cobrar", ar: "المستحقات" },
        href: "/admin/rapports/creances",
        icon: CreditCard,
        roles: ["ADMIN", "MANAGER", "COMPTABLE"],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CONTENT & MEDIA (CMS)
  // ═══════════════════════════════════════════════════════════
  {
    id: "contenu",
    title: { fr: "Contenu", en: "Content", es: "Contenido", ar: "المحتوى" },
    icon: Layout,
    roles: ["ADMIN", "MANAGER"],
    items: [
      {
        name: { fr: "Pages du site", en: "Site Pages", es: "Páginas del sitio", ar: "صفحات الموقع" },
        href: "/admin/contenu/pages",
        icon: Layout,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Contenu Atelier", en: "Workshop Content", es: "Contenido Taller", ar: "محتوى الورشة" },
        href: "/admin/contenu/atelier",
        icon: Hammer,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Portfolio", en: "Portfolio", es: "Portfolio", ar: "معرض الأعمال" },
        href: "/admin/contenu/portfolio",
        icon: Briefcase,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Catégories Portfolio", en: "Portfolio Categories", es: "Categorías Portfolio", ar: "فئات المعرض" },
        href: "/admin/contenu/portfolio/categories",
        icon: FolderKanban,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Services du site", en: "Site Services", es: "Servicios del sitio", ar: "خدمات الموقع" },
        href: "/admin/contenu/services-site",
        icon: Wrench,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Bannières Hero", en: "Hero Slides", es: "Banners Hero", ar: "شرائح البطل" },
        href: "/admin/contenu/hero-slides",
        icon: Image,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Statistiques", en: "Stats Counters", es: "Estadísticas", ar: "الإحصائيات" },
        href: "/admin/contenu/stats",
        icon: BarChart3,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Témoignages", en: "Testimonials", es: "Testimonios", ar: "الشهادات" },
        href: "/admin/contenu/temoignages",
        icon: Quote,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Menus Navigation", en: "Navigation Menus", es: "Menús Navegación", ar: "قوائم التنقل" },
        href: "/admin/contenu/navigation",
        icon: Menu,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Pied de page", en: "Footer", es: "Pie de página", ar: "تذييل الصفحة" },
        href: "/admin/contenu/footer",
        icon: PanelBottom,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        name: { fr: "Médiathèque", en: "Media Library", es: "Mediateca", ar: "مكتبة الوسائط" },
        href: "/admin/media",
        icon: Images,
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════
  {
    id: "parametres",
    title: { fr: "Paramètres", en: "Settings", es: "Configuración", ar: "الإعدادات" },
    icon: Settings,
    roles: ["ADMIN"],
    items: [
      {
        name: { fr: "Général", en: "General", es: "General", ar: "عام" },
        href: "/admin/parametres",
        icon: Settings,
        roles: ["ADMIN"],
      },
      {
        name: { fr: "Utilisateurs", en: "Users", es: "Usuarios", ar: "المستخدمون" },
        href: "/admin/parametres/utilisateurs",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        name: { fr: "Entreprise", en: "Company", es: "Empresa", ar: "الشركة" },
        href: "/admin/parametres/entreprise",
        icon: Building2,
        roles: ["ADMIN"],
      },
      {
        name: { fr: "Documents", en: "Documents", es: "Documentos", ar: "المستندات" },
        href: "/admin/parametres/documents",
        icon: FileText,
        roles: ["ADMIN"],
      },
      {
        name: { fr: "Thème & Textures", en: "Theme & Textures", es: "Tema y Texturas", ar: "السمة والأنسجة" },
        href: "/admin/parametres/theme",
        icon: Palette,
        roles: ["ADMIN"],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// Sidebar Component
// ═══════════════════════════════════════════════════════════

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname();
  const { user, sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, isRTL } =
    useAdmin();
  const { logoHeader, siteName } = useSiteSettings();

  // Track expanded sections and subsections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["dashboard"]));
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set());

  // Filter navigation based on user role
  const filteredSections = navigationSections
    .filter((section) => section.roles.includes(user.role as UserRole))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(user.role as UserRole)),
      subsections: section.subsections
        ?.filter((subsection) => subsection.roles.includes(user.role as UserRole))
        .map((subsection) => ({
          ...subsection,
          items: subsection.items.filter((item) => item.roles.includes(user.role as UserRole)),
        }))
        .filter((subsection) => subsection.items.length > 0),
    }))
    .filter((section) => section.items.length > 0 || (section.subsections && section.subsections.length > 0));

  // Get localized name
  const getLocalizedName = (names: LocalizedString) => {
    return names[locale as keyof typeof names] || names.fr;
  };

  // Check if link is active
  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href}`;
    if (href === "/admin") {
      return pathname === localizedHref;
    }
    return pathname.startsWith(localizedHref);
  };

  // Check if section has active item (including subsections)
  const sectionHasActiveItem = (section: NavSection) => {
    const hasDirectActive = section.items.some((item) => isActive(item.href));
    const hasSubsectionActive = section.subsections?.some((subsection) =>
      subsection.items.some((item) => isActive(item.href))
    );
    return hasDirectActive || !!hasSubsectionActive;
  };

  // Check if subsection has active item
  const subsectionHasActiveItem = (subsection: NavSubSection) => {
    return subsection.items.some((item) => isActive(item.href));
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Toggle subsection expansion
  const toggleSubSection = (subsectionId: string) => {
    setExpandedSubSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subsectionId)) {
        newSet.delete(subsectionId);
      } else {
        newSet.add(subsectionId);
      }
      return newSet;
    });
  };

  // Auto-expand section with active item
  const isSectionExpanded = (section: NavSection) => {
    if (sidebarCollapsed) return false;
    return expandedSections.has(section.id) || sectionHasActiveItem(section);
  };

  // Auto-expand subsection with active item
  const isSubSectionExpanded = (subsection: NavSubSection) => {
    if (sidebarCollapsed) return false;
    return expandedSubSections.has(subsection.id) || subsectionHasActiveItem(subsection);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-50 h-full bg-amber-900 text-white transition-all duration-300 flex flex-col",
          isRTL ? "right-0" : "left-0",
          // Mobile: slide in/out
          sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full",
          // Desktop: always visible, collapsible width
          "lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-amber-800 px-4 flex-shrink-0">
          {!sidebarCollapsed && (
            <Link href={`/${locale}/admin`} className="flex items-center gap-2">
              {logoHeader ? (
                <img
                  src={logoHeader}
                  alt={siteName || "Logo"}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-amber-700",
                logoHeader && "hidden"
              )}>
                <span className="text-xl font-bold">LT</span>
              </span>
              <span className="text-lg font-semibold">{siteName || "Le Tatche Bois"}</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link href={`/${locale}/admin`} className="mx-auto block">
              {logoHeader ? (
                <img
                  src={logoHeader}
                  alt={siteName || "Logo"}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-amber-700",
                logoHeader && "hidden"
              )}>
                <span className="text-xl font-bold">LT</span>
              </span>
            </Link>
          )}

          {/* Mobile close button */}
          <button
            type="button"
            className="lg:hidden rounded-md p-1 hover:bg-amber-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search (when not collapsed) */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b border-amber-800 flex-shrink-0">
            <Link
              href={`/${locale}/admin/recherche`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-800/50 text-amber-200 hover:bg-amber-800 hover:text-white transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">
                {locale === "ar" ? "بحث..." : locale === "es" ? "Buscar..." : locale === "en" ? "Search..." : "Rechercher..."}
              </span>
              <kbd className="ml-auto text-xs bg-amber-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {filteredSections.map((section) => {
            // Single-item sections (like Dashboard) - render as single link
            if (section.items.length === 1 && section.id === "dashboard") {
              const dashboardItem = section.items[0];
              if (!dashboardItem) return null;
              const Icon = dashboardItem.icon;
              const active = isActive(dashboardItem.href);

              return (
                <div key={section.id} className="mb-1">
                  <Link
                    href={`/${locale}${dashboardItem.href}`}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-amber-800 text-white"
                        : "text-amber-100 hover:bg-amber-800/50 hover:text-white",
                      sidebarCollapsed && "justify-center"
                    )}
                    title={sidebarCollapsed ? getLocalizedName(dashboardItem.name) : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate">{getLocalizedName(dashboardItem.name)}</span>
                    )}
                  </Link>
                </div>
              );
            }

            // Multi-item sections - render as collapsible
            const SectionIcon = section.icon;
            const isExpanded = isSectionExpanded(section);
            const hasActive = sectionHasActiveItem(section);

            return (
              <div key={section.id} className="mb-1">
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => !sidebarCollapsed && toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    hasActive
                      ? "bg-amber-800/70 text-white"
                      : "text-amber-100 hover:bg-amber-800/50 hover:text-white",
                    sidebarCollapsed && "justify-center"
                  )}
                  title={sidebarCollapsed ? getLocalizedName(section.title) : undefined}
                >
                  <SectionIcon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="truncate flex-1 text-left">
                        {getLocalizedName(section.title)}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </button>

                {/* Section Content - Items or Subsections */}
                {isExpanded && !sidebarCollapsed && (
                  <div className="mt-1 space-y-0.5 pl-4">
                    {/* Direct Items */}
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={`/${locale}${item.href}`}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-amber-700 text-white"
                              : "text-amber-200 hover:bg-amber-800/50 hover:text-white"
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{getLocalizedName(item.name)}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    {/* Subsections */}
                    {section.subsections?.map((subsection) => {
                      const SubIcon = subsection.icon;
                      const isSubExpanded = isSubSectionExpanded(subsection);
                      const hasSubActive = subsectionHasActiveItem(subsection);

                      return (
                        <div key={subsection.id} className="space-y-0.5">
                          {/* Subsection Header */}
                          <button
                            type="button"
                            onClick={() => toggleSubSection(subsection.id)}
                            className={cn(
                              "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              hasSubActive
                                ? "bg-amber-800/50 text-white"
                                : "text-amber-200 hover:bg-amber-800/30 hover:text-white"
                            )}
                          >
                            <SubIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate flex-1 text-left">
                              {getLocalizedName(subsection.title)}
                            </span>
                            {isSubExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>

                          {/* Subsection Items */}
                          {isSubExpanded && (
                            <div className="space-y-0.5 pl-4">
                              {subsection.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                const href = item.external ? item.href : `/${locale}${item.href}`;

                                return (
                                  <Link
                                    key={item.href}
                                    href={href}
                                    onClick={() => setSidebarOpen(false)}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                    className={cn(
                                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors",
                                      active
                                        ? "bg-amber-700 text-white"
                                        : "text-amber-200 hover:bg-amber-800/50 hover:text-white"
                                    )}
                                  >
                                    <Icon className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{getLocalizedName(item.name)}</span>
                                    {item.badge && item.badge > 0 && (
                                      <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
                                        {item.badge > 99 ? "99+" : item.badge}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info & Collapse Toggle */}
        <div className="border-t border-amber-800 p-2 flex-shrink-0">
          {/* User info (when not collapsed) */}
          {!sidebarCollapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-amber-300 truncate">{user.email}</p>
            </div>
          )}

          {/* Collapse Toggle (Desktop only) */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-full items-center justify-center rounded-lg p-2 text-amber-100 hover:bg-amber-800/50 hover:text-white"
          >
            {sidebarCollapsed ? (
              isRTL ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )
            ) : isRTL ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
