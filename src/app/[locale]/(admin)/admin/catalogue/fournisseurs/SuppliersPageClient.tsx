"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  Package,
  Wrench,
  Folder,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Supplier {
  id: string;
  code: string | null;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  paymentTerms: string | null;
  bankInfo: string | null;
  notes: string | null;
  isActive: boolean;
  _count: {
    items: number;
  };
}

interface SuppliersPageClientProps {
  suppliers: Supplier[];
  locale: string;
  searchQuery: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  suppliers: string;
  subtitle: string;
  products: string;
  services: string;
  categories: string;
  stock: string;
  addSupplier: string;
  editSupplier: string;
  searchPlaceholder: string;
  noSuppliers: string;
  noSuppliersDescription: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  paymentTerms: string;
  bankInfo: string;
  notes: string;
  active: string;
  items: string;
  save: string;
  cancel: string;
  confirmDelete: string;
}

const translations: Record<string, Translations> = {
  fr: {
    suppliers: "Fournisseurs",
    subtitle: "Gérez vos fournisseurs et partenaires",
    products: "Produits",
    services: "Services",
    categories: "Catégories",
    stock: "Stock",
    addSupplier: "Nouveau fournisseur",
    editSupplier: "Modifier le fournisseur",
    searchPlaceholder: "Rechercher un fournisseur...",
    noSuppliers: "Aucun fournisseur",
    noSuppliersDescription: "Ajoutez votre premier fournisseur",
    code: "Code",
    name: "Nom",
    contact: "Contact",
    phone: "Téléphone",
    email: "Email",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
    paymentTerms: "Conditions de paiement",
    bankInfo: "Coordonnées bancaires",
    notes: "Notes",
    active: "Actif",
    items: "articles",
    save: "Enregistrer",
    cancel: "Annuler",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce fournisseur ?",
  },
  en: {
    suppliers: "Suppliers",
    subtitle: "Manage your suppliers and partners",
    products: "Products",
    services: "Services",
    categories: "Categories",
    stock: "Stock",
    addSupplier: "New supplier",
    editSupplier: "Edit supplier",
    searchPlaceholder: "Search supplier...",
    noSuppliers: "No suppliers",
    noSuppliersDescription: "Add your first supplier",
    code: "Code",
    name: "Name",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    address: "Address",
    city: "City",
    country: "Country",
    paymentTerms: "Payment terms",
    bankInfo: "Bank info",
    notes: "Notes",
    active: "Active",
    items: "items",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this supplier?",
  },
  es: {
    suppliers: "Proveedores",
    subtitle: "Gestione sus proveedores y socios",
    products: "Productos",
    services: "Servicios",
    categories: "Categorías",
    stock: "Stock",
    addSupplier: "Nuevo proveedor",
    editSupplier: "Editar proveedor",
    searchPlaceholder: "Buscar proveedor...",
    noSuppliers: "Sin proveedores",
    noSuppliersDescription: "Agregue su primer proveedor",
    code: "Código",
    name: "Nombre",
    contact: "Contacto",
    phone: "Teléfono",
    email: "Email",
    address: "Dirección",
    city: "Ciudad",
    country: "País",
    paymentTerms: "Condiciones de pago",
    bankInfo: "Datos bancarios",
    notes: "Notas",
    active: "Activo",
    items: "artículos",
    save: "Guardar",
    cancel: "Cancelar",
    confirmDelete: "¿Está seguro de que desea eliminar este proveedor?",
  },
  ar: {
    suppliers: "الموردون",
    subtitle: "إدارة الموردين والشركاء",
    products: "المنتجات",
    services: "الخدمات",
    categories: "الفئات",
    stock: "المخزون",
    addSupplier: "مورد جديد",
    editSupplier: "تعديل المورد",
    searchPlaceholder: "البحث عن مورد...",
    noSuppliers: "لا موردون",
    noSuppliersDescription: "أضف أول مورد",
    code: "الكود",
    name: "الاسم",
    contact: "جهة الاتصال",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    address: "العنوان",
    city: "المدينة",
    country: "البلد",
    paymentTerms: "شروط الدفع",
    bankInfo: "البيانات البنكية",
    notes: "ملاحظات",
    active: "نشط",
    items: "عناصر",
    save: "حفظ",
    cancel: "إلغاء",
    confirmDelete: "هل أنت متأكد من حذف هذا المورد؟",
  },
};

// ═══════════════════════════════════════════════════════════
// Navigation Tabs
// ═══════════════════════════════════════════════════════════

const catalogTabs = [
  { id: "produits", icon: Package, labelKey: "products" as const },
  { id: "services", icon: Wrench, labelKey: "services" as const },
  { id: "categories", icon: Folder, labelKey: "categories" as const },
  { id: "stock", icon: AlertTriangle, labelKey: "stock" as const },
  { id: "fournisseurs", icon: Truck, labelKey: "suppliers" as const },
];

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function SuppliersPageClient({
  suppliers: initialSuppliers,
  locale,
  searchQuery: initialSearch,
}: SuppliersPageClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  const [suppliers] = useState(initialSuppliers);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "Maroc",
    paymentTerms: "",
    bankInfo: "",
    notes: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePath = `/${locale}/admin/catalogue/fournisseurs`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${basePath}?search=${searchQuery}`);
  };

  const openForm = (supplier?: Supplier) => {
    if (supplier) {
      setEditSupplier(supplier);
      setFormData({
        code: supplier.code || "",
        name: supplier.name,
        contactName: supplier.contactName || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        city: supplier.city || "",
        country: supplier.country,
        paymentTerms: supplier.paymentTerms || "",
        bankInfo: supplier.bankInfo || "",
        notes: supplier.notes || "",
        isActive: supplier.isActive,
      });
    } else {
      setEditSupplier(null);
      setFormData({
        code: "",
        name: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        country: "Maroc",
        paymentTerms: "",
        bankInfo: "",
        notes: "",
        isActive: true,
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const url = editSupplier
        ? `/api/catalog/suppliers/${editSupplier.id}`
        : "/api/catalog/suppliers";

      const response = await fetch(url, {
        method: editSupplier ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");

      setShowForm(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving supplier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      await fetch(`/api/catalog/suppliers/${supplier.id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-7 w-7 text-amber-600" />
            {t.suppliers}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.addSupplier}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 -mb-px">
          {catalogTabs.map(({ id, icon: Icon, labelKey }) => (
            <Link
              key={id}
              href={`/${locale}/admin/catalogue/${id}`}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                id === "fournisseurs"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {t[labelKey]}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </form>

      {/* Suppliers List */}
      {suppliers.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {t.noSuppliers}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t.noSuppliersDescription}
          </p>
          <button
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t.addSupplier}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 group transition-shadow hover:shadow-md",
                !supplier.isActive && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {supplier.code && (
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {supplier.code}
                      </span>
                    )}
                    {!supplier.isActive && (
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        Inactif
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-1">
                    {supplier.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openForm(supplier)}
                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {supplier.contactName && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {supplier.contactName}
                </div>
              )}

              <div className="space-y-1 text-sm">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Phone className="h-3.5 w-3.5" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    {supplier.email}
                  </div>
                )}
                {supplier.city && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {supplier.city}, {supplier.country}
                  </div>
                )}
              </div>

              {supplier._count.items > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  {supplier._count.items} {t.items}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supplier Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editSupplier ? t.editSupplier : t.addSupplier}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.code}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="FRN-001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.name} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.contact}
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contactName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.country}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, country: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.paymentTerms}
                </label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))
                  }
                  placeholder="30 jours fin de mois"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t.active}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
