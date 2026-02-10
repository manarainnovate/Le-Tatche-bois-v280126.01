"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Package,
  Search,
  X,
  ChevronDown,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
  clientType: string;
  phone: string;
  email: string | null;
  billingAddress: string | null;
  billingCity: string | null;
  ice: string | null;
  taxId: string | null;
  defaultDiscount: number | null;
  paymentTerms: string | null;
}

interface Project {
  id: string;
  name: string;
  projectNumber: string;
  clientId: string;
}

interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  type: string;
  unit: string;
  sellingPriceHT: number;
  tvaRate: number;
  category: { id: string; name: string } | null;
}

interface LineItem {
  id: string;
  catalogItemId: string | null;
  reference: string;
  designation: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent: number;
  tvaRate: number;
  totalHT: number;
}

interface Settings {
  quoteValidityDays: number;
  defaultDepositPercent: number | null;
  defaultTvaRate: number;
  quoteFooter: string | null;
}

interface DevisFormClientProps {
  locale: string;
  clients: Client[];
  projects: Project[];
  catalogItems: CatalogItem[];
  settings: Settings;
  preselectedClientId?: string;
  preselectedProjectId?: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Nouveau Devis",
    back: "Retour",
    save: "Enregistrer",
    saveAndSend: "Enregistrer et envoyer",
    client: "Client",
    selectClient: "Sélectionner un client",
    project: "Projet (optionnel)",
    selectProject: "Sélectionner un projet",
    noProject: "Aucun projet",
    date: "Date",
    validity: "Validité (jours)",
    deliveryTime: "Délai de réalisation",
    items: "Articles",
    addItem: "Ajouter un article",
    addFromCatalog: "Ajouter du catalogue",
    reference: "Référence",
    designation: "Désignation",
    description: "Description",
    quantity: "Quantité",
    unit: "Unité",
    unitPrice: "Prix unitaire HT",
    discount: "Remise %",
    tva: "TVA %",
    lineTotal: "Total HT",
    subtotal: "Sous-total HT",
    globalDiscount: "Remise globale",
    globalDiscountType: "Type",
    percentage: "Pourcentage",
    fixed: "Montant fixe",
    netHT: "Total HT net",
    totalTVA: "TVA",
    totalTTC: "Total TTC",
    deposit: "Acompte",
    depositPercent: "Acompte %",
    depositAmount: "Montant acompte",
    conditions: "Conditions",
    includes: "Ce devis comprend",
    excludes: "Ce devis ne comprend pas",
    notes: "Notes client",
    internalNotes: "Notes internes",
    footer: "Pied de page",
    searchCatalog: "Rechercher dans le catalogue...",
    noResults: "Aucun résultat",
    addCustomItem: "Ajouter un article personnalisé",
    required: "Ce champ est obligatoire",
    pcs: "pcs",
    m2: "m²",
    ml: "ml",
    h: "h",
    forfait: "forfait",
    kg: "kg",
    l: "L",
    day: "jour",
  },
  en: {
    title: "New Quote",
    back: "Back",
    save: "Save",
    saveAndSend: "Save and send",
    client: "Client",
    selectClient: "Select a client",
    project: "Project (optional)",
    selectProject: "Select a project",
    noProject: "No project",
    date: "Date",
    validity: "Validity (days)",
    deliveryTime: "Delivery time",
    items: "Items",
    addItem: "Add item",
    addFromCatalog: "Add from catalog",
    reference: "Reference",
    designation: "Description",
    description: "Details",
    quantity: "Quantity",
    unit: "Unit",
    unitPrice: "Unit price",
    discount: "Discount %",
    tva: "Tax %",
    lineTotal: "Total",
    subtotal: "Subtotal",
    globalDiscount: "Global discount",
    globalDiscountType: "Type",
    percentage: "Percentage",
    fixed: "Fixed amount",
    netHT: "Net total",
    totalTVA: "Tax",
    totalTTC: "Grand total",
    deposit: "Deposit",
    depositPercent: "Deposit %",
    depositAmount: "Deposit amount",
    conditions: "Terms",
    includes: "This quote includes",
    excludes: "This quote excludes",
    notes: "Customer notes",
    internalNotes: "Internal notes",
    footer: "Footer",
    searchCatalog: "Search catalog...",
    noResults: "No results",
    addCustomItem: "Add custom item",
    required: "This field is required",
    pcs: "pcs",
    m2: "m²",
    ml: "ml",
    h: "h",
    forfait: "flat",
    kg: "kg",
    l: "L",
    day: "day",
  },
  es: {
    title: "Nuevo Presupuesto",
    back: "Volver",
    save: "Guardar",
    saveAndSend: "Guardar y enviar",
    client: "Cliente",
    selectClient: "Seleccionar cliente",
    project: "Proyecto (opcional)",
    selectProject: "Seleccionar proyecto",
    noProject: "Sin proyecto",
    date: "Fecha",
    validity: "Validez (días)",
    deliveryTime: "Tiempo de entrega",
    items: "Artículos",
    addItem: "Añadir artículo",
    addFromCatalog: "Añadir del catálogo",
    reference: "Referencia",
    designation: "Descripción",
    description: "Detalles",
    quantity: "Cantidad",
    unit: "Unidad",
    unitPrice: "Precio unitario",
    discount: "Descuento %",
    tva: "IVA %",
    lineTotal: "Total",
    subtotal: "Subtotal",
    globalDiscount: "Descuento global",
    globalDiscountType: "Tipo",
    percentage: "Porcentaje",
    fixed: "Cantidad fija",
    netHT: "Total neto",
    totalTVA: "IVA",
    totalTTC: "Total con IVA",
    deposit: "Anticipo",
    depositPercent: "Anticipo %",
    depositAmount: "Monto anticipo",
    conditions: "Condiciones",
    includes: "Este presupuesto incluye",
    excludes: "Este presupuesto no incluye",
    notes: "Notas para el cliente",
    internalNotes: "Notas internas",
    footer: "Pie de página",
    searchCatalog: "Buscar en el catálogo...",
    noResults: "Sin resultados",
    addCustomItem: "Añadir artículo personalizado",
    required: "Este campo es obligatorio",
    pcs: "pzas",
    m2: "m²",
    ml: "ml",
    h: "h",
    forfait: "tarifa plana",
    kg: "kg",
    l: "L",
    day: "día",
  },
  ar: {
    title: "عرض سعر جديد",
    back: "رجوع",
    save: "حفظ",
    saveAndSend: "حفظ وإرسال",
    client: "العميل",
    selectClient: "اختر عميل",
    project: "المشروع (اختياري)",
    selectProject: "اختر مشروع",
    noProject: "بدون مشروع",
    date: "التاريخ",
    validity: "الصلاحية (أيام)",
    deliveryTime: "مدة التنفيذ",
    items: "العناصر",
    addItem: "إضافة عنصر",
    addFromCatalog: "إضافة من الكتالوج",
    reference: "المرجع",
    designation: "الوصف",
    description: "التفاصيل",
    quantity: "الكمية",
    unit: "الوحدة",
    unitPrice: "سعر الوحدة",
    discount: "الخصم %",
    tva: "الضريبة %",
    lineTotal: "المجموع",
    subtotal: "المجموع الفرعي",
    globalDiscount: "الخصم الكلي",
    globalDiscountType: "النوع",
    percentage: "نسبة مئوية",
    fixed: "مبلغ ثابت",
    netHT: "صافي المجموع",
    totalTVA: "الضريبة",
    totalTTC: "المجموع الكلي",
    deposit: "الدفعة الأولى",
    depositPercent: "الدفعة الأولى %",
    depositAmount: "مبلغ الدفعة الأولى",
    conditions: "الشروط",
    includes: "يشمل هذا العرض",
    excludes: "لا يشمل هذا العرض",
    notes: "ملاحظات العميل",
    internalNotes: "ملاحظات داخلية",
    footer: "التذييل",
    searchCatalog: "البحث في الكتالوج...",
    noResults: "لا توجد نتائج",
    addCustomItem: "إضافة عنصر مخصص",
    required: "هذا الحقل مطلوب",
    pcs: "قطعة",
    m2: "م²",
    ml: "م.ط",
    h: "ساعة",
    forfait: "إجمالي",
    kg: "كغ",
    l: "لتر",
    day: "يوم",
  },
};

