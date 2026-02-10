"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  Save,
  X,
  ExternalLink,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Menus de Navigation",
    subtitle: "Gérez les menus du header et du footer",
    headerMenu: "Menu Principal (Header)",
    footerQuick: "Liens Rapides (Footer)",
    footerServices: "Services (Footer)",
    addItem: "Ajouter un élément",
    editItem: "Modifier",
    deleteItem: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
    save: "Enregistrer",
    cancel: "Annuler",
    labelFr: "Libellé (FR)",
    labelEn: "Libellé (EN)",
    labelEs: "Libellé (ES)",
    labelAr: "Libellé (AR)",
    url: "URL",
    target: "Ouvrir dans",
    targetSelf: "Même onglet",
    targetBlank: "Nouvel onglet",
    icon: "Icône",
    active: "Actif",
    order: "Ordre",
    noItems: "Aucun élément dans ce menu",
    loading: "Chargement...",
    saving: "Enregistrement...",
    saved: "Enregistré !",
    error: "Erreur lors de l'enregistrement",
    dragToReorder: "Glissez pour réorganiser",
  },
  en: {
    title: "Navigation Menus",
    subtitle: "Manage header and footer menus",
    headerMenu: "Main Menu (Header)",
    footerQuick: "Quick Links (Footer)",
    footerServices: "Services (Footer)",
    addItem: "Add item",
    editItem: "Edit",
    deleteItem: "Delete",
    confirmDelete: "Are you sure you want to delete this item?",
    save: "Save",
    cancel: "Cancel",
    labelFr: "Label (FR)",
    labelEn: "Label (EN)",
    labelEs: "Label (ES)",
    labelAr: "Label (AR)",
    url: "URL",
    target: "Open in",
    targetSelf: "Same tab",
    targetBlank: "New tab",
    icon: "Icon",
    active: "Active",
    order: "Order",
    noItems: "No items in this menu",
    loading: "Loading...",
    saving: "Saving...",
    saved: "Saved!",
    error: "Error saving",
    dragToReorder: "Drag to reorder",
  },
  es: {
    title: "Menús de Navegación",
    subtitle: "Gestiona los menús del header y footer",
    headerMenu: "Menú Principal (Header)",
    footerQuick: "Enlaces Rápidos (Footer)",
    footerServices: "Servicios (Footer)",
    addItem: "Añadir elemento",
    editItem: "Editar",
    deleteItem: "Eliminar",
    confirmDelete: "¿Estás seguro de eliminar este elemento?",
    save: "Guardar",
    cancel: "Cancelar",
    labelFr: "Etiqueta (FR)",
    labelEn: "Etiqueta (EN)",
    labelEs: "Etiqueta (ES)",
    labelAr: "Etiqueta (AR)",
    url: "URL",
    target: "Abrir en",
    targetSelf: "Misma pestaña",
    targetBlank: "Nueva pestaña",
    icon: "Icono",
    active: "Activo",
    order: "Orden",
    noItems: "No hay elementos en este menú",
    loading: "Cargando...",
    saving: "Guardando...",
    saved: "¡Guardado!",
    error: "Error al guardar",
    dragToReorder: "Arrastra para reordenar",
  },
  ar: {
    title: "قوائم التنقل",
    subtitle: "إدارة قوائم الرأس والتذييل",
    headerMenu: "القائمة الرئيسية (الرأس)",
    footerQuick: "روابط سريعة (التذييل)",
    footerServices: "الخدمات (التذييل)",
    addItem: "إضافة عنصر",
    editItem: "تعديل",
    deleteItem: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا العنصر؟",
    save: "حفظ",
    cancel: "إلغاء",
    labelFr: "التسمية (FR)",
    labelEn: "التسمية (EN)",
    labelEs: "التسمية (ES)",
    labelAr: "التسمية (AR)",
    url: "الرابط",
    target: "فتح في",
    targetSelf: "نفس علامة التبويب",
    targetBlank: "علامة تبويب جديدة",
    icon: "أيقونة",
    active: "نشط",
    order: "الترتيب",
    noItems: "لا توجد عناصر في هذه القائمة",
    loading: "جاري التحميل...",
    saving: "جاري الحفظ...",
    saved: "تم الحفظ!",
    error: "خطأ في الحفظ",
    dragToReorder: "اسحب لإعادة الترتيب",
  },
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface NavigationItem {
  id: string;
  location: string;
  labelFr: string;
  labelEn: string | null;
  labelEs: string | null;
  labelAr: string | null;
  url: string;
  target: string;
  icon: string | null;
  order: number;
  isActive: boolean;
}

