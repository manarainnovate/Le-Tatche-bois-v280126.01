export const dynamic = 'force-dynamic';


import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatsCard, StatsCardSkeleton } from "@/components/admin/StatsCard";
import {
  ChartContainer,
  OrdersChart,
  ChartSkeleton,
} from "@/components/admin/DashboardChart";
import { Target, Users, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/Button";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    welcome: "Bienvenue",
    dashboard: "Tableau de bord",
    overview: "Vue d'ensemble de votre activite",
    newOrders: "Nouvelles commandes",
    today: "Aujourd'hui",
    revenueToday: "Revenu aujourd'hui",
    revenueWeek: "Revenu cette semaine",
    revenueMonth: "Revenu ce mois",
    pendingQuotes: "Devis en attente",
    unreadMessages: "Messages non lus",
    salesOverview: "Apercu des ventes",
    last30Days: "30 derniers jours",
    ordersByStatus: "Commandes par statut",
    currentMonth: "Mois en cours",
    quickActions: "Actions rapides",
    addProduct: "Ajouter un produit",
    addProject: "Ajouter un projet",
    viewOrders: "Voir les commandes",
    vsYesterday: "vs hier",
    vsLastWeek: "vs semaine derniere",
    vsLastMonth: "vs mois dernier",
    // CRM Stats
    newLeads: "Nouveaux leads",
    activeClients: "Clients actifs",
    projectsInProgress: "Projets en cours",
    pendingDevis: "Devis en attente",
    unpaidInvoices: "Factures impayees",
    thisMonth: "Ce mois",
    crmOverview: "CRM",
    ecommerceOverview: "E-commerce",
    leadsByStatus: "Leads par statut",
    projectsByStatus: "Projets par statut",
    viewLeads: "Voir les leads",
    viewClients: "Voir les clients",
    viewProjects: "Voir les projets",
    newLead: "Nouveau lead",
    newClient: "Nouveau client",
    newProject: "Nouveau projet",
  },
  en: {
    welcome: "Welcome",
    dashboard: "Dashboard",
    overview: "Overview of your activity",
    newOrders: "New Orders",
    today: "Today",
    revenueToday: "Revenue Today",
    revenueWeek: "Revenue This Week",
    revenueMonth: "Revenue This Month",
    pendingQuotes: "Pending Quotes",
    unreadMessages: "Unread Messages",
    salesOverview: "Sales Overview",
    last30Days: "Last 30 days",
    ordersByStatus: "Orders by Status",
    currentMonth: "Current month",
    quickActions: "Quick Actions",
    addProduct: "Add Product",
    addProject: "Add Project",
    viewOrders: "View Orders",
    vsYesterday: "vs yesterday",
    vsLastWeek: "vs last week",
    vsLastMonth: "vs last month",
    // CRM Stats
    newLeads: "New Leads",
    activeClients: "Active Clients",
    projectsInProgress: "Projects in Progress",
    pendingDevis: "Pending Quotes",
    unpaidInvoices: "Unpaid Invoices",
    thisMonth: "This month",
    crmOverview: "CRM",
    ecommerceOverview: "E-commerce",
    leadsByStatus: "Leads by Status",
    projectsByStatus: "Projects by Status",
    viewLeads: "View Leads",
    viewClients: "View Clients",
    viewProjects: "View Projects",
    newLead: "New Lead",
    newClient: "New Client",
    newProject: "New Project",
  },
  es: {
    welcome: "Bienvenido",
    dashboard: "Panel",
    overview: "Resumen de tu actividad",
    newOrders: "Nuevos pedidos",
    today: "Hoy",
    revenueToday: "Ingresos hoy",
    revenueWeek: "Ingresos esta semana",
    revenueMonth: "Ingresos este mes",
    pendingQuotes: "Presupuestos pendientes",
    unreadMessages: "Mensajes sin leer",
    salesOverview: "Resumen de ventas",
    last30Days: "Ultimos 30 dias",
    ordersByStatus: "Pedidos por estado",
    currentMonth: "Mes actual",
    quickActions: "Acciones rapidas",
    addProduct: "Agregar producto",
    addProject: "Agregar proyecto",
    viewOrders: "Ver pedidos",
    vsYesterday: "vs ayer",
    vsLastWeek: "vs semana pasada",
    vsLastMonth: "vs mes pasado",
    // CRM Stats
    newLeads: "Nuevos prospectos",
    activeClients: "Clientes activos",
    projectsInProgress: "Proyectos en curso",
    pendingDevis: "Presupuestos pendientes",
    unpaidInvoices: "Facturas pendientes",
    thisMonth: "Este mes",
    crmOverview: "CRM",
    ecommerceOverview: "E-commerce",
    leadsByStatus: "Prospectos por estado",
    projectsByStatus: "Proyectos por estado",
    viewLeads: "Ver prospectos",
    viewClients: "Ver clientes",
    viewProjects: "Ver proyectos",
    newLead: "Nuevo prospecto",
    newClient: "Nuevo cliente",
    newProject: "Nuevo proyecto",
  },
  ar: {
    welcome: "مرحبا",
    dashboard: "لوحة التحكم",
    overview: "نظرة عامة على نشاطك",
    newOrders: "طلبات جديدة",
    today: "اليوم",
    revenueToday: "الإيرادات اليوم",
    revenueWeek: "الإيرادات هذا الأسبوع",
    revenueMonth: "الإيرادات هذا الشهر",
    pendingQuotes: "عروض أسعار معلقة",
    unreadMessages: "رسائل غير مقروءة",
    salesOverview: "نظرة عامة على المبيعات",
    last30Days: "آخر 30 يوما",
    ordersByStatus: "الطلبات حسب الحالة",
    currentMonth: "الشهر الحالي",
    quickActions: "إجراءات سريعة",
    addProduct: "إضافة منتج",
    addProject: "إضافة مشروع",
    viewOrders: "عرض الطلبات",
    vsYesterday: "مقابل أمس",
    vsLastWeek: "مقابل الأسبوع الماضي",
    vsLastMonth: "مقابل الشهر الماضي",
    // CRM Stats
    newLeads: "عملاء محتملون جدد",
    activeClients: "العملاء النشطون",
    projectsInProgress: "المشاريع قيد التنفيذ",
    pendingDevis: "عروض أسعار معلقة",
    unpaidInvoices: "فواتير غير مدفوعة",
    thisMonth: "هذا الشهر",
    crmOverview: "إدارة العملاء",
    ecommerceOverview: "التجارة الإلكترونية",
    leadsByStatus: "العملاء المحتملون حسب الحالة",
    projectsByStatus: "المشاريع حسب الحالة",
    viewLeads: "عرض العملاء المحتملين",
    viewClients: "عرض العملاء",
    viewProjects: "عرض المشاريع",
    newLead: "عميل محتمل جديد",
    newClient: "عميل جديد",
    newProject: "مشروع جديد",
  },
};

