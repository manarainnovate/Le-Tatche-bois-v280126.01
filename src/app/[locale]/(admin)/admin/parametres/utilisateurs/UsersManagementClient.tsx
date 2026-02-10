"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  User,
  Mail,
  Shield,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserPlus,
  X,
  AlertCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
  createdAt: Date;
  emailVerified: Date | null;
}

interface UsersManagementClientProps {
  users: UserData[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, any> = {
  fr: {
    title: "Gestion des utilisateurs",
    back: "Retour",
    addUser: "Ajouter un utilisateur",
    search: "Rechercher...",
    name: "Nom",
    email: "Email",
    role: "Rôle",
    status: "Statut",
    createdAt: "Créé le",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    verified: "Vérifié",
    notVerified: "Non vérifié",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    noUsers: "Aucun utilisateur trouvé",
    roles: {
      ADMIN: "Administrateur",
      MANAGER: "Gestionnaire",
      USER: "Utilisateur",
      ACCOUNTANT: "Comptable",
    },
    newUser: "Nouvel utilisateur",
    cancel: "Annuler",
    save: "Enregistrer",
    saving: "Enregistrement...",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    userCreated: "Utilisateur créé avec succès",
    error: "Une erreur s'est produite",
  },
  en: {
    title: "User Management",
    back: "Back",
    addUser: "Add user",
    search: "Search...",
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    createdAt: "Created",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    verified: "Verified",
    notVerified: "Not verified",
    confirmDelete: "Are you sure you want to delete this user?",
    noUsers: "No users found",
    roles: {
      ADMIN: "Administrator",
      MANAGER: "Manager",
      USER: "User",
      ACCOUNTANT: "Accountant",
    },
    newUser: "New user",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordMismatch: "Passwords do not match",
    userCreated: "User created successfully",
    error: "An error occurred",
  },
  es: {
    title: "Gestión de usuarios",
    back: "Volver",
    addUser: "Agregar usuario",
    search: "Buscar...",
    name: "Nombre",
    email: "Email",
    role: "Rol",
    status: "Estado",
    createdAt: "Creado",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    verified: "Verificado",
    notVerified: "No verificado",
    confirmDelete: "¿Está seguro de que desea eliminar este usuario?",
    noUsers: "No se encontraron usuarios",
    roles: {
      ADMIN: "Administrador",
      MANAGER: "Gerente",
      USER: "Usuario",
      ACCOUNTANT: "Contador",
    },
    newUser: "Nuevo usuario",
    cancel: "Cancelar",
    save: "Guardar",
    saving: "Guardando...",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    passwordMismatch: "Las contraseñas no coinciden",
    userCreated: "Usuario creado con éxito",
    error: "Ocurrió un error",
  },
  ar: {
    title: "إدارة المستخدمين",
    back: "رجوع",
    addUser: "إضافة مستخدم",
    search: "بحث...",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    verified: "موثق",
    notVerified: "غير موثق",
    confirmDelete: "هل أنت متأكد من حذف هذا المستخدم؟",
    noUsers: "لا يوجد مستخدمون",
    roles: {
      ADMIN: "مدير",
      MANAGER: "مشرف",
      USER: "مستخدم",
      ACCOUNTANT: "محاسب",
    },
    newUser: "مستخدم جديد",
    cancel: "إلغاء",
    save: "حفظ",
    saving: "جاري الحفظ...",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    passwordMismatch: "كلمات المرور غير متطابقة",
    userCreated: "تم إنشاء المستخدم بنجاح",
    error: "حدث خطأ",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function UsersManagementClient({
  users,
  locale,
}: UsersManagementClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const isRTL = locale === "ar";

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "MANAGER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "ACCOUNTANT":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newUser.password !== newUser.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setNewUser({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "USER",
        });
        router.refresh();
      } else {
        setError(data.error || t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 ${isRTL ? "rtl" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/parametres`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <UserPlus className="h-5 w-5" />
          {t.addUser}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.name}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.email}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.role}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.status}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.createdAt}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t.noUsers}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name || ""}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {t.roles[user.role as keyof typeof t.roles] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          {t.verified}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <XCircle className="h-4 w-4" />
                          {t.notVerified}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deleting === user.id}
                          className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                          title={t.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t.newUser}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.name} *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.role} *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="USER">{t.roles.USER}</option>
                  <option value="ACCOUNTANT">{t.roles.ACCOUNTANT}</option>
                  <option value="MANAGER">{t.roles.MANAGER}</option>
                  <option value="ADMIN">{t.roles.ADMIN}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.password} *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.confirmPassword} *
                </label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) =>
                    setNewUser({ ...newUser, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    t.save
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