const unitOptions = ["PCS", "M2", "ML", "H", "FORFAIT", "KG", "L", "DAY"];

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════

export function DevisFormClient({
  locale,
  clients,
  projects,
  catalogItems,
  settings,
  preselectedClientId,
  preselectedProjectId,
}: DevisFormClientProps) {
  const router = useRouter();
  const t = translations[locale] || translations.fr;
  const isRTL = locale === "ar";

  // Form state
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [projectId, setProjectId] = useState(preselectedProjectId || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [validityDays, setValidityDays] = useState(settings.quoteValidityDays);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [globalDiscountType, setGlobalDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [globalDiscountValue, setGlobalDiscountValue] = useState(0);
  const [depositPercent, setDepositPercent] = useState(settings.defaultDepositPercent || 0);
  const [includes, setIncludes] = useState<string[]>([]);
  const [excludes, setExcludes] = useState<string[]>([]);
  const [publicNotes, setPublicNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [footerText, setFooterText] = useState(settings.quoteFooter || "");

  // UI state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals
  const calculateLineTotals = useCallback(() => {
    return items.map((item) => {
      const subtotal = item.quantity * item.unitPriceHT;
      const discountAmount = subtotal * (item.discountPercent / 100);
      const totalHT = subtotal - discountAmount;
      return { ...item, totalHT };
    });
  }, [items]);

  const itemsWithTotals = calculateLineTotals();
  const subtotalHT = itemsWithTotals.reduce((sum, item) => sum + item.totalHT, 0);
  const globalDiscountAmount = globalDiscountType === "percentage"
    ? subtotalHT * (globalDiscountValue / 100)
    : globalDiscountValue;
  const netHT = subtotalHT - globalDiscountAmount;

  // Group TVA by rate
  const tvaByRate = itemsWithTotals.reduce((acc, item) => {
    const rate = item.tvaRate;
    const lineNetHT = item.totalHT * (1 - globalDiscountAmount / subtotalHT || 1);
    const tvaAmount = lineNetHT * (rate / 100);
    acc[rate] = (acc[rate] || 0) + tvaAmount;
    return acc;
  }, {} as Record<number, number>);

  const totalTVA = Object.values(tvaByRate).reduce((sum, val) => sum + val, 0);
  const totalTTC = netHT + totalTVA;
  const depositAmount = totalTTC * (depositPercent / 100);

  // Filtered projects by selected client
  const filteredProjects = clientId
    ? projects.filter((p) => p.clientId === clientId)
    : projects;

  // Add item from catalog
  const addCatalogItem = (catalogItem: CatalogItem) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      catalogItemId: catalogItem.id,
      reference: catalogItem.sku,
      designation: catalogItem.name,
      description: catalogItem.description || "",
      quantity: 1,
      unit: catalogItem.unit,
      unitPriceHT: catalogItem.sellingPriceHT,
      discountPercent: 0,
      tvaRate: catalogItem.tvaRate,
      totalHT: catalogItem.sellingPriceHT,
    };
    setItems([...items, newItem]);
    setShowCatalogModal(false);
    setCatalogSearch("");
  };

  // Add custom item
  const addCustomItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      catalogItemId: null,
      reference: "",
      designation: "",
      description: "",
      quantity: 1,
      unit: "PCS",
      unitPriceHT: 0,
      discountPercent: 0,
      tvaRate: settings.defaultTvaRate,
      totalHT: 0,
    };
    setItems([...items, newItem]);
  };

  // Update item
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      // Recalculate total
      const subtotal = updated.quantity * updated.unitPriceHT;
      const discountAmount = subtotal * (updated.discountPercent / 100);
      updated.totalHT = subtotal - discountAmount;
      return updated;
    }));
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Submit form
  const handleSubmit = async (sendEmail = false) => {
    // Validate
    const newErrors: Record<string, string> = {};
    if (!clientId) newErrors.clientId = t.required;
    if (items.length === 0) newErrors.items = t.required;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/crm/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DEVIS",
          clientId,
          projectId: projectId || null,
          date,
          validUntil: new Date(new Date(date).getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
          deliveryTime,
          items: items.map((item, index) => ({
            catalogItemId: item.catalogItemId,
            reference: item.reference,
            designation: item.designation,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPriceHT: item.unitPriceHT,
            discountPercent: item.discountPercent,
            tvaRate: item.tvaRate,
            order: index,
          })),
          discountType: globalDiscountType,
          discountValue: globalDiscountValue,
          depositPercent,
          includes,
          excludes,
          publicNotes,
          internalNotes,
          footerText,
          status: sendEmail ? "SENT" : "DRAFT",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const data = await response.json();
      router.push(`/${locale}/admin/facturation/devis/${data.id}`);
    } catch (error) {
      console.error("Error creating devis:", error);
      setErrors({ submit: "Une erreur est survenue" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { format: formatCurrency } = useCurrency();

  // Filtered catalog items
  const filteredCatalogItems = catalogSearch
    ? catalogItems.filter((item) =>
        item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(catalogSearch.toLowerCase())
      )
    : catalogItems;

  return (
    <div className={cn("space-y-6", isRTL && "rtl")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin/facturation/devis`}
            className="inline-flex items-center justify-center rounded-md text-sm h-8 px-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t.back}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-1" />
            {t.save}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {t.saveAndSend}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Project */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.client} *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setProjectId(""); // Reset project when client changes
                  }}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg dark:bg-gray-700",
                    errors.clientId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  <option value="">{t.selectClient}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName} ({client.clientNumber})
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>
                )}
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.project}
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                  disabled={!clientId}
                >
                  <option value="">{t.noProject}</option>
                  {filteredProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.projectNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.date}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* Validity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.validity}
                </label>
                <input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 15)}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* Delivery Time */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.deliveryTime}
                </label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Ex: 2-3 semaines"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {t.items}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCatalogModal(true)}>
                  <Package className="h-4 w-4 mr-1" />
                  {t.addFromCatalog}
                </Button>
                <Button variant="outline" size="sm" onClick={addCustomItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t.addItem}
                </Button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>{t.addItem}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {t.designation}
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">
                        {t.quantity}
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">
                        {t.unit}
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-28">
                        {t.unitPrice}
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">
                        {t.discount}
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-16">
                        {t.tva}
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-28">
                        {t.lineTotal}
                      </th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {itemsWithTotals.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.designation}
                            onChange={(e) => updateItem(item.id, "designation", e.target.value)}
                            placeholder={t.designation}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 dark:bg-gray-700"
                          />
                          {item.reference && (
                            <p className="text-xs text-gray-400 mt-0.5">{item.reference}</p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            min={0}
                            step={0.01}
                            className="w-full px-2 py-1 text-sm text-center border border-gray-200 rounded dark:border-gray-600 dark:bg-gray-700"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 dark:bg-gray-700"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {t[unit.toLowerCase()] || unit}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.unitPriceHT}
                            onChange={(e) => updateItem(item.id, "unitPriceHT", parseFloat(e.target.value) || 0)}
                            min={0}
                            step={0.01}
                            className="w-full px-2 py-1 text-sm text-right border border-gray-200 rounded dark:border-gray-600 dark:bg-gray-700"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) => updateItem(item.id, "discountPercent", parseFloat(e.target.value) || 0)}
                            min={0}
                            max={100}
                            className="w-full px-2 py-1 text-sm text-center border border-gray-200 rounded dark:border-gray-600 dark:bg-gray-700"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.tvaRate}
                            onChange={(e) => updateItem(item.id, "tvaRate", parseFloat(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded dark:border-gray-600 dark:bg-gray-700"
                          >
                            <option value={0}>0%</option>
                            <option value={7}>7%</option>
                            <option value={10}>10%</option>
                            <option value={14}>14%</option>
                            <option value={20}>20%</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(item.totalHT)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {errors.items && (
              <p className="text-red-500 text-sm px-4 pb-3">{errors.items}</p>
            )}
          </div>

          {/* Conditions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t.conditions}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.notes}
              </label>
              <textarea
                value={publicNotes}
                onChange={(e) => setPublicNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.internalNotes}
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 bg-yellow-50 dark:bg-yellow-900/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.footer}
              </label>
              <textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Totals */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Totaux
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.subtotal}</span>
                <span>{formatCurrency(subtotalHT)}</span>
              </div>

              {/* Global Discount */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-xs text-gray-500 mb-1">
                  {t.globalDiscount}
                </label>
                <div className="flex gap-2">
                  <select
                    value={globalDiscountType}
                    onChange={(e) => setGlobalDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">DH</option>
                  </select>
                  <input
                    type="number"
                    value={globalDiscountValue}
                    onChange={(e) => setGlobalDiscountValue(parseFloat(e.target.value) || 0)}
                    min={0}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              </div>

              {globalDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>{t.globalDiscount}</span>
                  <span>-{formatCurrency(globalDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t.netHT}</span>
                <span>{formatCurrency(netHT)}</span>
              </div>

              {/* TVA Breakdown */}
              {Object.entries(tvaByRate).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.tva} ({rate}%)</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              ))}

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
                <span>{t.totalTTC}</span>
                <span className="text-amber-600">{formatCurrency(totalTTC)}</span>
              </div>

              {/* Deposit */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-xs text-gray-500 mb-1">
                  {t.depositPercent}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={100}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>

              {depositPercent > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>{t.deposit}</span>
                  <span>{formatCurrency(depositAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Modal */}
      {showCatalogModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowCatalogModal(false)}
          />
          <div className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder={t.searchCatalog}
                className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredCatalogItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t.noResults}</p>
              ) : (
                <div className="space-y-1">
                  {filteredCatalogItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addCatalogItem(item)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.sku} • {item.category?.name || "Sans catégorie"}
                          </p>
                        </div>
                        <p className="font-medium text-amber-600">
                          {formatCurrency(item.sellingPriceHT)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  addCustomItem();
                  setShowCatalogModal(false);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.addCustomItem}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
