"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
  Save,
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToUsers: "Retour aux utilisateurs",
    newUser: "Nouvel utilisateur",
    editUser: "Modifier l'utilisateur",
    personalInfo: "Informations personnelles",
    name: "Nom complet",
    namePlaceholder: "Jean Dupont",
    email: "Email",
    emailPlaceholder: "jean@example.com",
    security: "Securite",
    password: "Mot de passe",
    passwordPlaceholder: "Entrez le mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    confirmPasswordPlaceholder: "Confirmez le mot de passe",
    passwordHelp: "Minimum 8 caracteres",
    passwordOptional: "Laissez vide pour conserver le mot de passe actuel",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    role: "Role",
    selectRole: "Selectionner un role",
    roleAdmin: "Administrateur",
    roleEditor: "Editeur",
    roleSales: "Commercial",
    roleAdminDesc: "Acces complet a toutes les fonctionnalites",
    roleEditorDesc: "Gestion des produits, projets, services, categories, medias",
    roleSalesDesc: "Gestion des commandes, devis, messages",
    avatar: "Photo de profil",
    uploadAvatar: "Telecharger une photo",
    removeAvatar: "Supprimer",
    status: "Statut",
    active: "Actif",
    inactive: "Inactif",
    activeHelp: "L'utilisateur peut se connecter",
    save: "Enregistrer",
    saving: "Enregistrement...",
    cancel: "Annuler",
    showPassword: "Afficher",
    hidePassword: "Masquer",
  },
  en: {
    backToUsers: "Back to users",
    newUser: "New User",
    editUser: "Edit User",
    personalInfo: "Personal Information",
    name: "Full Name",
    namePlaceholder: "John Doe",
    email: "Email",
    emailPlaceholder: "john@example.com",
    security: "Security",
    password: "Password",
    passwordPlaceholder: "Enter password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm password",
    passwordHelp: "Minimum 8 characters",
    passwordOptional: "Leave empty to keep current password",
    passwordMismatch: "Passwords do not match",
    role: "Role",
    selectRole: "Select a role",
    roleAdmin: "Administrator",
    roleEditor: "Editor",
    roleSales: "Sales",
    roleAdminDesc: "Full access to all features",
    roleEditorDesc: "Manage products, projects, services, categories, media",
    roleSalesDesc: "Manage orders, quotes, messages",
    avatar: "Profile Photo",
    uploadAvatar: "Upload photo",
    removeAvatar: "Remove",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    activeHelp: "User can log in",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    showPassword: "Show",
    hidePassword: "Hide",
  },
  es: {
    backToUsers: "Volver a usuarios",
    newUser: "Nuevo Usuario",
    editUser: "Editar Usuario",
    personalInfo: "Informacion Personal",
    name: "Nombre Completo",
    namePlaceholder: "Juan Garcia",
    email: "Email",
    emailPlaceholder: "juan@example.com",
    security: "Seguridad",
    password: "Contrasena",
    passwordPlaceholder: "Ingrese la contrasena",
    confirmPassword: "Confirmar Contrasena",
    confirmPasswordPlaceholder: "Confirme la contrasena",
    passwordHelp: "Minimo 8 caracteres",
    passwordOptional: "Dejar vacio para mantener la contrasena actual",
    passwordMismatch: "Las contrasenas no coinciden",
    role: "Rol",
    selectRole: "Seleccionar un rol",
    roleAdmin: "Administrador",
    roleEditor: "Editor",
    roleSales: "Ventas",
    roleAdminDesc: "Acceso completo a todas las funcionalidades",
    roleEditorDesc: "Gestion de productos, proyectos, servicios, categorias, medios",
    roleSalesDesc: "Gestion de pedidos, cotizaciones, mensajes",
    avatar: "Foto de Perfil",
    uploadAvatar: "Subir foto",
    removeAvatar: "Eliminar",
    status: "Estado",
    active: "Activo",
    inactive: "Inactivo",
    activeHelp: "El usuario puede iniciar sesion",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
    showPassword: "Mostrar",
    hidePassword: "Ocultar",
  },
  ar: {
    backToUsers: "العودة للمستخدمين",
    newUser: "مستخدم جديد",
    editUser: "تعديل المستخدم",
    personalInfo: "المعلومات الشخصية",
    name: "الاسم الكامل",
    namePlaceholder: "أحمد محمد",
    email: "البريد الإلكتروني",
    emailPlaceholder: "ahmed@example.com",
    security: "الأمان",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أكد كلمة المرور",
    passwordHelp: "8 أحرف على الأقل",
    passwordOptional: "اتركه فارغاً للحفاظ على كلمة المرور الحالية",
    passwordMismatch: "كلمات المرور غير متطابقة",
    role: "الدور",
    selectRole: "اختر دوراً",
    roleAdmin: "مدير",
    roleEditor: "محرر",
    roleSales: "مبيعات",
    roleAdminDesc: "وصول كامل لجميع الميزات",
    roleEditorDesc: "إدارة المنتجات والمشاريع والخدمات والفئات والوسائط",
    roleSalesDesc: "إدارة الطلبات وعروض الأسعار والرسائل",
    avatar: "صورة الملف الشخصي",
    uploadAvatar: "رفع صورة",
    removeAvatar: "إزالة",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    activeHelp: "يمكن للمستخدم تسجيل الدخول",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    showPassword: "إظهار",
    hidePassword: "إخفاء",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

type UserRole = "ADMIN" | "EDITOR" | "SALES";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | "";
  avatar: string | null;
  isActive: boolean;
}

