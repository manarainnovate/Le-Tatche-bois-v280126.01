import type { UserRole } from "@prisma/client";

// ═══════════════════════════════════════════════════════════
// Permission Definitions
// ═══════════════════════════════════════════════════════════

export type Resource =
  | "products"
  | "projects"
  | "services"
  | "categories"
  | "orders"
  | "quotes"
  | "messages"
  | "users"
  | "settings"
  | "media"
  | "reports";

export type Action = "view" | "create" | "edit" | "delete" | "manage";

// ═══════════════════════════════════════════════════════════
// Role Permissions Matrix
// ═══════════════════════════════════════════════════════════

const rolePermissions: Record<UserRole, Record<Resource, Action[]>> = {
  ADMIN: {
    products: ["view", "create", "edit", "delete", "manage"],
    projects: ["view", "create", "edit", "delete", "manage"],
    services: ["view", "create", "edit", "delete", "manage"],
    categories: ["view", "create", "edit", "delete", "manage"],
    orders: ["view", "create", "edit", "delete", "manage"],
    quotes: ["view", "create", "edit", "delete", "manage"],
    messages: ["view", "create", "edit", "delete", "manage"],
    users: ["view", "create", "edit", "delete", "manage"],
    settings: ["view", "create", "edit", "delete", "manage"],
    media: ["view", "create", "edit", "delete", "manage"],
    reports: ["view", "create", "edit", "delete", "manage"],
  },
  MANAGER: {
    products: ["view", "create", "edit", "delete"],
    projects: ["view", "create", "edit", "delete"],
    services: ["view", "create", "edit", "delete"],
    categories: ["view", "create", "edit", "delete"],
    orders: ["view", "create", "edit", "manage"],
    quotes: ["view", "create", "edit", "manage"],
    messages: ["view", "create", "edit"],
    users: ["view"],
    settings: ["view", "edit"],
    media: ["view", "create", "edit", "delete"],
    reports: ["view", "create", "edit"],
  },
  COMMERCIAL: {
    products: ["view"],
    projects: ["view"],
    services: ["view"],
    categories: ["view"],
    orders: ["view", "create", "edit", "manage"],
    quotes: ["view", "create", "edit", "manage"],
    messages: ["view", "create", "edit"],
    users: [],
    settings: [],
    media: ["view"],
    reports: ["view"],
  },
  CHEF_ATELIER: {
    products: ["view", "edit"],
    projects: ["view", "create", "edit"],
    services: ["view"],
    categories: ["view"],
    orders: ["view"],
    quotes: ["view"],
    messages: ["view"],
    users: [],
    settings: [],
    media: ["view", "create"],
    reports: ["view"],
  },
  COMPTABLE: {
    products: ["view"],
    projects: ["view"],
    services: ["view"],
    categories: ["view"],
    orders: ["view", "edit"],
    quotes: ["view", "edit"],
    messages: ["view"],
    users: [],
    settings: ["view"],
    media: ["view"],
    reports: ["view", "create", "edit", "manage"],
  },
  READONLY: {
    products: ["view"],
    projects: ["view"],
    services: ["view"],
    categories: ["view"],
    orders: ["view"],
    quotes: ["view"],
    messages: ["view"],
    users: [],
    settings: [],
    media: ["view"],
    reports: ["view"],
  },
};

// ═══════════════════════════════════════════════════════════
// Permission Checking Functions
// ═══════════════════════════════════════════════════════════

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action
): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  const allowedActions = permissions[resource];
  if (!allowedActions) return false;

  // "manage" includes all actions
  if (allowedActions.includes("manage")) return true;

  return allowedActions.includes(action);
}

/**
 * Check if a role has any permission on a resource
 */
export function canAccess(role: UserRole, resource: Resource): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  const allowedActions = permissions[resource];
  return allowedActions && allowedActions.length > 0;
}

/**
 * Get all allowed actions for a role on a resource
 */
export function getAllowedActions(role: UserRole, resource: Resource): Action[] {
  const permissions = rolePermissions[role];
  if (!permissions) return [];

  return permissions[resource] || [];
}

/**
 * Check if a role is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Check if a role has any admin-level access
 */
export function hasAdminAccess(role: UserRole): boolean {
  return ["ADMIN", "MANAGER", "COMMERCIAL", "CHEF_ATELIER", "COMPTABLE"].includes(role);
}

// ═══════════════════════════════════════════════════════════
// Permission Assertion (for API routes)
// ═══════════════════════════════════════════════════════════

export interface PermissionError {
  allowed: false;
  error: string;
}

export interface PermissionSuccess {
  allowed: true;
}

export type PermissionResult = PermissionError | PermissionSuccess;

/**
 * Assert permission and return result
 */
export function assertPermission(
  role: UserRole | undefined,
  resource: Resource,
  action: Action
): PermissionResult {
  if (!role) {
    return { allowed: false, error: "Authentication required" };
  }

  if (!hasPermission(role, resource, action)) {
    return {
      allowed: false,
      error: `Permission denied: cannot ${action} ${resource}`,
    };
  }

  return { allowed: true };
}

// ═══════════════════════════════════════════════════════════
// Route Protection Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Get minimum roles required for a resource action
 */
export function getRequiredRoles(resource: Resource, action: Action): UserRole[] {
  const roles: UserRole[] = [];

  for (const role of Object.keys(rolePermissions) as UserRole[]) {
    if (hasPermission(role, resource, action)) {
      roles.push(role);
    }
  }

  return roles;
}

/**
 * Map route to required resource and action
 */
export function mapRouteToPermission(
  method: string,
  pathname: string
): { resource: Resource; action: Action } | null {
  // Extract resource from pathname
  const segments = pathname.split("/").filter(Boolean);

  // Find resource segment
  let resource: Resource | null = null;
  for (const segment of segments) {
    if (
      [
        "products",
        "projects",
        "services",
        "categories",
        "orders",
        "quotes",
        "messages",
        "users",
        "settings",
        "media",
        "reports",
      ].includes(segment)
    ) {
      resource = segment as Resource;
      break;
    }
  }

  if (!resource) return null;

  // Map HTTP method to action
  let action: Action;
  switch (method.toUpperCase()) {
    case "GET":
      action = "view";
      break;
    case "POST":
      action = "create";
      break;
    case "PUT":
    case "PATCH":
      action = "edit";
      break;
    case "DELETE":
      action = "delete";
      break;
    default:
      action = "view";
  }

  return { resource, action };
}

// ═══════════════════════════════════════════════════════════
// UI Permission Helpers (for conditional rendering)
// ═══════════════════════════════════════════════════════════

/**
 * Get permissions object for a role (for client-side checks)
 */
export function getPermissionsForRole(role: UserRole): Record<Resource, Action[]> {
  return rolePermissions[role] || {};
}

/**
 * Create a permissions checker for a specific role
 */
export function createPermissionChecker(role: UserRole) {
  return {
    can: (action: Action, resource: Resource) => hasPermission(role, resource, action),
    canAccess: (resource: Resource) => canAccess(role, resource),
    isAdmin: () => isAdmin(role),
    hasAdminAccess: () => hasAdminAccess(role),
  };
}
