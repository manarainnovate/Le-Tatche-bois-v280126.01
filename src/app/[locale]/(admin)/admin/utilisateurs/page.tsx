"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/AdminDataTable";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Utilisateurs",
    subtitle: "Gerez les utilisateurs de l'administration",
    newUser: "Nouvel utilisateur",
    search: "Rechercher par nom ou email...",
    all: "Tous",
    admins: "Administrateurs",
    editors: "Editeurs",
    sales: "Commerciaux",
    user: "Utilisateur",
    email: "Email",
    role: "Role",
    status: "Statut",
    createdAt: "Cree le",
    lastLogin: "Derniere connexion",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    confirmDelete: "Etes-vous sur de vouloir supprimer cet utilisateur ?",
    noUsers: "Aucun utilisateur",
    noUsersDesc: "Creez votre premier utilisateur",
    roleAdmin: "Admin",
    roleEditor: "Editeur",
    roleSales: "Commercial",
    active: "Actif",
    inactive: "Inactif",
    never: "Jamais",
    accessDenied: "Acces refuse",
    accessDeniedDesc: "Seuls les administrateurs peuvent acceder a cette page",
  },
  en: {
    title: "Users",
    subtitle: "Manage admin users",
    newUser: "New User",
    search: "Search by name or email...",
    all: "All",
    admins: "Administrators",
    editors: "Editors",
    sales: "Sales",
    user: "User",
    email: "Email",
    role: "Role",
    status: "Status",
    createdAt: "Created",
    lastLogin: "Last Login",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this user?",
    noUsers: "No users",
    noUsersDesc: "Create your first user",
    roleAdmin: "Admin",
    roleEditor: "Editor",
    roleSales: "Sales",
    active: "Active",
    inactive: "Inactive",
    never: "Never",
    accessDenied: "Access Denied",
    accessDeniedDesc: "Only administrators can access this page",
  },
  es: {
    title: "Usuarios",
    subtitle: "Gestiona los usuarios de administracion",
    newUser: "Nuevo Usuario",
    search: "Buscar por nombre o email...",
    all: "Todos",
    admins: "Administradores",
    editors: "Editores",
    sales: "Ventas",
    user: "Usuario",
    email: "Email",
    role: "Rol",
    status: "Estado",
    createdAt: "Creado",
    lastLogin: "Ultimo acceso",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    confirmDelete: "Esta seguro de eliminar este usuario?",
    noUsers: "Sin usuarios",
    noUsersDesc: "Crea tu primer usuario",
    roleAdmin: "Admin",
    roleEditor: "Editor",
    roleSales: "Ventas",
    active: "Activo",
    inactive: "Inactivo",
    never: "Nunca",
    accessDenied: "Acceso Denegado",
    accessDeniedDesc: "Solo los administradores pueden acceder a esta pagina",
  },
  ar: {
    title: "المستخدمون",
    subtitle: "إدارة مستخدمي الإدارة",
    newUser: "مستخدم جديد",
    search: "البحث بالاسم أو البريد الإلكتروني...",
    all: "الكل",
    admins: "المدراء",
    editors: "المحررون",
    sales: "المبيعات",
    user: "المستخدم",
    email: "البريد الإلكتروني",
    role: "الدور",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    lastLogin: "آخر دخول",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا المستخدم؟",
    noUsers: "لا يوجد مستخدمون",
    noUsersDesc: "أنشئ أول مستخدم",
    roleAdmin: "مدير",
    roleEditor: "محرر",
    roleSales: "مبيعات",
    active: "نشط",
    inactive: "غير نشط",
    never: "أبداً",
    accessDenied: "الوصول مرفوض",
    accessDeniedDesc: "يمكن للمدراء فقط الوصول لهذه الصفحة",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type UserRole = "ADMIN" | "EDITOR" | "SALES";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface PageProps {
  params: { locale: string };
  searchParams: { role?: string };
}

// ═══════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════

const mockUsers: UserData[] = [
  {
    id: "1",
    name: "Ahmed Benali",
    email: "ahmed@letatche-bois.ma",
    role: "ADMIN",
    avatar: null,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    lastLoginAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Fatima Zohra",
    email: "fatima@letatche-bois.ma",
    role: "EDITOR",
    avatar: null,
    isActive: true,
    createdAt: new Date("2024-01-05"),
    lastLoginAt: new Date("2024-01-19"),
  },
  {
    id: "3",
    name: "Mohammed El Amrani",
    email: "mohammed@letatche-bois.ma",
    role: "SALES",
    avatar: null,
    isActive: true,
    createdAt: new Date("2024-01-10"),
    lastLoginAt: new Date("2024-01-18"),
  },
  {
    id: "4",
    name: "Karim Idrissi",
    email: "karim@letatche-bois.ma",
    role: "SALES",
    avatar: null,
    isActive: false,
    createdAt: new Date("2024-01-12"),
    lastLoginAt: null,
  },
];

// ═══════════════════════════════════════════════════════════
// Users Page
// ═══════════════════════════════════════════════════════════

export default function UsersPage({ params, searchParams }: PageProps) {
  const { locale } = params;
  const { role: roleFilter } = searchParams;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole] = useState<UserRole>("ADMIN"); // In production, get from session

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUsers(mockUsers);
      setLoading(false);
    };
    void loadUsers();
  }, []);

  // Filter users by role
  const filteredUsers = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter((u) => u.role === roleFilter.toUpperCase());
  }, [users, roleFilter]);

  // Stats
  const stats = {
    all: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    editors: users.filter((u) => u.role === "EDITOR").length,
    sales: users.filter((u) => u.role === "SALES").length,
  };

  // Handle delete
  const handleDelete = (userId: string) => {
    if (confirm(t.confirmDelete)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return t.never;
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Role badge
  const getRoleBadge = (role: UserRole) => {
    const config = {
      ADMIN: {
        label: t.roleAdmin,
        icon: ShieldCheck,
        className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      },
      EDITOR: {
        label: t.roleEditor,
        icon: Shield,
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
      SALES: {
        label: t.roleSales,
        icon: ShieldAlert,
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      },
    };
    const { label, icon: Icon, className } = config[role];
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", className)}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  // Check access (ADMIN only)
  if (currentUserRole !== "ADMIN") {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-16 w-16 text-red-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            {t.accessDenied}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t.accessDeniedDesc}
          </p>
        </div>
      </div>
    );
  }

  // Table columns
  const columns: Column<UserData>[] = [
    {
      key: "user",
      header: t.user,
      sortable: false,
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <User className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: t.role,
      sortable: true,
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: "isActive",
      header: t.status,
      sortable: true,
      render: (user) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            user.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          )}
        >
          {user.isActive ? (
            <>
              <CheckCircle className="h-3 w-3" />
              {t.active}
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              {t.inactive}
            </>
          )}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t.createdAt,
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      header: t.lastLogin,
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(user.lastLoginAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: t.actions,
      sortable: false,
      render: (user) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/utilisateurs/${user.id}`}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-gray-700"
            title={t.edit}
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(user.id)}
            className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20"
            title={t.delete}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/utilisateurs/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          {t.newUser}
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: undefined, label: t.all, count: stats.all },
          { key: "admin", label: t.admins, count: stats.admins },
          { key: "editor", label: t.editors, count: stats.editors },
          { key: "sales", label: t.sales, count: stats.sales },
        ].map((tab) => (
          <Link
            key={tab.key ?? "all"}
            href={tab.key ? `/${locale}/admin/utilisateurs?role=${tab.key}` : `/${locale}/admin/utilisateurs`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              roleFilter === tab.key || (!roleFilter && !tab.key)
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                roleFilter === tab.key || (!roleFilter && !tab.key)
                  ? "bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : filteredUsers.length > 0 ? (
        <AdminDataTable<UserData>
          columns={columns}
          data={filteredUsers}
          keyField="id"
          searchPlaceholder={t.search}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t.noUsers}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t.noUsersDesc}
          </p>
          <Link
            href={`/${locale}/admin/utilisateurs/new`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            {t.newUser}
          </Link>
        </div>
      )}
    </div>
  );
}