type MenuLocation = "header" | "footer-quick" | "footer-services";

interface PageProps {
  params: { locale: string };
}

// ═══════════════════════════════════════════════════════════
// Navigation Manager Page
// ═══════════════════════════════════════════════════════════

export default function NavigationPage({ params }: PageProps) {
  const locale = params.locale as string;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [activeMenu, setActiveMenu] = useState<MenuLocation>("header");
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load items for active menu
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cms/navigation?location=${activeMenu}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to load navigation items:", error);
      }
      setLoading(false);
    };
    void loadItems();
  }, [activeMenu]);

  // Save item
  const handleSaveItem = async (item: Partial<NavigationItem>) => {
    setSaving(true);
    try {
      const isNew = !item.id;
      const url = isNew ? "/api/cms/navigation" : `/api/cms/navigation/${item.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, location: activeMenu }),
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (isNew) {
          setItems((prev) => [...prev, savedItem.item]);
        } else {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? savedItem.item : i))
          );
        }
        setEditingItem(null);
        setIsAddingNew(false);
      }
    } catch (error) {
      console.error("Failed to save item:", error);
    }
    setSaving(false);
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const res = await fetch(`/api/cms/navigation/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // New item template
  const newItem: Partial<NavigationItem> = {
    location: activeMenu,
    labelFr: "",
    labelEn: "",
    labelEs: "",
    labelAr: "",
    url: "/",
    target: "_self",
    icon: "",
    order: items.length,
    isActive: true,
  };

  // Menu tabs
  const menuTabs: { key: MenuLocation; label: string }[] = [
    { key: "header", label: t.headerMenu },
    { key: "footer-quick", label: t.footerQuick },
    { key: "footer-services", label: t.footerServices },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.subtitle}
        </p>
      </div>

      {/* Menu Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-0 overflow-x-auto">
          {menuTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveMenu(tab.key)}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeMenu === tab.key
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : items.length === 0 && !isAddingNew ? (
          <div className="py-12 text-center">
            <Menu className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">{t.noItems}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  item.isActive
                    ? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                    : "border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-900"
                )}
              >
                {/* Drag Handle */}
                <button
                  type="button"
                  className="cursor-grab text-gray-400 hover:text-gray-600"
                  title={t.dragToReorder}
                >
                  <GripVertical className="h-5 w-5" />
                </button>

                {/* Order */}
                <span className="w-6 text-center text-sm text-gray-400">
                  {index + 1}
                </span>

                {/* Label */}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.labelFr}
                  </p>
                  <p className="text-sm text-gray-500">{item.url}</p>
                </div>

                {/* Target */}
                {item.target === "_blank" && (
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                )}

                {/* Status */}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    item.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  )}
                >
                  {item.isActive ? "Actif" : "Inactif"}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingItem(item)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                    title={t.editItem}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title={t.deleteItem}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Button */}
        {!isAddingNew && !editingItem && (
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(true);
              setEditingItem(newItem as NavigationItem);
            }}
            className="mt-4 flex items-center gap-2 text-amber-600 hover:text-amber-700"
          >
            <Plus className="h-4 w-4" />
            {t.addItem}
          </button>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isAddingNew ? t.addItem : t.editItem}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingNew(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Labels */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.labelFr} *
                  </label>
                  <input
                    type="text"
                    value={editingItem.labelFr}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, labelFr: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Accueil"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.labelEn}
                  </label>
                  <input
                    type="text"
                    value={editingItem.labelEn || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, labelEn: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="Home"
                  />
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.url} *
                </label>
                <input
                  type="text"
                  value={editingItem.url}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, url: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="/services"
                />
              </div>

              {/* Target */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.target}
                </label>
                <select
                  value={editingItem.target}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, target: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="_self">{t.targetSelf}</option>
                  <option value="_blank">{t.targetBlank}</option>
                </select>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingItem.isActive}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-amber-600"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {t.active}
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingNew(false);
                }}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={() => handleSaveItem(editingItem)}
                disabled={saving || !editingItem.labelFr || !editingItem.url}
              >
                {saving ? (
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
          </div>
        </div>
      )}
    </div>
  );
}
