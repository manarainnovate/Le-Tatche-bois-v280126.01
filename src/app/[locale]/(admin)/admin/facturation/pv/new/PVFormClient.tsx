"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ClipboardCheck,
  User,
  Calendar,
  FileText,
  Trash2,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PenTool,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Client {
  id: string;
  fullName: string;
  clientNumber: string;
  email: string | null;
  phone: string | null;
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
  totalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  catalogItem?: {
    id: string;
    sku: string;
    name: string;
  } | null;
}

interface BonLivraison {
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

type ReceptionStatus = "CONFORME" | "NON_CONFORME" | "RESERVE";

interface PVLineItem {
  id: string;
  sourceItemId?: string;
  reference: string | null;
  designation: string;
  description?: string;
  quantityDelivered: number;
  quantityAccepted: number;
  unit: string;
  status: ReceptionStatus;
  remarks?: string;
}

interface PVFormClientProps {
  locale: string;
  clients: Client[];
  bonsLivraison: BonLivraison[];
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
  bonLivraison: string;
  selectBL: string;
  noBLSelected: string;
  date: string;
  receptionDate: string;
  signedBy: string;
  signedByPlaceholder: string;
  notes: string;
  notesPlaceholder: string;
  internalNotes: string;
  internalNotesPlaceholder: string;
  items: string;
  reference: string;
  designation: string;
  delivered: string;
  accepted: string;
  unit: string;
  status: string;
  remarks: string;
  remarksPlaceholder: string;
  removeItem: string;
  noItems: string;
  selectBLFirst: string;
  receptionStatus: {
    conforme: string;
    nonConforme: string;
    reserve: string;
  };
  units: Record<string, string>;
  errors: {
    selectClient: string;
    selectBL: string;
    addItems: string;
  };
  success: string;
}

const translations: Record<string, Translations> = {
  fr: {
    title: "Nouveau PV de Réception",
    subtitle: "Créer un PV de réception à partir d'un bon de livraison",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement...",
    general: "Informations générales",
    client: "Client",
    selectClient: "Sélectionner un client",
    bonLivraison: "Bon de Livraison source (optionnel)",
    selectBL: "Sélectionner un BL (optionnel)",
    noBLSelected: "Aucun - saisie manuelle",
    date: "Date du PV",
    receptionDate: "Date de réception",
    signedBy: "Signé par",
    signedByPlaceholder: "Nom du signataire...",
    notes: "Observations générales",
    notesPlaceholder: "Observations sur la réception...",
    internalNotes: "Notes internes",
    internalNotesPlaceholder: "Notes internes (non visibles par le client)...",
    items: "Articles réceptionnés",
    reference: "Référence",
    designation: "Désignation",
    delivered: "Livré",
    accepted: "Accepté",
    unit: "Unité",
    status: "État",
    remarks: "Remarques",
    remarksPlaceholder: "Remarques sur cet article...",
    removeItem: "Supprimer",
    noItems: "Aucun article",
    selectBLFirst: "Sélectionnez un bon de livraison pour voir les articles",
    receptionStatus: {
      conforme: "Conforme",
      nonConforme: "Non conforme",
      reserve: "Avec réserves",
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
      selectBL: "Veuillez sélectionner un bon de livraison",
      addItems: "Veuillez ajouter au moins un article",
    },
    success: "PV de réception créé avec succès",
  },
  en: {
    title: "New Reception Report",
    subtitle: "Create a reception report from a delivery note",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    general: "General information",
    client: "Client",
    selectClient: "Select a client",
    bonLivraison: "Source Delivery Note (optional)",
    selectBL: "Select a DN (optional)",
    noBLSelected: "None - manual entry",
    date: "Report date",
    receptionDate: "Reception date",
    signedBy: "Signed by",
    signedByPlaceholder: "Signatory name...",
    notes: "General observations",
    notesPlaceholder: "Reception observations...",
    internalNotes: "Internal notes",
    internalNotesPlaceholder: "Internal notes (not visible to client)...",
    items: "Received items",
    reference: "Reference",
    designation: "Description",
    delivered: "Delivered",
    accepted: "Accepted",
    unit: "Unit",
    status: "Status",
    remarks: "Remarks",
    remarksPlaceholder: "Remarks about this item...",
    removeItem: "Remove",
    noItems: "No items",
    selectBLFirst: "Select a delivery note to see items",
    receptionStatus: {
      conforme: "Conforming",
      nonConforme: "Non-conforming",
      reserve: "With reservations",
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
      selectBL: "Please select a delivery note",
      addItems: "Please add at least one item",
    },
    success: "Reception report created successfully",
  },
  es: {
    title: "Nueva Acta de Recepción",
    subtitle: "Crear un acta de recepción a partir de un albarán",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    general: "Información general",
    client: "Cliente",
    selectClient: "Seleccionar cliente",
    bonLivraison: "Albarán de origen (opcional)",
    selectBL: "Seleccionar albarán (opcional)",
    noBLSelected: "Ninguno - entrada manual",
    date: "Fecha del acta",
    receptionDate: "Fecha de recepción",
    signedBy: "Firmado por",
    signedByPlaceholder: "Nombre del firmante...",
    notes: "Observaciones generales",
    notesPlaceholder: "Observaciones de la recepción...",
    internalNotes: "Notas internas",
    internalNotesPlaceholder: "Notas internas (no visibles para el cliente)...",
    items: "Artículos recibidos",
    reference: "Referencia",
    designation: "Descripción",
    delivered: "Entregado",
    accepted: "Aceptado",
    unit: "Unidad",
    status: "Estado",
    remarks: "Observaciones",
    remarksPlaceholder: "Observaciones sobre este artículo...",
    removeItem: "Eliminar",
    noItems: "Sin artículos",
    selectBLFirst: "Seleccione un albarán para ver los artículos",
    receptionStatus: {
      conforme: "Conforme",
      nonConforme: "No conforme",
      reserve: "Con reservas",
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
      selectBL: "Por favor seleccione un albarán",
      addItems: "Por favor añada al menos un artículo",
    },
    success: "Acta de recepción creada con éxito",
  },
  ar: {
    title: "محضر استلام جديد",
    subtitle: "إنشاء محضر استلام من سند تسليم",
    back: "رجوع",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    general: "معلومات عامة",
    client: "العميل",
    selectClient: "اختر عميلاً",
    bonLivraison: "سند التسليم المصدر (اختياري)",
    selectBL: "اختر سند تسليم (اختياري)",
    noBLSelected: "بدون - إدخال يدوي",
    date: "تاريخ المحضر",
    receptionDate: "تاريخ الاستلام",
    signedBy: "موقع من طرف",
    signedByPlaceholder: "اسم الموقّع...",
    notes: "ملاحظات عامة",
    notesPlaceholder: "ملاحظات على الاستلام...",
    internalNotes: "ملاحظات داخلية",
    internalNotesPlaceholder: "ملاحظات داخلية (غير مرئية للعميل)...",
    items: "العناصر المستلمة",
    reference: "المرجع",
    designation: "الوصف",
    delivered: "المُسلَّم",
    accepted: "المقبول",
    unit: "الوحدة",
    status: "الحالة",
    remarks: "ملاحظات",
    remarksPlaceholder: "ملاحظات حول هذا العنصر...",
    removeItem: "حذف",
    noItems: "لا عناصر",
    selectBLFirst: "اختر سند تسليم لرؤية العناصر",
    receptionStatus: {
      conforme: "مطابق",
      nonConforme: "غير مطابق",
      reserve: "مع تحفظات",
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
      selectBL: "يرجى اختيار سند تسليم",
      addItems: "يرجى إضافة عنصر واحد على الأقل",
    },
    success: "تم إنشاء محضر الاستلام بنجاح",
  },
};

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function PVFormClient({
  locale,
  clients,
  bonsLivraison,
  parentDocument,
}: PVFormClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr) as Translations;