const leadStatusTranslations = {
  fr: {
    NEW: "Nouveau",
    CONTACTED: "Contacté",
    VISIT_SCHEDULED: "Visite prévue",
    MEASURES_TAKEN: "Mesures prises",
    QUOTE_SENT: "Devis envoyé",
    NEGOTIATION: "Négociation",
    WON: "Gagné",
    LOST: "Perdu",
  },
  en: {
    NEW: "New",
    CONTACTED: "Contacted",
    VISIT_SCHEDULED: "Visit Scheduled",
    MEASURES_TAKEN: "Measures Taken",
    QUOTE_SENT: "Quote Sent",
    NEGOTIATION: "Negotiation",
    WON: "Won",
    LOST: "Lost",
  },
  es: {
    NEW: "Nuevo",
    CONTACTED: "Contactado",
    VISIT_SCHEDULED: "Visita programada",
    MEASURES_TAKEN: "Medidas tomadas",
    QUOTE_SENT: "Presupuesto enviado",
    NEGOTIATION: "Negociación",
    WON: "Ganado",
    LOST: "Perdido",
  },
  ar: {
    NEW: "جديد",
    CONTACTED: "تم الاتصال",
    VISIT_SCHEDULED: "زيارة مجدولة",
    MEASURES_TAKEN: "تم القياس",
    QUOTE_SENT: "تم إرسال العرض",
    NEGOTIATION: "مفاوضة",
    WON: "مكسوب",
    LOST: "خاسر",
  },
};

