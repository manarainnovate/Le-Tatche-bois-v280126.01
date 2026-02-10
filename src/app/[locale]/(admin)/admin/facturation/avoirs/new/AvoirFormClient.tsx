"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Receipt,
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Save,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/stores/currency";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
  email: string | null;
  phone: string;
  billingAddress: string | null;
  billingCity: string | null;
  billingPostalCode: string | null;
  ice: string | null;
  taxId: string | null;
}

interface DocumentItem {
  id: string;
  catalogItemId: string | null;
  reference: string | null;
  designation: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent: number | null;
  discountAmount: number;
  tvaRate: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  order: number;
}

interface Facture {
  id: string;
  type: string;
  number: string;
  clientId: string;
  clientName: string;
  totalTTC: number;
  paidAmount: number;
  balance: number;
  client?: {
    id: string;
    fullName: string;
    clientNumber: string;
  } | null;
  items: DocumentItem[];
}

interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  sellingPriceHT: number;
  tvaRate: number;
  unit: string;
}

interface LineItem {
  id: string;
  catalogItemId?: string;
  reference: string;
  designation: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  discountPercent: number;
  tvaRate: number;
}

interface ParentDocument {
  id: string;
  type: string;
  number: string;
  clientId: string;
  projectId: string | null;
  clientName: string;
  clientAddress: string | null;
  clientCity: string | null;
  clientIce: string | null;
  totalHT: number;
  totalTTC: number;
  items: DocumentItem[];
  client?: Client | null;
  project?: {
    id: string;
    name: string;
    projectNumber: string;
  } | null;
}

