import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface SearchResult {
  id: string;
  type: "lead" | "client" | "project" | "document" | "product" | "user";
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  href: string;
}

// ═══════════════════════════════════════════════════════════
// Status Badge Colors
// ═══════════════════════════════════════════════════════════

const leadStatusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-purple-100 text-purple-700",
  VISIT_SCHEDULED: "bg-yellow-100 text-yellow-700",
  MEASURES_TAKEN: "bg-teal-100 text-teal-700",
  QUOTE_SENT: "bg-orange-100 text-orange-700",
  NEGOTIATION: "bg-pink-100 text-pink-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

const projectStatusColors: Record<string, string> = {
  STUDY: "bg-blue-100 text-blue-700",
  MEASURES: "bg-purple-100 text-purple-700",
  QUOTE: "bg-yellow-100 text-yellow-700",
  PENDING: "bg-gray-100 text-gray-700",
  PRODUCTION: "bg-orange-100 text-orange-700",
  READY: "bg-teal-100 text-teal-700",
  DELIVERY: "bg-violet-100 text-violet-700",
  INSTALLATION: "bg-pink-100 text-pink-700",
  COMPLETED: "bg-green-100 text-green-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const documentStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  DELIVERED: "bg-teal-100 text-teal-700",
  SIGNED: "bg-indigo-100 text-indigo-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

// ═══════════════════════════════════════════════════════════
// GET /api/search - Global search across CRM entities
// ═══════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (!query || query.length < 2) {
      return apiSuccess({ results: [] });
    }

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    // Search in parallel
    const [leads, clients, projects, documents, catalogItems, users] = await Promise.all([
      // Leads
      prisma.lead.findMany({
        where: {
          OR: [
            { leadNumber: { contains: query, mode: "insensitive" } },
            { fullName: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          leadNumber: true,
          fullName: true,
          company: true,
          status: true,
          phone: true,
        },
      }),

      // Clients
      prisma.cRMClient.findMany({
        where: {
          OR: [
            { clientNumber: { contains: query, mode: "insensitive" } },
            { fullName: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          clientNumber: true,
          fullName: true,
          company: true,
          phone: true,
        },
      }),

      // Projects
      prisma.cRMProject.findMany({
        where: {
          OR: [
            { projectNumber: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          projectNumber: true,
          name: true,
          status: true,
          client: { select: { fullName: true } },
        },
      }),

      // Documents
      prisma.cRMDocument.findMany({
        where: {
          OR: [
            { number: { contains: query, mode: "insensitive" } },
            { clientName: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          number: true,
          type: true,
          status: true,
          clientName: true,
        },
      }),

      // Catalog items
      prisma.catalogItem.findMany({
        where: {
          OR: [
            { sku: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          sku: true,
          name: true,
          type: true,
        },
      }),

      // Users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ]);

    // Map leads
    for (const lead of leads) {
      results.push({
        id: lead.id,
        type: "lead",
        title: lead.fullName,
        subtitle: lead.company || lead.phone || lead.leadNumber,
        badge: lead.status,
        badgeColor: leadStatusColors[lead.status] || "bg-gray-100 text-gray-700",
        href: `/admin/leads/${lead.id}`,
      });
    }

    // Map clients
    for (const client of clients) {
      results.push({
        id: client.id,
        type: "client",
        title: client.fullName,
        subtitle: client.company || client.phone || client.clientNumber,
        href: `/admin/clients/${client.id}`,
      });
    }

    // Map projects
    for (const project of projects) {
      results.push({
        id: project.id,
        type: "project",
        title: project.name,
        subtitle: project.client?.fullName || project.projectNumber,
        badge: project.status,
        badgeColor: projectStatusColors[project.status] || "bg-gray-100 text-gray-700",
        href: `/admin/projets/${project.id}`,
      });
    }

    // Map documents
    for (const doc of documents) {
      const typeMap: Record<string, string> = {
        DEVIS: "/admin/devis",
        BON_COMMANDE: "/admin/bons-commande",
        BON_LIVRAISON: "/admin/bons-livraison",
        PV_RECEPTION: "/admin/pv-reception",
        FACTURE: "/admin/factures",
        AVOIR: "/admin/avoirs",
      };

      results.push({
        id: doc.id,
        type: "document",
        title: doc.number,
        subtitle: `${doc.type} - ${doc.clientName}`,
        badge: doc.status,
        badgeColor: documentStatusColors[doc.status] || "bg-gray-100 text-gray-700",
        href: `${typeMap[doc.type] || "/admin/documents"}/${doc.id}`,
      });
    }

    // Map catalog items
    for (const item of catalogItems) {
      results.push({
        id: item.id,
        type: "product",
        title: item.name,
        subtitle: item.sku,
        badge: item.type,
        badgeColor: item.type === "PRODUCT" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700",
        href: `/admin/catalogue/${item.type === "PRODUCT" ? "produits" : "services"}/${item.id}`,
      });
    }

    // Map users
    for (const user of users) {
      results.push({
        id: user.id,
        type: "user",
        title: user.name ?? user.email,
        subtitle: user.email,
        badge: user.role,
        badgeColor: "bg-gray-100 text-gray-700",
        href: `/admin/utilisateurs/${user.id}`,
      });
    }

    return apiSuccess({ results });
  } catch (error) {
    return handleApiError(error, "Search");
  }
}
