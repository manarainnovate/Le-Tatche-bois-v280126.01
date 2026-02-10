"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Truck,
  User,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Package,
  Loader2,
  MapPin,
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
  totalHT: number;
  tvaRate: number;
  totalTVA: number;
  totalTTC: number;
  catalogItem?: {
    id: string;
    sku: string;
    name: string;
  } | null;
}

interface BonCommande {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  totalTTC: number;
  client: {
    id: string;
    fullName: string;
    clientNumber: string;
  } | null;
  items: DocumentItem[];
}

interface ParentDocument {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  totalHT: number;
  totalTTC: number;
  client: Client | null;
  project: {
    id: string;
    name: string;
    projectNumber: string;
  } | null;
  items: DocumentItem[];
}

interface BLLineItem {
  id: string;
  sourceItemId?: string;
  reference: string | null;
  designation: string;
  description?: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unit: string;
  unitPriceHT: number;
  tvaRate: number;
}

interface BLFormClientProps {
  locale: string;
  clients: Client[];
  bonsCommande: BonCommande[];
  parentDocument?: ParentDocument | null;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

interface Translations {
  title: string;
  subtitle: string;
  back: string;
  save: string;
  saving: string;
  general: string;
  client: string;
  selectClient: string;
  bonCommande: string;
  selectBC: string;
  noBCSelected: string;
  date: string;
  deliveryDate: string;
  deliveryAddress: string;
  notes: string;
  notesPlaceholder: string;
  internalNotes: string;
  internalNotesPlaceholder: string;
  items: string;
  reference: string;
  designation: string;
  ordered: string;
  delivered: string;
  unit: string;
  unitPrice: string;
  total: string;
  addItem: string;
  removeItem: string;
  noItems: string;
  selectBCFirst: string;
  totals: {
    totalHT: string;
    tva: string;
    totalTTC: string;
  };
  units: Record<string, string>;
  errors: {
    selectClient: string;
    selectBC: string;
    addItems: string;
    invalidQuantity: string;
  };
  success: string;
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Nouveau Bon de Livraison",
    subtitle: "Créer un nouveau BL à partir d'un bon de commande",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    general: "Informations générales",
    client: "Client",
    selectClient: "Sélectionner un client",
    bonCommande: "Bon de Commande source (optionnel)",
    selectBC: "Sélectionner un BC (optionnel)",
    noBCSelected: "Aucun - saisie manuelle",
    date: "Date du BL",
    deliveryDate: "Date de livraison",
    deliveryAddress: "Adresse de livraison",
    notes: "Notes (apparaissent sur le document)",
    notesPlaceholder: "Notes visibles par le client...",
    internalNotes: "Notes internes",
    internalNotesPlaceholder: "Notes internes (non visibles par le client)...",
    items: "Articles à livrer",
    reference: "Référence",
    designation: "Désignation",
    ordered: "Commandé",
    delivered: "À livrer",
    unit: "Unité",
    unitPrice: "PU HT",
    total: "Total HT",
    addItem: "Ajouter un article",
    removeItem: "Supprimer",
    noItems: "Aucun article",
    selectBCFirst: "Sélectionnez un bon de commande pour voir les articles",
    totals: {
      totalHT: "Total HT",
      tva: "TVA",
      totalTTC: "Total TTC",
    },
    units: {
      PCS: "pcs",
      M2: "m²",
      ML: "ml",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "forfait",
      DAY: "jour",
    },
    errors: {
      selectClient: "Veuillez sélectionner un client",
      selectBC: "Veuillez sélectionner un bon de commande",
      addItems: "Veuillez ajouter au moins un article",
      invalidQuantity: "La quantité à livrer ne peut pas dépasser la quantité commandée",
    },
    success: "Bon de livraison créé avec succès",
  },
  en: {
    title: "New Delivery Note",
    subtitle: "Create a new delivery note from a purchase order",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    general: "General information",
    client: "Client",
    selectClient: "Select a client",
    bonCommande: "Source Purchase Order (optional)",
    selectBC: "Select a PO (optional)",
    noBCSelected: "None - manual entry",
    date: "Delivery note date",
    deliveryDate: "Delivery date",
    deliveryAddress: "Delivery address",
    notes: "Notes (appear on document)",
    notesPlaceholder: "Notes visible to client...",
    internalNotes: "Internal notes",
    internalNotesPlaceholder: "Internal notes (not visible to client)...",
    items: "Items to deliver",
    reference: "Reference",
    designation: "Description",
    ordered: "Ordered",
    delivered: "To deliver",
    unit: "Unit",
    unitPrice: "Unit price",
    total: "Total",
    addItem: "Add item",
    removeItem: "Remove",
    noItems: "No items",
    selectBCFirst: "Select a purchase order to see items",
    totals: {
      totalHT: "Subtotal",
      tva: "VAT",
      totalTTC: "Total incl. VAT",
    },
    units: {
      PCS: "pcs",
      M2: "m²",
      ML: "lm",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "flat",
      DAY: "day",
    },
    errors: {
      selectClient: "Please select a client",
      selectBC: "Please select a purchase order",
      addItems: "Please add at least one item",
      invalidQuantity: "Delivery quantity cannot exceed ordered quantity",
    },
    success: "Delivery note created successfully",
  },
  es: {
    title: "Nuevo Albarán",
    subtitle: "Crear un nuevo albarán a partir de un pedido",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    general: "Información general",
    client: "Cliente",
    selectClient: "Seleccionar cliente",
    bonCommande: "Pedido de origen (opcional)",
    selectBC: "Seleccionar pedido (opcional)",
    noBCSelected: "Ninguno - entrada manual",
    date: "Fecha del albarán",
    deliveryDate: "Fecha de entrega",
    deliveryAddress: "Dirección de entrega",
    notes: "Notas (aparecen en el documento)",
    notesPlaceholder: "Notas visibles para el cliente...",
    internalNotes: "Notas internas",
    internalNotesPlaceholder: "Notas internas (no visibles para el cliente)...",
    items: "Artículos a entregar",
    reference: "Referencia",
    designation: "Descripción",
    ordered: "Pedido",
    delivered: "A entregar",
    unit: "Unidad",
    unitPrice: "Precio unit.",
    total: "Total",
    addItem: "Añadir artículo",
    removeItem: "Eliminar",
    noItems: "Sin artículos",
    selectBCFirst: "Seleccione un pedido para ver los artículos",
    totals: {
      totalHT: "Subtotal",
      tva: "IVA",
      totalTTC: "Total con IVA",
    },
    units: {
      PCS: "pzs",
      M2: "m²",
      ML: "ml",
      M3: "m³",
      KG: "kg",
      L: "L",
      H: "h",
      FORFAIT: "tarifa",
      DAY: "día",
    },
    errors: {
      selectClient: "Por favor seleccione un cliente",
      selectBC: "Por favor seleccione un pedido",
      addItems: "Por favor añada al menos un artículo",
      invalidQuantity: "La cantidad a entregar no puede exceder la cantidad pedida",
    },
    success: "Albarán creado con éxito",
  },
  ar: {
    title: "سند تسليم جديد",
    subtitle: "إنشاء سند تسليم جديد من أمر شراء",
    back: "رجوع",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    general: "معلومات عامة",
    client: "العميل",
    selectClient: "اختر عميلاً",
    bonCommande: "أمر الشراء المصدر (اختياري)",
    selectBC: "اختر أمر شراء (اختياري)",
    noBCSelected: "بدون - إدخال يدوي",
    date: "تاريخ السند",
    deliveryDate: "تاريخ التسليم",
    deliveryAddress: "عنوان التسليم",
    notes: "ملاحظات (تظهر على المستند)",
    notesPlaceholder: "ملاحظات مرئية للعميل...",
    internalNotes: "ملاحظات داخلية",
    internalNotesPlaceholder: "ملاحظات داخلية (غير مرئية للعميل)...",
    items: "العناصر للتسليم",
    reference: "المرجع",
    designation: "الوصف",
    ordered: "المطلوب",
    delivered: "للتسليم",
    unit: "الوحدة",
    unitPrice: "سعر الوحدة",
    total: "الإجمالي",
    addItem: "إضافة عنصر",
    removeItem: "حذف",
    noItems: "لا عناصر",
    selectBCFirst: "اختر أمر شراء لرؤية العناصر",
    totals: {
      totalHT: "المجموع بدون ضريبة",
      tva: "الضريبة",
      totalTTC: "المجموع مع الضريبة",
    },
    units: {
      PCS: "قطعة",
      M2: "م²",
      ML: "م.ط",
      M3: "م³",
      KG: "كغ",
      L: "ل",
      H: "س",
      FORFAIT: "جزافي",
      DAY: "يوم",
    },
    errors: {
      selectClient: "يرجى اختيار عميل",
      selectBC: "يرجى اختيار أمر شراء",
      addItems: "يرجى إضافة عنصر واحد على الأقل",
      invalidQuantity: "كمية التسليم لا يمكن أن تتجاوز الكمية المطلوبة",
    },
    success: "تم إنشاء سند التسليم بنجاح",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function BLFormClient({
  locale,
  clients,
  bonsCommande,
  parentDocument,
}: BLFormClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  // Form state
  const [selectedClientId, setSelectedClientId] = useState(parentDocument?.clientId || "");
  const [selectedBCId, setSelectedBCId] = useState(parentDocument?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [items, setItems] = useState<BLLineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const basePath = `/${locale}/admin/facturation/bl`;

  // Initialize items from parent document
  useEffect(() => {
    if (parentDocument) {
      const initialItems: BLLineItem[] = parentDocument.items.map((item) => ({
        id: crypto.randomUUID(),
        sourceItemId: item.id,
        reference: item.reference,
        designation: item.designation,
        description: item.description || undefined,
        quantityOrdered: item.quantity,
        quantityDelivered: item.quantity, // Default to full delivery
        unit: item.unit,
        unitPriceHT: item.unitPriceHT,
        tvaRate: item.tvaRate,
      }));
      setItems(initialItems);

      // Set delivery address from client
      if (parentDocument.client) {
        const addr = [
          parentDocument.client.billingAddress,
          parentDocument.client.billingCity,
          parentDocument.client.billingPostalCode,
        ]
          .filter(Boolean)
          .join(", ");
        setDeliveryAddress(addr);
      }
    }
  }, [parentDocument]);

  // Handle BC selection
  const handleBCChange = (bcId: string) => {
    setSelectedBCId(bcId);
    const bc = bonsCommande.find((b) => b.id === bcId);
    if (bc) {
      setSelectedClientId(bc.clientId);

      // Load items from BC
      const newItems: BLLineItem[] = bc.items.map((item) => ({
        id: crypto.randomUUID(),
        sourceItemId: item.id,
        reference: item.reference,
        designation: item.designation,
        description: item.description || undefined,
        quantityOrdered: item.quantity,
        quantityDelivered: item.quantity,
        unit: item.unit,
        unitPriceHT: item.unitPriceHT,
        tvaRate: item.tvaRate,
      }));
      setItems(newItems);

      // Set delivery address
      if (bc.client) {
        const client = clients.find((c) => c.id === bc.client!.id);
        if (client) {
          const addr = [client.billingAddress, client.billingCity, client.billingPostalCode]
            .filter(Boolean)
            .join(", ");
          setDeliveryAddress(addr);
        }
      }
    }
  };

  // Update quantity for an item
  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantityDelivered: Math.min(quantity, item.quantityOrdered) }
          : item
      )
    );
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Calculate totals
  const calculateTotals = () => {
    const itemTotals = items.map((item) => {
      const totalHT = item.quantityDelivered * item.unitPriceHT;
      const tvaAmount = totalHT * (item.tvaRate / 100);
      return { totalHT, tvaAmount };
    });

    const totalHT = itemTotals.reduce((sum, item) => sum + item.totalHT, 0);
    const totalTVA = itemTotals.reduce((sum, item) => sum + item.tvaAmount, 0);
    const totalTTC = totalHT + totalTVA;

    return { totalHT, totalTVA, totalTTC };
  };