interface AvoirFormClientProps {
  locale: string;
  clients: Client[];
  factures: Facture[];
  catalogItems: CatalogItem[];
  parentDocument: ParentDocument | null;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Nouvel Avoir",
    subtitle: "Créer un avoir (note de crédit)",
    back: "Retour aux avoirs",
    // Form sections
    clientInfo: "Informations client",
    selectClient: "Sélectionner un client",
    selectedClient: "Client sélectionné",
    clientDetails: "Détails du client",
    address: "Adresse",
    ice: "ICE",
    sourceFacture: "Facture d'origine",
    selectFacture: "Sélectionner la facture concernée",
    noFacture: "Aucune (avoir libre)",
    factureRef: "Réf. facture",
    documentInfo: "Informations du document",
    avoirDate: "Date de l'avoir",
    avoirReason: "Motif de l'avoir",
    reasonPlaceholder: "Retour marchandise, erreur de facturation, remise commerciale...",
    items: "Articles à créditer",
    addItem: "Ajouter une ligne",
    reference: "Référence",
    designation: "Désignation",
    description: "Description",
    quantity: "Qté",
    unit: "Unité",
    unitPrice: "P.U. HT",
    discount: "Remise %",
    tva: "TVA %",
    totalHT: "Total HT",
    summary: "Récapitulatif",
    subtotal: "Sous-total HT",
    totalTVA: "Total TVA",
    totalTTC: "Montant de l'avoir",
    notes: "Notes",
    internalNotes: "Notes internes",
    publicNotes: "Notes sur l'avoir",
    actions: "Actions",
    saveDraft: "Enregistrer brouillon",
    saveAndApply: "Enregistrer et appliquer",
    cancel: "Annuler",
    // Validation
    selectClientFirst: "Veuillez sélectionner un client",
    addItemFirst: "Veuillez ajouter au moins un article",
    selectFactureFirst: "Veuillez sélectionner une facture d'origine",
    // Units
    pcs: "Pcs",
    m2: "M²",
    ml: "ML",
    h: "H",
    forfait: "Forfait",
    // Reasons
    returnGoods: "Retour marchandise",
    invoiceError: "Erreur de facturation",
    commercialDiscount: "Remise commerciale",
    qualityIssue: "Problème qualité",
    other: "Autre",
  },
  en: {
    title: "New Credit Note",
    subtitle: "Create a credit note",
    back: "Back to credit notes",
    clientInfo: "Client Information",
    selectClient: "Select a client",
    selectedClient: "Selected client",
    clientDetails: "Client details",
    address: "Address",
    ice: "ICE",
    sourceFacture: "Original Invoice",
    selectFacture: "Select the related invoice",
    noFacture: "None (direct credit note)",
    factureRef: "Invoice ref.",
    documentInfo: "Document Information",
    avoirDate: "Credit note date",
    avoirReason: "Reason",
    reasonPlaceholder: "Return, billing error, commercial discount...",
    items: "Items to credit",
    addItem: "Add line",
    reference: "Reference",
    designation: "Description",
    description: "Details",
    quantity: "Qty",
    unit: "Unit",
    unitPrice: "Unit Price",
    discount: "Discount %",
    tva: "VAT %",
    totalHT: "Total excl. VAT",
    summary: "Summary",
    subtotal: "Subtotal",
    totalTVA: "Total VAT",
    totalTTC: "Credit note amount",
    notes: "Notes",
    internalNotes: "Internal notes",
    publicNotes: "Credit note notes",
    actions: "Actions",
    saveDraft: "Save as draft",
    saveAndApply: "Save and apply",
    cancel: "Cancel",
    selectClientFirst: "Please select a client",
    addItemFirst: "Please add at least one item",
    selectFactureFirst: "Please select an original invoice",
    pcs: "Pcs",
    m2: "M²",
    ml: "LM",
    h: "H",
    forfait: "Fixed",
    returnGoods: "Return of goods",
    invoiceError: "Billing error",
    commercialDiscount: "Commercial discount",
    qualityIssue: "Quality issue",
    other: "Other",
  },
  es: {
    title: "Nueva Nota de Crédito",
    subtitle: "Crear una nota de crédito",
    back: "Volver a notas de crédito",
    clientInfo: "Información del cliente",
    selectClient: "Seleccionar cliente",
    selectedClient: "Cliente seleccionado",
    clientDetails: "Detalles del cliente",
    address: "Dirección",
    ice: "ICE",
    sourceFacture: "Factura original",
    selectFacture: "Seleccionar factura relacionada",
    noFacture: "Ninguna (nota de crédito directa)",
    factureRef: "Ref. factura",
    documentInfo: "Información del documento",
    avoirDate: "Fecha nota de crédito",
    avoirReason: "Motivo",
    reasonPlaceholder: "Devolución, error de facturación, descuento comercial...",
    items: "Artículos a acreditar",
    addItem: "Añadir línea",
    reference: "Referencia",
    designation: "Descripción",
    description: "Detalles",
    quantity: "Cant",
    unit: "Unidad",
    unitPrice: "P.U.",
    discount: "Dto %",
    tva: "IVA %",
    totalHT: "Total sin IVA",
    summary: "Resumen",
    subtotal: "Subtotal",
    totalTVA: "Total IVA",
    totalTTC: "Importe nota de crédito",
    notes: "Notas",
    internalNotes: "Notas internas",
    publicNotes: "Notas en documento",
    actions: "Acciones",
    saveDraft: "Guardar borrador",
    saveAndApply: "Guardar y aplicar",
    cancel: "Cancelar",
    selectClientFirst: "Por favor seleccione un cliente",
    addItemFirst: "Por favor añada al menos un artículo",
    selectFactureFirst: "Por favor seleccione una factura original",
    pcs: "Uds",
    m2: "M²",
    ml: "ML",
    h: "H",
    forfait: "Fijo",
    returnGoods: "Devolución de mercancía",
    invoiceError: "Error de facturación",
    commercialDiscount: "Descuento comercial",
    qualityIssue: "Problema de calidad",
    other: "Otro",
  },
  ar: {
    title: "إشعار دائن جديد",
    subtitle: "إنشاء إشعار دائن",
    back: "العودة إلى الإشعارات الدائنة",
    clientInfo: "معلومات العميل",
    selectClient: "اختر عميل",
    selectedClient: "العميل المحدد",
    clientDetails: "تفاصيل العميل",
    address: "العنوان",
    ice: "ICE",
    sourceFacture: "الفاتورة الأصلية",
    selectFacture: "اختر الفاتورة المعنية",
    noFacture: "بدون (إشعار دائن مباشر)",
    factureRef: "مرجع الفاتورة",
    documentInfo: "معلومات المستند",
    avoirDate: "تاريخ الإشعار",
    avoirReason: "السبب",
    reasonPlaceholder: "إرجاع بضاعة، خطأ في الفوترة، خصم تجاري...",
    items: "العناصر المعتمدة",
    addItem: "إضافة سطر",
    reference: "المرجع",
    designation: "التسمية",
    description: "التفاصيل",
    quantity: "الكمية",
    unit: "الوحدة",
    unitPrice: "السعر",
    discount: "خصم %",
    tva: "ضريبة %",
    totalHT: "المجموع بدون ضريبة",
    summary: "الملخص",
    subtotal: "المجموع الفرعي",
    totalTVA: "إجمالي الضريبة",
    totalTTC: "مبلغ الإشعار الدائن",
    notes: "الملاحظات",
    internalNotes: "ملاحظات داخلية",
    publicNotes: "ملاحظات على المستند",
    actions: "الإجراءات",
    saveDraft: "حفظ كمسودة",
    saveAndApply: "حفظ وتطبيق",
    cancel: "إلغاء",
    selectClientFirst: "الرجاء اختيار عميل",
    addItemFirst: "الرجاء إضافة عنصر واحد على الأقل",
    selectFactureFirst: "الرجاء اختيار فاتورة أصلية",
    pcs: "قطعة",
    m2: "م²",
    ml: "م.ط",
    h: "س",
    forfait: "مقطوعية",
    returnGoods: "إرجاع بضاعة",
    invoiceError: "خطأ في الفوترة",
    commercialDiscount: "خصم تجاري",
    qualityIssue: "مشكلة جودة",
    other: "أخرى",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function AvoirFormClient({
  locale,
  clients,
  factures,
  catalogItems,
  parentDocument,
}: AvoirFormClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const basePath = `/${locale}/admin/facturation/avoirs`;

  // Form state
  const [selectedClientId, setSelectedClientId] = useState(parentDocument?.clientId || "");
  const [selectedFactureId, setSelectedFactureId] = useState(parentDocument?.id || "");
  const [avoirDate, setAvoirDate] = useState(new Date().toISOString().split("T")[0]);
  const [avoirReason, setAvoirReason] = useState("");
  const [items, setItems] = useState<LineItem[]>(() => {
    if (parentDocument?.items) {
      return parentDocument.items.map((item) => ({
        id: crypto.randomUUID(),
        catalogItemId: item.catalogItemId || undefined,
        reference: item.reference || "",
        designation: item.designation,
        description: item.description || "",
        quantity: item.quantity,
        unit: item.unit,
        unitPriceHT: item.unitPriceHT,
        discountPercent: item.discountPercent || 0,
        tvaRate: item.tvaRate,
      }));
    }
    return [];
  });
  const [internalNotes, setInternalNotes] = useState("");
  const [publicNotes, setPublicNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Get selected client
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Load items from source facture
  const handleFactureChange = (factureId: string) => {
    setSelectedFactureId(factureId);
    if (factureId) {
      const facture = factures.find((f) => f.id === factureId);
      if (facture) {
        setSelectedClientId(facture.clientId);
        setItems(
          facture.items.map((item) => ({
            id: crypto.randomUUID(),
            catalogItemId: item.catalogItemId || undefined,
            reference: item.reference || "",
            designation: item.designation,
            description: item.description || "",
            quantity: item.quantity,
            unit: item.unit,
            unitPriceHT: item.unitPriceHT,
            discountPercent: item.discountPercent || 0,
            tvaRate: item.tvaRate,
          }))
        );
      }
    }
  };

  // Add new line item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        reference: "",
        designation: "",
        description: "",
        quantity: 1,
        unit: "pcs",
        unitPriceHT: 0,
        discountPercent: 0,
        tvaRate: 20,
      },
    ]);
  };

  // Remove line item
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Update line item
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Select catalog item
  const selectCatalogItem = (id: string, catalogItemId: string) => {
    const catalogItem = catalogItems.find((c) => c.id === catalogItemId);
    if (catalogItem) {
      updateItem(id, "catalogItemId", catalogItemId);
      updateItem(id, "reference", catalogItem.sku);
      updateItem(id, "designation", catalogItem.name);
      updateItem(id, "unitPriceHT", catalogItem.sellingPriceHT);
      updateItem(id, "tvaRate", catalogItem.tvaRate);
      updateItem(id, "unit", catalogItem.unit.toLowerCase());
    }
  };

  // Calculate line total
  const calculateLineTotal = (item: LineItem) => {
    const baseTotal = item.quantity * item.unitPriceHT;
    const discountAmount = item.discountPercent ? baseTotal * (item.discountPercent / 100) : 0;
    return baseTotal - discountAmount;
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);

  // Group TVA by rate
  const tvaByRate = items.reduce(
    (acc, item) => {
      const lineNet = calculateLineTotal(item);
      const tvaAmount = lineNet * (item.tvaRate / 100);

      if (!acc[item.tvaRate]) {
        acc[item.tvaRate] = { base: 0, amount: 0 };
      }
      acc[item.tvaRate].base += lineNet;
      acc[item.tvaRate].amount += tvaAmount;
      return acc;
    },
    {} as Record<number, { base: number; amount: number }>
  );

  const totalTVA = Object.values(tvaByRate).reduce((sum, { amount }) => sum + amount, 0);
  const totalTTC = subtotal + totalTVA;

  // Format currency
  const { format: formatCurrency } = useCurrency();

  // Validate form
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!selectedClientId) {
      newErrors.push(t.selectClientFirst);
    }
    if (items.length === 0) {
      newErrors.push(t.addItemFirst);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Submit form
  const handleSubmit = async (applyToFacture: boolean = false) => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/crm/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "AVOIR",
          clientId: selectedClientId,
          parentId: selectedFactureId || undefined,
          factureRef: selectedFactureId
            ? factures.find((f) => f.id === selectedFactureId)?.number
            : undefined,
          date: avoirDate,
          avoirReason,
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
          internalNotes,
          publicNotes,
          applyToFacture,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`${basePath}/${data.data.id}`);
      } else {
        setErrors([data.error || "Erreur lors de la création de l'avoir"]);
      }
    } catch (error) {
      console.error("Error creating avoir:", error);
      setErrors(["Erreur de connexion au serveur"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonOptions = [
    { value: "return", label: t.returnGoods },
    { value: "error", label: t.invoiceError },
    { value: "discount", label: t.commercialDiscount },
    { value: "quality", label: t.qualityIssue },
    { value: "other", label: t.other },
  ];

  const units = [
    { value: "pcs", label: t.pcs },
    { value: "m2", label: t.m2 },
    { value: "ml", label: t.ml },
    { value: "h", label: t.h },
    { value: "forfait", label: t.forfait },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={basePath}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MinusCircle className="h-7 w-7 text-red-600" />
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <ul className="list-disc list-inside">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Facture Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-600" />
              {t.clientInfo}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.sourceFacture}
                </label>
                <select
                  value={selectedFactureId}
                  onChange={(e) => handleFactureChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                >
                  <option value="">{t.noFacture}</option>
                  {factures.map((facture) => (
                    <option key={facture.id} value={facture.id}>
                      {facture.number} - {facture.clientName} ({formatCurrency(facture.totalTTC)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.selectClient} *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                  disabled={!!selectedFactureId}
                >
                  <option value="">{t.selectClient}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.clientNumber} - {client.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Client Info */}
            {selectedClient && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t.clientDetails}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t.address}:</span>
                    <p className="text-gray-900 dark:text-white">
                      {selectedClient.billingAddress || "-"}
                      {selectedClient.billingCity && `, ${selectedClient.billingCity}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t.ice}:</span>
                    <p className="text-gray-900 dark:text-white">{selectedClient.ice || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              {t.documentInfo}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.avoirDate} *
                </label>
                <input
                  type="date"
                  value={avoirDate}
                  onChange={(e) => setAvoirDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.avoirReason} *
                </label>
                <select
                  value={avoirReason}
                  onChange={(e) => setAvoirReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                >
                  <option value="">-- Sélectionner --</option>
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                {t.items}
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                {t.addItem}
              </button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-500">{t.designation}</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 w-20">{t.quantity}</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500 w-20">{t.unit}</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 w-28">{t.unitPrice}</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 w-20">{t.tva}</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500 w-28">{t.totalHT}</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <select
                            value={item.catalogItemId || ""}
                            onChange={(e) => selectCatalogItem(item.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                          >
                            <option value="">-- Catalogue --</option>
                            {catalogItems.map((ci) => (
                              <option key={ci.id} value={ci.id}>
                                {ci.sku} - {ci.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={item.designation}
                            onChange={(e) => updateItem(item.id, "designation", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                            placeholder={t.designation}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                        >
                          {units.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.unitPriceHT}
                          onChange={(e) => updateItem(item.id, "unitPriceHT", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.tvaRate}
                          onChange={(e) => updateItem(item.id, "tvaRate", parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                        >
                          <option value={0}>0%</option>
                          <option value={7}>7%</option>
                          <option value={10}>10%</option>
                          <option value={14}>14%</option>
                          <option value={20}>20%</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(calculateLineTotal(item))}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t.addItemFirst}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.notes}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.internalNotes}
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                  placeholder={t.internalNotes}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.publicNotes}
                </label>
                <textarea
                  value={publicNotes}
                  onChange={(e) => setPublicNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                  placeholder={t.publicNotes}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amber-600" />
              {t.summary}
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.subtotal}</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>

              {/* TVA breakdown */}
              {Object.entries(tvaByRate).map(([rate, { base, amount }]) => (
                <div key={rate} className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>TVA {rate}%</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
              ))}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.totalTVA}</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(totalTVA)}</span>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">{t.totalTTC}</span>
                  <span className="text-red-600">-{formatCurrency(totalTTC)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {t.saveDraft}
              </button>
              {selectedFactureId && (
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Receipt className="h-4 w-4" />
                  {t.saveAndApply}
                </button>
              )}
              <Link
                href={basePath}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t.cancel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
