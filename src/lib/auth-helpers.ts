import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session.user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect("/admin?error=unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireManager() {
  return requireRole(["ADMIN", "MANAGER"]);
}

export async function requireCommercial() {
  return requireRole(["ADMIN", "MANAGER", "COMMERCIAL"]);
}

export async function requireChefAtelier() {
  return requireRole(["ADMIN", "MANAGER", "CHEF_ATELIER"]);
}

export async function requireComptable() {
  return requireRole(["ADMIN", "MANAGER", "COMPTABLE"]);
}

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageContent(role: UserRole): boolean {
  return ["ADMIN", "MANAGER"].includes(role);
}

export function canManageOrders(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "COMMERCIAL"].includes(role);
}

export function canManageQuotes(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "COMMERCIAL"].includes(role);
}

export function canManageProjects(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "CHEF_ATELIER"].includes(role);
}

export function canManageFinance(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "COMPTABLE"].includes(role);
}