  // Form state
  const [selectedClientId, setSelectedClientId] = useState(parentDocument?.clientId || "");
  const [selectedBLId, setSelectedBLId] = useState(parentDocument?.id || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receptionDate, setReceptionDate] = useState(new Date().toISOString().split("T")[0]);
  const [signedBy, setSignedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [items, setItems] = useState<PVLineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const basePath = `/${locale}/admin/facturation/pv`;

  // Initialize items from parent document
  useEffect(() => {
    if (parentDocument) {
      const initialItems: PVLineItem[] = parentDocument.items.map((item) => ({
        id: crypto.randomUUID(),
        sourceItemId: item.id,
        reference: item.reference,
        designation: item.designation,
        description: item.description || undefined,
        quantityDelivered: item.quantity,
        quantityAccepted: item.quantity, // Default to accepting all
        unit: item.unit,
        status: "CONFORME" as ReceptionStatus,
        remarks: "",
      }));
      setItems(initialItems);
    }
  }, [parentDocument]);

  // Handle BL selection
  const handleBLChange = (blId: string) => {
    setSelectedBLId(blId);
    const bl = bonsLivraison.find((b) => b.id === blId);
    if (bl) {
      setSelectedClientId(bl.clientId);

      // Load items from BL
      const newItems: PVLineItem[] = bl.items.map((item) => ({
        id: crypto.randomUUID(),
        sourceItemId: item.id,
        reference: item.reference,
        designation: item.designation,
        description: item.description || undefined,
        quantityDelivered: item.quantity,
        quantityAccepted: item.quantity,
        unit: item.unit,
        status: "CONFORME" as ReceptionStatus,
        remarks: "",
      }));
      setItems(newItems);
    }
  };

  // Update item
  const updateItem = (itemId: string, updates: Partial<PVLineItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Get status icon
  const getStatusIcon = (status: ReceptionStatus) => {
    switch (status) {
      case "CONFORME":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "NON_CONFORME":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "RESERVE":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  // Get selected client
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Filter BLs by selected client (if any)
  const filteredBLs = selectedClientId
    ? bonsLivraison.filter((bl) => bl.clientId === selectedClientId)
    : bonsLivraison;

  // Add custom item (manual entry without BL)
  const addCustomItem = () => {
    const newItem: PVLineItem = {
      id: crypto.randomUUID(),
      reference: "",
      designation: "",
      description: "",
      quantityDelivered: 0,
      quantityAccepted: 1,
      unit: "PCS",
      status: "CONFORME",
      remarks: "",
    };
    setItems([...items, newItem]);
  };

  // Update item field
  const updateItemField = (itemId: string, field: keyof PVLineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Handle save
  const handleSave = async () => {
    // Validation - only client is required, BL is optional
    if (!selectedClientId) {
      setError(t.errors.selectClient);
      return;
    }
    // BL source is now OPTIONAL - removed validation
    if (items.length === 0) {
      setError(t.errors.addItems);
      return;
    }

    // Validate that all items have a designation (required by API)
    const invalidItems = items.filter(item => !item.designation || item.designation.trim() === '');
    if (invalidItems.length > 0) {
      setError(locale === 'fr'
        ? 'Veuillez remplir la désignation pour tous les articles'
        : locale === 'en'
        ? 'Please fill in the designation for all items'
        : locale === 'es'
        ? 'Por favor complete la designación para todos los artículos'
        : 'يرجى ملء الوصف لجميع العناصر');
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/crm/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PV_RECEPTION",
          clientId: selectedClientId,
          parentId: selectedBLId || undefined, // BL is now optional
          date: date, // Send as string, API will handle conversion
          receptionDate: receptionDate,
          signedBy,
          notes,
          internalNotes,
          items: items.map((item) => ({
            sourceItemId: item.sourceItemId,
            reference: item.reference,
            designation: item.designation,
            description: item.description,
            quantity: item.quantityAccepted,
            unit: item.unit,
            unitPriceHT: 0, // PV doesn't have prices
            tvaRate: 0,
            metadata: {
              quantityDelivered: item.quantityDelivered,
              status: item.status,
              remarks: item.remarks,
            },
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
              <ClipboardCheck className="h-7 w-7 text-amber-600" />
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
                    setSelectedBLId("");
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

              {/* Bon de Livraison */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {t.bonLivraison}
                </label>
                <select
                  value={selectedBLId}
                  onChange={(e) => handleBLChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                  disabled={!!parentDocument}
                >
                  <option value="">{t.selectBL}</option>
                  {filteredBLs.map((bl) => (
                    <option key={bl.id} value={bl.id}>
                      {bl.number} - {bl.clientName}
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

              {/* Reception Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <ClipboardCheck className="h-4 w-4 inline mr-1" />
                  {t.receptionDate}
                </label>
                <input
                  type="date"
                  value={receptionDate}
                  onChange={(e) => setReceptionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Signed By */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <PenTool className="h-4 w-4 inline mr-1" />
                  {t.signedBy}
                </label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  placeholder={t.signedByPlaceholder}
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
                Ajouter
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Ajoutez des articles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.reference || ""}
                            onChange={(e) => updateItemField(item.id, "reference", e.target.value)}
                            className="w-32 px-2 py-1 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800"
                            placeholder="REF"
                          />
                          {getStatusIcon(item.status)}
                        </div>
                        <input
                          type="text"
                          value={item.designation}
                          onChange={(e) => updateItemField(item.id, "designation", e.target.value)}
                          className={cn(
                            "w-full px-2 py-1 font-medium border rounded focus:ring-1 bg-white dark:bg-gray-800",
                            !item.designation || item.designation.trim() === ''
                              ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-600 focus:ring-amber-500"
                          )}
                          placeholder={`${t.designation} *`}
                          required
                        />
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title={t.removeItem}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t.delivered}
                        </label>
                        <input
                          type="number"
                          value={item.quantityDelivered}
                          onChange={(e) => updateItemField(item.id, "quantityDelivered", parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t.accepted}
                        </label>
                        <input
                          type="number"
                          value={item.quantityAccepted}
                          onChange={(e) =>
                            updateItem(item.id, {
                              quantityAccepted: parseFloat(e.target.value) || 0,
                            })
                          }
                          min="0"
                          step="0.001"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t.status}
                        </label>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateItem(item.id, {
                              status: e.target.value as ReceptionStatus,
                            })
                          }
                          className={cn(
                            "w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500",
                            item.status === "CONFORME" &&
                              "border-green-300 bg-green-50 dark:bg-green-900/20",
                            item.status === "NON_CONFORME" &&
                              "border-red-300 bg-red-50 dark:bg-red-900/20",
                            item.status === "RESERVE" &&
                              "border-amber-300 bg-amber-50 dark:bg-amber-900/20"
                          )}
                        >
                          <option value="CONFORME">{t.receptionStatus.conforme}</option>
                          <option value="NON_CONFORME">{t.receptionStatus.nonConforme}</option>
                          <option value="RESERVE">{t.receptionStatus.reserve}</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">
                          {t.remarks}
                        </label>
                        <input
                          type="text"
                          value={item.remarks || ""}
                          onChange={(e) =>
                            updateItem(item.id, { remarks: e.target.value })
                          }
                          placeholder={t.remarksPlaceholder}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Résumé
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Articles</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {t.receptionStatus.conforme}
                </span>
                <span className="font-medium">
                  {items.filter((i) => i.status === "CONFORME").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  {t.receptionStatus.reserve}
                </span>
                <span className="font-medium">
                  {items.filter((i) => i.status === "RESERVE").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  {t.receptionStatus.nonConforme}
                </span>
                <span className="font-medium">
                  {items.filter((i) => i.status === "NON_CONFORME").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