  const totals = calculateTotals();

  const { format: formatCurrency } = useCurrency();

  // Get selected client
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Filter BCs by selected client (if any)
  const filteredBCs = selectedClientId
    ? bonsCommande.filter((bc) => bc.clientId === selectedClientId)
    : bonsCommande;

  // Add custom item (manual entry without BC)
  const addCustomItem = () => {
    const newItem: BLLineItem = {
      id: crypto.randomUUID(),
      reference: "",
      designation: "",
      description: "",
      quantityOrdered: 0,
      quantityDelivered: 1,
      unit: "PCS",
      unitPriceHT: 0,
      tvaRate: 20,
    };
    setItems([...items, newItem]);
  };

  // Update item field
  const updateItemField = (itemId: string, field: keyof BLLineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle save
  const handleSave = async () => {
    // Validation - only client is required, BC is optional
    if (!selectedClientId) {
      setError(t.errors.selectClient);
      return;
    }
    // BC source is now OPTIONAL - removed validation
    if (items.filter((i) => i.quantityDelivered > 0).length === 0) {
      setError(t.errors.addItems);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/crm/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BON_LIVRAISON",
          clientId: selectedClientId,
          parentId: selectedBCId || undefined, // BC is now optional
          date: date, // Send as string, API will handle conversion
          deliveryDate: deliveryDate || undefined,
          deliveryAddress,
          notes,
          internalNotes,
          items: items
            .filter((item) => item.quantityDelivered > 0)
            .map((item) => ({
              sourceItemId: item.sourceItemId,
              reference: item.reference,
              designation: item.designation,
              description: item.description,
              quantity: item.quantityDelivered,
              unit: item.unit,
              unitPriceHT: item.unitPriceHT,
              tvaRate: item.tvaRate,
            })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`${basePath}/${data.data.id}`);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={basePath}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="h-7 w-7 text-amber-600" />
              {t.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? t.saving : t.save}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              {t.general}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  {t.client} *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setSelectedBCId("");
                    setItems([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                  disabled={!!parentDocument}
                >
                  <option value="">{t.selectClient}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.fullName} ({client.clientNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bon de Commande */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {t.bonCommande}
                </label>
                <select
                  value={selectedBCId}
                  onChange={(e) => handleBCChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                  disabled={!!parentDocument}
                >
                  <option value="">{t.selectBC}</option>
                  {filteredBCs.map((bc) => (
                    <option key={bc.id} value={bc.id}>
                      {bc.number} - {bc.clientName} ({formatCurrency(bc.totalTTC)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {t.date} *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Truck className="h-4 w-4 inline mr-1" />
                  {t.deliveryDate}
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {t.deliveryAddress}
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-600" />
                {t.items}
              </h2>
              <button
                type="button"
                onClick={addCustomItem}
                className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                {t.addItem}
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t.addItem}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">
                        {t.reference}
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 uppercase">
                        {t.designation}
                      </th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-gray-500 uppercase">
                        {t.ordered}
                      </th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-gray-500 uppercase">
                        {t.delivered}
                      </th>
                      <th className="text-center py-2 px-2 text-xs font-medium text-gray-500 uppercase">
                        {t.unit}
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase">
                        {t.unitPrice}
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 uppercase">
                        {t.total}
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.reference || ""}
                            onChange={(e) => updateItemField(item.id, "reference", e.target.value)}
                            className="w-full px-2 py-1 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                            placeholder="REF"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.designation}
                            onChange={(e) => updateItemField(item.id, "designation", e.target.value)}
                            className="w-full px-2 py-1 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                            placeholder={t.designation}
                          />
                        </td>
                        <td className="py-2 px-2 text-center text-sm text-gray-500">
                          {item.quantityOrdered}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.quantityDelivered}
                            onChange={(e) =>
                              updateItemQuantity(item.id, parseFloat(e.target.value) || 0)
                            }
                            min="0"
                            max={item.quantityOrdered}
                            step="0.001"
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="py-2 px-2 text-center text-sm text-gray-500">
                          {t.units[item.unit] || item.unit}
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.unitPriceHT}
                            onChange={(e) => updateItemField(item.id, "unitPriceHT", parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 px-2 text-right text-sm font-semibold">
                          {formatCurrency(item.quantityDelivered * item.unitPriceHT)}
                        </td>
                        <td className="py-2 px-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title={t.removeItem}
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
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={t.notesPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.internalNotes}
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  placeholder={t.internalNotesPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          {selectedClient && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-amber-600" />
                {t.client}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedClient.fullName}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedClient.clientNumber}
                </p>
                {selectedClient.billingAddress && (
                  <p className="text-gray-500 dark:text-gray-400">
                    {selectedClient.billingAddress}
                    <br />
                    {selectedClient.billingCity} {selectedClient.billingPostalCode}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              {t.totals.totalTTC}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.totals.totalHT}</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(totals.totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.totals.tva}</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(totals.totalTVA)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {t.totals.totalTTC}
                </span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totals.totalTTC)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
