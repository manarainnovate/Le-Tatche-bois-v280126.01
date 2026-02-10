"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
  freeThreshold: number | null;
  estimatedDays: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Zones de livraison",
    addZone: "Ajouter une zone",
    editZone: "Modifier la zone",
    zoneName: "Nom de la zone",
    zoneNamePlaceholder: "ex: Casablanca-Settat",
    price: "Prix (MAD)",
    freeThreshold: "Seuil gratuit (MAD)",
    freeThresholdHelp: "Livraison gratuite au-dela de ce montant",
    estimatedDays: "Delai estime",
    estimatedDaysPlaceholder: "ex: 2-3 jours",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    confirmDelete: "Etes-vous sur de vouloir supprimer cette zone ?",
    noZones: "Aucune zone de livraison",
    noZonesDesc: "Ajoutez votre premiere zone de livraison",
    free: "Gratuit",
    freeAbove: "Gratuit au-dela de",
  },
  en: {
    title: "Shipping Zones",
    addZone: "Add Zone",
    editZone: "Edit Zone",
    zoneName: "Zone Name",
    zoneNamePlaceholder: "e.g., Casablanca-Settat",
    price: "Price (MAD)",
    freeThreshold: "Free Threshold (MAD)",
    freeThresholdHelp: "Free shipping above this amount",
    estimatedDays: "Estimated Days",
    estimatedDaysPlaceholder: "e.g., 2-3 days",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this zone?",
    noZones: "No shipping zones",
    noZonesDesc: "Add your first shipping zone",
    free: "Free",
    freeAbove: "Free above",
  },
  es: {
    title: "Zonas de Envio",
    addZone: "Agregar Zona",
    editZone: "Editar Zona",
    zoneName: "Nombre de Zona",
    zoneNamePlaceholder: "ej: Casablanca-Settat",
    price: "Precio (MAD)",
    freeThreshold: "Umbral Gratuito (MAD)",
    freeThresholdHelp: "Envio gratuito por encima de este monto",
    estimatedDays: "Dias Estimados",
    estimatedDaysPlaceholder: "ej: 2-3 dias",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    confirmDelete: "Esta seguro de eliminar esta zona?",
    noZones: "Sin zonas de envio",
    noZonesDesc: "Agrega tu primera zona de envio",
    free: "Gratis",
    freeAbove: "Gratis arriba de",
  },
  ar: {
    title: "مناطق الشحن",
    addZone: "إضافة منطقة",
    editZone: "تعديل المنطقة",
    zoneName: "اسم المنطقة",
    zoneNamePlaceholder: "مثال: الدار البيضاء-سطات",
    price: "السعر (درهم)",
    freeThreshold: "حد الشحن المجاني (درهم)",
    freeThresholdHelp: "شحن مجاني فوق هذا المبلغ",
    estimatedDays: "الأيام المقدرة",
    estimatedDaysPlaceholder: "مثال: 2-3 أيام",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذه المنطقة؟",
    noZones: "لا توجد مناطق شحن",
    noZonesDesc: "أضف أول منطقة شحن",
    free: "مجاني",
    freeAbove: "مجاني فوق",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

interface ShippingZonesEditorProps {
  zones: ShippingZone[];
  onChange: (zones: ShippingZone[]) => void;
  locale?: string;
}

export function ShippingZonesEditor({
  zones,
  onChange,
  locale = "fr",
}: ShippingZonesEditorProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const isRTL = locale === "ar";

  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    freeThreshold: null as number | null,
    estimatedDays: "",
  });
  const [saving, setSaving] = useState(false);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Open add form
  const handleAdd = () => {
    setEditingZone(null);
    setFormData({
      name: "",
      price: 0,
      freeThreshold: null,
      estimatedDays: "",
    });
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      price: zone.price,
      freeThreshold: zone.freeThreshold,
      estimatedDays: zone.estimatedDays,
    });
    setShowForm(true);
  };

  // Close form
  const handleClose = () => {
    setShowForm(false);
    setEditingZone(null);
  };

  // Save zone
  const handleSave = async () => {
    setSaving(true);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (editingZone) {
      // Update existing
      const updated = zones.map((z) =>
        z.id === editingZone.id
          ? { ...z, ...formData }
          : z
      );
      onChange(updated);
    } else {
      // Add new
      const newZone: ShippingZone = {
        id: `zone-${Date.now()}`,
        ...formData,
      };
      onChange([...zones, newZone]);
    }

    setSaving(false);
    handleClose();
  };

  // Delete zone
  const handleDelete = (zoneId: string) => {
    if (confirm(t.confirmDelete)) {
      onChange(zones.filter((z) => z.id !== zoneId));
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.title}
        </h3>
        <Button onClick={handleAdd} size="sm">
          <Plus className="me-2 h-4 w-4" />
          {t.addZone}
        </Button>
      </div>

      {/* Zones Table */}
      {zones.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.zoneName}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.price}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.freeThreshold}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.estimatedDays}
                </th>
                <th className="px-4 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {zones.map((zone) => (
                <tr key={zone.id}>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {zone.name}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatPrice(zone.price)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                    {zone.freeThreshold ? (
                      <span className="text-green-600 dark:text-green-400">
                        {t.freeAbove} {formatPrice(zone.freeThreshold)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      {zone.estimatedDays}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(zone)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(zone.id)}
                        className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <Truck className="mx-auto h-12 w-12 text-gray-300" />
          <h4 className="mt-4 font-medium text-gray-900 dark:text-white">
            {t.noZones}
          </h4>
          <p className="mt-1 text-sm text-gray-500">{t.noZonesDesc}</p>
          <Button onClick={handleAdd} className="mt-4">
            <Plus className="me-2 h-4 w-4" />
            {t.addZone}
          </Button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingZone ? t.editZone : t.addZone}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Zone Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.zoneName}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t.zoneNamePlaceholder}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.price}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Free Threshold */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.freeThreshold}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.freeThreshold ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      freeThreshold: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">{t.freeThresholdHelp}</p>
              </div>

              {/* Estimated Days */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.estimatedDays}
                </label>
                <input
                  type="text"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData((prev) => ({ ...prev, estimatedDays: e.target.value }))}
                  placeholder={t.estimatedDaysPlaceholder}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                {t.cancel}
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving || !formData.name}>
                {saving ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t.save}
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