const projectStatusTranslations = {
  fr: {
    STUDY: "Étude",
    MEASURES: "Mesures",
    QUOTE: "Devis",
    PENDING: "En attente",
    PRODUCTION: "Production",
    READY: "Prêt",
    DELIVERY: "Livraison",
    INSTALLATION: "Pose",
    COMPLETED: "Terminé",
    RECEIVED: "Réceptionné",
    CLOSED: "Clôturé",
    CANCELLED: "Annulé",
  },
  en: {
    STUDY: "Study",
    MEASURES: "Measures",
    QUOTE: "Quote",
    PENDING: "Pending",
    PRODUCTION: "Production",
    READY: "Ready",
    DELIVERY: "Delivery",
    INSTALLATION: "Installation",
    COMPLETED: "Completed",
    RECEIVED: "Received",
    CLOSED: "Closed",
    CANCELLED: "Cancelled",
  },
  es: {
    STUDY: "Estudio",
    MEASURES: "Medidas",
    QUOTE: "Presupuesto",
    PENDING: "Pendiente",
    PRODUCTION: "Producción",
    READY: "Listo",
    DELIVERY: "Entrega",
    INSTALLATION: "Instalación",
    COMPLETED: "Completado",
    RECEIVED: "Recibido",
    CLOSED: "Cerrado",
    CANCELLED: "Cancelado",
  },
  ar: {
    STUDY: "دراسة",
    MEASURES: "قياسات",
    QUOTE: "عرض سعر",
    PENDING: "في الانتظار",
    PRODUCTION: "إنتاج",
    READY: "جاهز",
    DELIVERY: "توصيل",
    INSTALLATION: "تركيب",
    COMPLETED: "مكتمل",
    RECEIVED: "مستلم",
    CLOSED: "مغلق",
    CANCELLED: "ملغى",
  },
};

// ═══════════════════════════════════════════════════════════
// CRM Dashboard Stats
// ═══════════════════════════════════════════════════════════

async function getCRMStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    newLeadsThisMonth,
    newLeadsLastMonth,
    totalClients,
    projectsInProgress,
    leadsByStatus,
    projectsByStatus,
    pendingDevis,
    unpaidInvoices,
    recentLeads,
    recentClients,
    recentProjects,
  ] = await Promise.all([
    // New leads this month
    prisma.lead.count({
      where: { createdAt: { gte: monthStart } },
    }),
    // New leads last month
    prisma.lead.count({
      where: {
        createdAt: { gte: lastMonthStart, lt: monthStart },
      },
    }),
    // Total clients
    prisma.cRMClient.count(),
    // Projects in progress (not completed/cancelled/closed)
    prisma.cRMProject.count({
      where: {
        status: {
          notIn: ["COMPLETED", "RECEIVED", "CLOSED", "CANCELLED"],
        },
      },
    }),
    // Leads by status
    prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // Projects by status
    prisma.cRMProject.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // Pending devis (CRM documents)
    prisma.cRMDocument.count({
      where: {
        type: "DEVIS",
        status: { in: ["DRAFT", "SENT", "VIEWED"] },
      },
    }),
    // Unpaid invoices
    prisma.cRMDocument.count({
      where: {
        type: "FACTURE",
        status: { in: ["SENT", "VIEWED", "PARTIAL", "OVERDUE"] },
      },
    }),
    // Recent leads
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        leadNumber: true,
        fullName: true,
        company: true,
        status: true,
        source: true,
        createdAt: true,
      },
    }),
    // Recent clients
    prisma.cRMClient.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientNumber: true,
        fullName: true,
        company: true,
        phone: true,
        createdAt: true,
      },
    }),
    // Recent projects
    prisma.cRMProject.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        projectNumber: true,
        name: true,
        status: true,
        createdAt: true,
        client: {
          select: { fullName: true },
        },
      },
    }),
  ]);

  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    newLeadsThisMonth,
    leadsTrend: calcTrend(newLeadsThisMonth, newLeadsLastMonth),
    totalClients,
    projectsInProgress,
    pendingDevis,
    unpaidInvoices,
    leadsByStatus: leadsByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    projectsByStatus: projectsByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    recentLeads,
    recentClients,
    recentProjects,
  };
}

// ═══════════════════════════════════════════════════════════
// CRM Stats Cards Component
// ═══════════════════════════════════════════════════════════