interface UserFormProps {
  user?: UserFormData & { id: string };
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// User Form Component
// ═══════════════════════════════════════════════════════════

export function UserForm({ user, locale }: UserFormProps) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";
  const isEdit = !!user;

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    confirmPassword: "",
    role: user?.role ?? "",
    avatar: user?.avatar ?? null,
    isActive: user?.isActive ?? true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!isEdit && !formData.password) {
      newErrors.password = "Required";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Min 8 characters";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordMismatch;
    }

    if (!formData.role) {
      newErrors.role = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);

    try {
      const url = isEdit ? `/api/users/${user.id}` : "/api/users";
      const method = isEdit ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
          avatar: formData.avatar,
          isActive: formData.isActive,
        }),
      });

      router.push(`/${locale}/admin/utilisateurs`);
      router.refresh();
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, avatar: url }));
      }
    };
    input.click();
  };

  // Roles info
  const roles = [
    { value: "ADMIN", label: t.roleAdmin, desc: t.roleAdminDesc },
    { value: "EDITOR", label: t.roleEditor, desc: t.roleEditorDesc },
    { value: "SALES", label: t.roleSales, desc: t.roleSalesDesc },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? t.editUser : t.newUser}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Personal Info Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <User className="h-5 w-5 text-amber-600" />
            {t.personalInfo}
          </h2>

          <div className="space-y-4">
            {/* Avatar */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.avatar}
              </label>
              <div className="flex items-center gap-4">
                {formData.avatar ? (
                  <div className="relative">
                    <Image
                      src={formData.avatar}
                      alt="Avatar"
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: null }))}
                      className="absolute -end-1 -top-1 rounded-full bg-red-500 p-1 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <Upload className="h-4 w-4" />
                  {t.uploadAvatar}
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.name} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t.namePlaceholder}
                className={cn(
                  "w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1",
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-amber-500 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                )}
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.email} *
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder={t.emailPlaceholder}
                  className={cn(
                    "w-full rounded-lg border py-2.5 ps-10 pe-4 text-sm focus:outline-none focus:ring-1",
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-amber-500 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Lock className="h-5 w-5 text-amber-600" />
            {t.security}
          </h2>

          <div className="space-y-4">
            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.password} {!isEdit && "*"}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={t.passwordPlaceholder}
                  className={cn(
                    "w-full rounded-lg border py-2.5 ps-10 pe-20 text-sm focus:outline-none focus:ring-1",
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-amber-500 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {showPassword ? t.hidePassword : t.showPassword}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {isEdit ? t.passwordOptional : t.passwordHelp}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.confirmPassword} {formData.password && "*"}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder={t.confirmPasswordPlaceholder}
                  className={cn(
                    "w-full rounded-lg border py-2.5 ps-10 pe-20 text-sm focus:outline-none focus:ring-1",
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-amber-500 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {showConfirmPassword ? t.hidePassword : t.showPassword}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* Role Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-amber-600" />
            {t.role}
          </h2>

          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors",
                  formData.role === role.value
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={formData.role === role.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  className="mt-1 h-4 w-4 border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {role.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Status Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
              className={cn(
                "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors",
                formData.isActive ? "bg-amber-600" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  formData.isActive ? (isRTL ? "start-0.5" : "start-5") : (isRTL ? "start-5" : "start-0.5")
                )}
              />
            </button>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.isActive ? t.active : t.inactive}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.activeHelp}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="me-2 h-4 w-4" />
                {t.save}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
