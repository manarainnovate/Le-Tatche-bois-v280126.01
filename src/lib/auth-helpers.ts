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

export async function requireEditor() {
  return requireRole(["ADMIN", "EDITOR"]);
}

export async function requireSales() {
  return requireRole(["ADMIN", "SALES"]);
}

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageContent(role: UserRole): boolean {
  return ["ADMIN", "EDITOR"].includes(role);
}

export function canManageOrders(role: UserRole): boolean {
  return ["ADMIN", "SALES"].includes(role);
}

export function canManageQuotes(role: UserRole): boolean {
  return ["ADMIN", "SALES"].includes(role);
}