async function CRMDashboardStats({ locale }: { locale: string }) {
  const stats = await getCRMStats();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Users className="h-5 w-5 text-amber-600" />
        {t.crmOverview}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          title={t.newLeads}
          value={stats.newLeadsThisMonth}
          subtitle={t.thisMonth}
          icon="Target"
          variant={stats.newLeadsThisMonth > 0 ? "warning" : "default"}
          trend={{
            value: stats.leadsTrend,
            label: t.vsLastMonth,
            isPositive: stats.leadsTrend >= 0,
          }}
        />
        <StatsCard
          title={t.activeClients}
          value={stats.totalClients}
          icon="Users"
          variant="info"
        />
        <StatsCard
          title={t.projectsInProgress}
          value={stats.projectsInProgress}
          icon="FolderKanban"
          variant={stats.projectsInProgress > 0 ? "success" : "default"}
        />
        <StatsCard
          title={t.pendingDevis}
          value={stats.pendingDevis}
          icon="FileText"
          variant={stats.pendingDevis > 0 ? "warning" : "default"}
        />
        <StatsCard
          title={t.unpaidInvoices}
          value={stats.unpaidInvoices}
          icon="Receipt"
          variant={stats.unpaidInvoices > 0 ? "danger" : "default"}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CRM Charts Component
// ═══════════════════════════════════════════════════════════

async function CRMDashboardCharts({ locale }: { locale: string }) {
  const stats = await getCRMStats();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const leadStatusT =
    leadStatusTranslations[locale as keyof typeof leadStatusTranslations] ?? leadStatusTranslations.fr;
  const projectStatusT =
    projectStatusTranslations[locale as keyof typeof projectStatusTranslations] ?? projectStatusTranslations.fr;

  const leadStatusColors: Record<string, string> = {
    NEW: "#3b82f6",
    CONTACTED: "#8b5cf6",
    VISIT_SCHEDULED: "#f59e0b",
    MEASURES_TAKEN: "#14b8a6",
    QUOTE_SENT: "#f97316",
    NEGOTIATION: "#ec4899",
    WON: "#22c55e",
    LOST: "#ef4444",
  };

  const projectStatusColors: Record<string, string> = {
    STUDY: "#3b82f6",
    MEASURES: "#8b5cf6",
    QUOTE: "#f59e0b",
    PENDING: "#6b7280",
    PRODUCTION: "#f97316",
    READY: "#14b8a6",
    DELIVERY: "#a855f7",
    INSTALLATION: "#ec4899",
    COMPLETED: "#22c55e",
    RECEIVED: "#10b981",
    CLOSED: "#6b7280",
    CANCELLED: "#ef4444",
  };

  const leadsChartData = stats.leadsByStatus.map((s) => ({
    name: leadStatusT[s.status as keyof typeof leadStatusT] ?? s.status,
    value: s.count,
    color: leadStatusColors[s.status] ?? "#6b7280",
  }));

  const projectsChartData = stats.projectsByStatus.map((s) => ({
    name: projectStatusT[s.status as keyof typeof projectStatusT] ?? s.status,
    value: s.count,
    color: projectStatusColors[s.status] ?? "#6b7280",
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartContainer title={t.leadsByStatus} subtitle={t.currentMonth}>
        <OrdersChart data={leadsChartData} />
      </ChartContainer>
      <ChartContainer title={t.projectsByStatus} subtitle={t.currentMonth}>
        <OrdersChart data={projectsChartData} />
      </ChartContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const userName = session?.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.welcome}, {userName}!
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t.overview}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/admin/leads/new`}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md gap-1.5"
          >
            <Target className="me-2 h-4 w-4" />
            {t.newLead}
          </Link>
          <Link
            href={`/${locale}/admin/clients/new`}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 border-2 border-wood-primary text-wood-primary bg-transparent hover:bg-wood-primary hover:text-white h-8 px-3 text-sm rounded-md gap-1.5"
          >
            <Users className="me-2 h-4 w-4" />
            {t.newClient}
          </Link>
          <Link
            href={`/${locale}/admin/projets/new`}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 bg-gradient-to-r from-wood-primary to-wood-secondary text-white shadow-md hover:brightness-110 h-8 px-3 text-sm rounded-md gap-1.5"
          >
            <FolderKanban className="me-2 h-4 w-4" />
            {t.newProject}
          </Link>
        </div>
      </div>

      {/* CRM Stats Cards */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <CRMDashboardStats locale={locale} />
      </Suspense>

      {/* CRM Charts */}
      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        }
      >
        <CRMDashboardCharts locale={locale} />
      </Suspense>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Dashboard",
};
