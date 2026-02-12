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
  Building2,
  CreditCard,
  AlertTriangle,
  X,
  UserPlus,
  Check,
  Pencil,
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
  paymentTerms: string | null;
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

interface AvailableDocument {
  id: string;
  type: string;
  number: string;
  clientId: string;
  clientName: string;
  totalTTC: number;
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
  // Validation state
  isValidated: boolean;
  isEditing: boolean;
  validationErrors: string[];
}

interface ExistingDocument extends ParentDocument {
  date: Date;
  dueDate: Date | null;
  paymentTerms: string | null;
  discountType: string | null;
  discountValue: number | null;
  depositPercent: number | null;
  depositAmount: number | null;
  internalNotes: string | null;
  publicNotes: string | null;
  footerText: string | null;
}

interface FactureFormClientProps {
  locale: string;
  clients: Client[];
  availableDocuments: AvailableDocument[];
  catalogItems: CatalogItem[];
  parentDocument: ParentDocument | null;
  existingDocument?: ExistingDocument | null;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations: Record<string, Record<string, string>> = {
  fr: {
    title: "Nouvelle Facture",
    titleEdit: "Modifier la Facture",
    subtitle: "Créer une nouvelle facture",
    subtitleEdit: "Modifier le brouillon de facture",
    back: "Retour aux factures",
    // Form sections
    clientInfo: "Informations client",
    selectClient: "Sélectionner un client",
    selectedClient: "Client sélectionné",
    clientDetails: "Détails du client",
    address: "Adresse",
    ice: "ICE",
    taxId: "IF",
    sourceDocument: "Document source",
    selectSource: "Sélectionner un document source (PV, BL ou BC)",
    noSource: "Aucun (facture libre)",
    documentInfo: "Informations du document",
    factureDate: "Date de facture",
    dueDate: "Date d'échéance",
    paymentTerms: "Conditions de paiement",
    selectPaymentTerms: "Sélectionner",
    items: "Articles / Prestations",
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
    lineTotal: "Total ligne",
    globalDiscount: "Remise globale",
    discountType: "Type",
    percentage: "Pourcentage",
    fixed: "Montant fixe",
    discountValue: "Valeur",
    summary: "Récapitulatif",
    subtotal: "Sous-total HT",
    discountAmount: "Remise",
    netHT: "Net HT",
    totalTVA: "Total TVA",
    totalTTC: "Total TTC",
    notes: "Notes et conditions",
    internalNotes: "Notes internes",
    publicNotes: "Notes sur la facture",
    footerText: "Texte de pied de page",
    actions: "Actions",
    saveDraft: "Enregistrer brouillon",
    saveAndSend: "Enregistrer et envoyer",
    cancel: "Annuler",
    // Validation
    selectClientFirst: "Veuillez sélectionner un client",
    addItemFirst: "Veuillez ajouter au moins un article",
    // Units
    pcs: "Pcs",
    m2: "M²",
    ml: "ML",
    h: "H",
    forfait: "Forfait",
    // Payment terms
    comptant: "Comptant",
    days15: "15 jours",
    days30: "30 jours",
    days45: "45 jours",
    days60: "60 jours",
    days90: "90 jours",
    acompte50: "50% acompte, solde à livraison",
  },
  en: {
    title: "New Invoice",
    titleEdit: "Edit Invoice",
    subtitle: "Create a new invoice",
    subtitleEdit: "Edit invoice draft",
    back: "Back to invoices",
    clientInfo: "Client Information",
    selectClient: "Select a client",
    selectedClient: "Selected client",
    clientDetails: "Client details",
    address: "Address",
    ice: "ICE",
    taxId: "Tax ID",
    sourceDocument: "Source document",
    selectSource: "Select a source document (Receipt, Delivery or PO)",
    noSource: "None (direct invoice)",
    documentInfo: "Document Information",
    factureDate: "Invoice date",
    dueDate: "Due date",
    paymentTerms: "Payment terms",
    selectPaymentTerms: "Select",
    items: "Items / Services",
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
    lineTotal: "Line total",
    globalDiscount: "Global discount",
    discountType: "Type",
    percentage: "Percentage",
    fixed: "Fixed amount",
    discountValue: "Value",
    summary: "Summary",
    subtotal: "Subtotal",
    discountAmount: "Discount",
    netHT: "Net excl. VAT",
    totalTVA: "Total VAT",
    totalTTC: "Total incl. VAT",
    notes: "Notes and conditions",
    internalNotes: "Internal notes",
    publicNotes: "Invoice notes",
    footerText: "Footer text",
    actions: "Actions",
    saveDraft: "Save as draft",
    saveAndSend: "Save and send",
    cancel: "Cancel",
    selectClientFirst: "Please select a client",
    addItemFirst: "Please add at least one item",
    pcs: "Pcs",
    m2: "M²",
    ml: "LM",
    h: "H",
    forfait: "Fixed",
    comptant: "Cash",
    days15: "15 days",
    days30: "30 days",
    days45: "45 days",
    days60: "60 days",
    days90: "90 days",
    acompte50: "50% deposit, balance on delivery",
  },
  es: {
    title: "Nueva Factura",
    titleEdit: "Editar Factura",
    subtitle: "Crear una nueva factura",
    subtitleEdit: "Editar borrador de factura",
    back: "Volver a facturas",
    clientInfo: "Información del cliente",
    selectClient: "Seleccionar cliente",
    selectedClient: "Cliente seleccionado",
    clientDetails: "Detalles del cliente",
    address: "Dirección",
    ice: "ICE",
    taxId: "NIF",
    sourceDocument: "Documento fuente",
    selectSource: "Seleccionar documento fuente",
    noSource: "Ninguno (factura directa)",
    documentInfo: "Información del documento",
    factureDate: "Fecha de factura",
    dueDate: "Fecha de vencimiento",
    paymentTerms: "Condiciones de pago",
    selectPaymentTerms: "Seleccionar",
    items: "Artículos / Servicios",
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
    lineTotal: "Total línea",
    globalDiscount: "Descuento global",
    discountType: "Tipo",
    percentage: "Porcentaje",
    fixed: "Importe fijo",
    discountValue: "Valor",
    summary: "Resumen",
    subtotal: "Subtotal",
    discountAmount: "Descuento",
    netHT: "Neto sin IVA",
    totalTVA: "Total IVA",
    totalTTC: "Total con IVA",
    notes: "Notas y condiciones",
    internalNotes: "Notas internas",
    publicNotes: "Notas en factura",
    footerText: "Texto de pie",
    actions: "Acciones",
    saveDraft: "Guardar borrador",
    saveAndSend: "Guardar y enviar",
    cancel: "Cancelar",
    selectClientFirst: "Por favor seleccione un cliente",
    addItemFirst: "Por favor añada al menos un artículo",
    pcs: "Uds",
    m2: "M²",
    ml: "ML",
    h: "H",
    forfait: "Fijo",
    comptant: "Contado",
    days15: "15 días",
    days30: "30 días",
    days45: "45 días",
    days60: "60 días",
    days90: "90 días",
    acompte50: "50% anticipo, saldo a entrega",
  },
  ar: {
    title: "فاتورة جديدة",
    titleEdit: "تعديل الفاتورة",
    subtitle: "إنشاء فاتورة جديدة",
    subtitleEdit: "تعديل مسودة الفاتورة",
    back: "العودة إلى الفواتير",
    clientInfo: "معلومات العميل",
    selectClient: "اختر عميل",
    selectedClient: "العميل المحدد",
    clientDetails: "تفاصيل العميل",
    address: "العنوان",
    ice: "ICE",
    taxId: "الرقم الضريبي",
    sourceDocument: "المستند المصدر",
    selectSource: "اختر مستند مصدر",
    noSource: "بدون (فاتورة مباشرة)",
    documentInfo: "معلومات المستند",
    factureDate: "تاريخ الفاتورة",
    dueDate: "تاريخ الاستحقاق",
    paymentTerms: "شروط الدفع",
    selectPaymentTerms: "اختر",
    items: "المنتجات / الخدمات",
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
    lineTotal: "إجمالي السطر",
    globalDiscount: "خصم عام",
    discountType: "النوع",
    percentage: "نسبة مئوية",
    fixed: "مبلغ ثابت",
    discountValue: "القيمة",
    summary: "الملخص",
    subtotal: "المجموع الفرعي",
    discountAmount: "الخصم",
    netHT: "الصافي بدون ضريبة",
    totalTVA: "إجمالي الضريبة",
    totalTTC: "الإجمالي مع الضريبة",
    notes: "الملاحظات والشروط",
    internalNotes: "ملاحظات داخلية",
    publicNotes: "ملاحظات على الفاتورة",
    footerText: "نص التذييل",
    actions: "الإجراءات",
    saveDraft: "حفظ كمسودة",
    saveAndSend: "حفظ وإرسال",
    cancel: "إلغاء",
    selectClientFirst: "الرجاء اختيار عميل",
    addItemFirst: "الرجاء إضافة عنصر واحد على الأقل",
    pcs: "قطعة",
    m2: "م²",
    ml: "م.ط",
    h: "س",
    forfait: "مقطوعية",
    comptant: "نقداً",
    days15: "15 يوم",
    days30: "30 يوم",
    days45: "45 يوم",
    days60: "60 يوم",
    days90: "90 يوم",
    acompte50: "50% مقدم، الباقي عند التسليم",
  },
};

// ═══════════════════════════════════════════════════════════
// Helper: Convert number to French words
// ═══════════════════════════════════════════════════════════

function numberToFrenchWords(n: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  if (n === 0) return 'zéro';

  function convert(num: number): string {
    if (num < 20) return units[num];
    if (num < 100) {
      const t = Math.floor(num / 10);
      const u = num % 10;
      if (t === 7 || t === 9) {
        return tens[t] + '-' + units[10 + u];
      }
      if (u === 0) return tens[t] + (t === 8 ? 's' : '');
      if (u === 1 && t !== 8) return tens[t] + ' et un';
      return tens[t] + '-' + units[u];
    }
    if (num < 1000) {
      const h = Math.floor(num / 100);
      const rest = num % 100;
      let str = h === 1 ? 'cent' : units[h] + ' cent';
      if (rest === 0 && h > 1) str += 's';
      if (rest > 0) str += ' ' + convert(rest);
      return str;
    }
    if (num < 1000000) {
      const t = Math.floor(num / 1000);
      const rest = num % 1000;
      let str = t === 1 ? 'mille' : convert(t) + ' mille';
      if (rest > 0) str += ' ' + convert(rest);
      return str;
    }
    const m = Math.floor(num / 1000000);
    const rest = num % 1000000;
    let str = convert(m) + (m === 1 ? ' million' : ' millions');
    if (rest > 0) str += ' ' + convert(rest);
    return str;
  }

  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);

  let result = convert(intPart) + ' dirhams';
  if (decPart > 0) result += ' et ' + convert(decPart) + ' centimes';

  return result.charAt(0).toUpperCase() + result.slice(1);
}

// ═══════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════

export function FactureFormClient({
  locale,
  clients,
  availableDocuments,
  catalogItems,
  parentDocument,
  existingDocument = null,
}: FactureFormClientProps) {
  const router = useRouter();
  const t = (translations[locale] || translations.fr);
  const basePath = `/${locale}/admin/facturation/factures`;
  const isEditMode = !!existingDocument;

  // Form state - initialize from existingDocument if in edit mode
  const [selectedClientId, setSelectedClientId] = useState(
    existingDocument?.clientId || parentDocument?.clientId || ""
  );
  const [selectedSourceId, setSelectedSourceId] = useState(parentDocument?.id || "");
  const [factureDate, setFactureDate] = useState(() => {
    if (existingDocument?.date) {
      return new Date(existingDocument.date).toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    if (existingDocument?.dueDate) {
      return new Date(existingDocument.dueDate).toISOString().split("T")[0];
    }
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  });
  const [paymentTerms, setPaymentTerms] = useState(
    existingDocument?.paymentTerms || "30j"
  );
  const [items, setItems] = useState<LineItem[]>(() => {
    // Priority: existingDocument > parentDocument
    const sourceItems = existingDocument?.items || parentDocument?.items;
    if (sourceItems) {
      return sourceItems.map((item) => ({
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
        // Pre-filled items start as validated
        isValidated: true,
        isEditing: false,
        validationErrors: [],
      }));
    }
    return [];
  });
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    (existingDocument?.discountType as "percentage" | "fixed") || "percentage"
  );
  const [discountValue, setDiscountValue] = useState(
    existingDocument?.discountValue || 0
  );
  const [internalNotes, setInternalNotes] = useState(
    existingDocument?.internalNotes || ""
  );
  const [publicNotes, setPublicNotes] = useState(
    existingDocument?.publicNotes || ""
  );
  const [footerText, setFooterText] = useState(
    existingDocument?.footerText || "Merci pour votre confiance."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Quick client creation modal
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [quickClientData, setQuickClientData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    ice: "",
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Get selected client
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Update payment terms when selecting client
  useEffect(() => {
    if (selectedClient?.paymentTerms) {
      setPaymentTerms(selectedClient.paymentTerms);
      // Update due date based on payment terms
      const days = parseInt(selectedClient.paymentTerms) || 30;
      const date = new Date();
      date.setDate(date.getDate() + days);
      setDueDate(date.toISOString().split("T")[0]);
    }
  }, [selectedClient]);

  // Load items from source document
  const handleSourceChange = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    if (sourceId) {
      const doc = availableDocuments.find((d) => d.id === sourceId);
      if (doc) {
        setSelectedClientId(doc.clientId);
        setItems(
          doc.items.map((item) => ({
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
            isValidated: true,
            isEditing: false,
            validationErrors: [],
          }))
        );
      }
    }
  };

  // Add new line item
  const addItem = (focusFirst: boolean = false) => {
    const newId = crypto.randomUUID();
    setItems([
      ...items,
      {
        id: newId,
        reference: "",
        designation: "",
        description: "",
        quantity: 1,
        unit: "pcs",
        unitPriceHT: 0,
        discountPercent: 0,
        tvaRate: 20,
        isValidated: false,
        isEditing: true,
        validationErrors: [],
      },
    ]);

    // Focus first input of new row after render
    if (focusFirst) {
      setTimeout(() => {
        const newRow = document.querySelector(`[data-row-id="${newId}"] input[type="text"]`);
        if (newRow instanceof HTMLInputElement) {
          newRow.focus();
        }
      }, 100);
    }
  };

  // Validate line item
  const validateLine = (itemId: string) => {
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = items[itemIndex];
    const errors: string[] = [];

    if (!item.designation.trim()) errors.push("designation");
    if (item.quantity <= 0) errors.push("quantity");
    if (item.unitPriceHT < 0) errors.push("unitPriceHT");

    if (errors.length > 0) {
      // Show errors
      const updatedItems = [...items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        validationErrors: errors,
        isValidated: false,
      };
      setItems(updatedItems);
      return false;
    }

    // Valid — lock the row
    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      isValidated: true,
      isEditing: false,
      validationErrors: [],
    };
    setItems(updatedItems);

    // Auto-add new row if this was the last one
    if (itemIndex === items.length - 1) {
      setTimeout(() => {
        addItem(true);
      }, 100);
    }

    return true;
  };

  // Unlock line item for editing
  const unlockLine = (itemId: string) => {
    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      isValidated: false,
      isEditing: true,
      validationErrors: [],
    };
    setItems(updatedItems);

    // Focus designation input
    setTimeout(() => {
      const row = document.querySelector(`[data-row-id="${itemId}"]`);
      const input = row?.querySelector('input[type="text"]');
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 50);
  };

  // Handle Enter key on ANY field in a row
  const handleItemKeyDown = (e: React.KeyboardEvent, itemId: string, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateLine(itemId);
    }

    // Tab on last field also validates
    if (e.key === "Tab" && !e.shiftKey && field === "tvaRate") {
      e.preventDefault();
      if (validateLine(itemId)) {
        // Focus will go to new row's designation
      }
    }

    // Escape to remove empty row
    if (e.key === "Escape") {
      const item = items.find((i) => i.id === itemId);
      if (item && !item.designation.trim() && item.unitPriceHT === 0) {
        removeItem(itemId);
      }
    }
  };

  // Remove line item
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Update line item
  const updateItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              // Clear validation errors when editing
              validationErrors: item.validationErrors.filter((e) => e !== field),
            }
          : item
      )
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
  const globalDiscountAmount =
    discountType === "percentage" ? subtotal * (discountValue / 100) : discountValue;
  const netHT = subtotal - globalDiscountAmount;

  // Group TVA by rate
  const tvaByRate = items.reduce(
    (acc, item) => {
      const lineNet = calculateLineTotal(item);
      const proportion = subtotal > 0 ? lineNet / subtotal : 0;
      const adjustedBase = netHT * proportion;
      const tvaAmount = adjustedBase * (item.tvaRate / 100);

      if (!acc[item.tvaRate]) {
        acc[item.tvaRate] = { base: 0, amount: 0 };
      }
      acc[item.tvaRate].base += adjustedBase;
      acc[item.tvaRate].amount += tvaAmount;
      return acc;
    },
    {} as Record<number, { base: number; amount: number }>
  );

  const totalTVA = Object.values(tvaByRate).reduce((sum, { amount }) => sum + amount, 0);
  const totalTTC = netHT + totalTVA;

  // Format currency
  const { format: formatCurrency } = useCurrency();

  // Quick create client
  const handleQuickCreateClient = async () => {
    if (!quickClientData.fullName.trim()) {
      alert("Le nom complet est requis");
      return;
    }

    setIsCreatingClient(true);
    try {
      const response = await fetch("/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: quickClientData.fullName,
          email: quickClientData.email || null,
          phone: quickClientData.phone || "+212",
          company: quickClientData.company || null,
          ice: quickClientData.ice || null,
          type: "PARTICULIER",
          status: "ACTIF",
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add new client to the clients array
        clients.push(data.data);
        // Select the newly created client
        setSelectedClientId(data.data.id);
        // Close modal and reset form
        setShowQuickClientModal(false);
        setQuickClientData({ fullName: "", email: "", phone: "", company: "", ice: "" });
      } else {
        alert(data.error || "Erreur lors de la création du client");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Erreur de connexion au serveur");
    } finally {
      setIsCreatingClient(false);
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!selectedClientId) {
      newErrors.push(t.selectClientFirst);
    }
    if (items.length === 0) {
      newErrors.push(t.addItemFirst);
    }
    // Check if any items have empty designations
    const hasEmptyDesignations = items.some(item => !item.designation || item.designation.trim() === '');
    if (hasEmptyDesignations) {
      newErrors.push("Toutes les lignes doivent avoir une désignation");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Submit form
  const handleSubmit = async (sendEmail: boolean = false) => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      const url = isEditMode
        ? `/api/crm/documents/${existingDocument!.id}`
        : "/api/crm/documents";
      const method = isEditMode ? "PUT" : "POST";

      const payload: Record<string, unknown> = {
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
        discountType: discountValue > 0 ? discountType : undefined,
        discountValue: discountValue > 0 ? discountValue : undefined,
        internalNotes,
        publicNotes,
        footerText,
      };

      // Only include these fields for creation (POST)
      if (!isEditMode) {
        payload.type = "FACTURE";
        payload.clientId = selectedClientId;
        payload.parentId = selectedSourceId || undefined;
        payload.date = factureDate;
        payload.dueDate = dueDate;
        payload.paymentTerms = paymentTerms;
        payload.sendEmail = sendEmail;
      } else {
        // For edit (PUT), include dates and payment terms
        payload.dueDate = dueDate;
        payload.paymentTerms = paymentTerms;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const docId = isEditMode ? existingDocument!.id : data.data.id;
        router.push(`${basePath}/${docId}`);
      } else {
        const action = isEditMode ? "modification" : "création";
        setErrors([data.error || `Erreur lors de la ${action} de la facture`]);
      }
    } catch (error) {
      console.error("Error submitting facture:", error);
      setErrors(["Erreur de connexion au serveur"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentTermsOptions = [
    { value: "comptant", label: t.comptant },
    { value: "15j", label: t.days15 },
    { value: "30j", label: t.days30 },
    { value: "45j", label: t.days45 },
    { value: "60j", label: t.days60 },
    { value: "90j", label: t.days90 },
    { value: "acompte50", label: t.acompte50 },
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
            <Receipt className="h-7 w-7 text-amber-600" />
            {isEditMode ? t.titleEdit : t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditMode ? t.subtitleEdit : t.subtitle}
          </p>
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
          {/* Client Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-600" />
              {t.clientInfo}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.selectClient} *
                </label>
                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        setShowQuickClientModal(true);
                      } else {
                        setSelectedClientId(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">{t.selectClient}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.clientNumber} - {client.fullName}
                      </option>
                    ))}
                    <option value="__new__" className="font-medium text-amber-600">+ Nouveau client</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.sourceDocument}
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                >
                  <option value="">{t.noSource}</option>
                  {availableDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.number} - {doc.clientName} ({formatCurrency(doc.totalTTC)})
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.factureDate} *
                </label>
                <input
                  type="date"
                  value={factureDate}
                  onChange={(e) => setFactureDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.dueDate} *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.paymentTerms}
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-800"
                >
                  {paymentTermsOptions.map((option) => (
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
                onClick={() => addItem(false)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                {t.addItem}
              </button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm min-w-[900px]">
                <colgroup>
                  <col className="w-10" />          {/* # */}
                  <col />                           {/* Désignation — flexible, takes remaining space */}
                  <col className="w-[70px]" />      {/* Qté */}
                  <col className="w-20" />          {/* Unité */}
                  <col className="w-[100px]" />     {/* P.U. HT */}
                  <col className="w-[70px]" />      {/* Remise % */}
                  <col className="w-20" />          {/* TVA % */}
                  <col className="w-[110px]" />     {/* Total HT */}
                  <col className="w-[70px]" />      {/* Actions */}
                </colgroup>
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-2 py-2 text-center font-medium text-gray-500">#</th>
                    <th className="px-2 py-2 text-left font-medium text-gray-500">{t.designation}</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500">{t.quantity}</th>
                    <th className="px-2 py-2 text-center font-medium text-gray-500">{t.unit}</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500">{t.unitPrice}</th>
                    <th className="px-2 py-2 text-center font-medium text-gray-500">{t.discount}</th>
                    <th className="px-2 py-2 text-center font-medium text-gray-500">{t.tva}</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-500">{t.totalHT}</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      data-row-id={item.id}
                      onClick={() => {
                        if (item.isValidated) unlockLine(item.id);
                      }}
                      className={cn(
                        "border-b transition-all duration-200 group relative",
                        item.isValidated
                          ? "bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer"
                          : item.isEditing
                            ? "bg-amber-50/30 dark:bg-amber-900/10"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      {/* LEFT BORDER INDICATOR */}
                      <td className="relative w-0 p-0">
                        <div
                          className={cn(
                            "absolute left-0 top-0 bottom-0 w-1 transition-colors duration-200",
                            item.isValidated
                              ? "bg-emerald-500"
                              : item.isEditing
                                ? "bg-amber-400"
                                : "bg-transparent"
                          )}
                        />
                      </td>

                      {/* ROW NUMBER + STATUS */}
                      <td className="px-2 py-2 text-center">
                        {item.isValidated ? (
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                        )}
                      </td>

                      {/* DESIGNATION */}
                      <td className="px-2 py-2">
                        {item.isValidated ? (
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {item.designation}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* Catalog selector - compact */}
                            <select
                              value={item.catalogItemId || ""}
                              onChange={(e) => selectCatalogItem(item.id, e.target.value)}
                              onKeyDown={(e) => handleItemKeyDown(e, item.id, "catalog")}
                              disabled={item.isValidated}
                              className="w-full max-w-[200px] px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-500"
                            >
                              <option value="">-- Catalogue --</option>
                              {catalogItems.map((ci) => (
                                <option key={ci.id} value={ci.id}>
                                  {ci.sku} - {ci.name}
                                </option>
                              ))}
                            </select>
                            {/* Main designation input - full width */}
                            <input
                              type="text"
                              value={item.designation}
                              onChange={(e) => updateItem(item.id, "designation", e.target.value)}
                              onKeyDown={(e) => handleItemKeyDown(e, item.id, "designation")}
                              disabled={item.isValidated}
                              placeholder="Saisir la désignation du produit ou service..."
                              className={cn(
                                "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 bg-white dark:bg-gray-800 transition-all",
                                item.validationErrors.includes("designation")
                                  ? "border-red-400 bg-red-50 dark:bg-red-900/20 animate-shake"
                                  : "border-gray-300 dark:border-gray-600"
                              )}
                            />
                            {/* Optional description - subtle */}
                            <input
                              type="text"
                              value={item.description || ""}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              onKeyDown={(e) => handleItemKeyDown(e, item.id, "description")}
                              disabled={item.isValidated}
                              placeholder="Description détaillée (optionnel)"
                              className="w-full px-2 py-1.5 text-xs text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded focus:border-amber-300 focus:ring-1 focus:ring-amber-200 bg-transparent dark:bg-gray-900/20 transition-colors"
                            />
                          </div>
                        )}
                      </td>

                      {/* QUANTITY */}
                      <td className="px-1 py-2">
                        {item.isValidated ? (
                          <p className="text-sm text-right font-medium text-gray-700 dark:text-gray-300">
                            {item.quantity}
                          </p>
                        ) : (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            onKeyDown={(e) => handleItemKeyDown(e, item.id, "quantity")}
                            disabled={item.isValidated}
                            min="0"
                            step="0.01"
                            className={cn(
                              "w-full px-2 py-2 text-sm text-center border rounded-lg focus:ring-1 focus:ring-amber-200 focus:border-amber-400 bg-white dark:bg-gray-800",
                              item.validationErrors.includes("quantity")
                                ? "border-red-400 bg-red-50 dark:bg-red-900/20 animate-shake"
                                : "border-gray-300 dark:border-gray-600"
                            )}
                          />
                        )}
                      </td>

                      {/* UNIT */}
                      <td className="px-1 py-2">
                        {item.isValidated ? (
                          <p className="text-sm text-center text-gray-600 dark:text-gray-400">{item.unit}</p>
                        ) : (
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                            onKeyDown={(e) => handleItemKeyDown(e, item.id, "unit")}
                            disabled={item.isValidated}
                            className="w-full px-1 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-amber-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-center"
                          >
                            {units.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* PRIX UNITAIRE HT */}
                      <td className="px-1 py-2">
                        {item.isValidated ? (
                          <p className="text-sm text-right font-medium text-gray-700 dark:text-gray-300">
                            {formatCurrency(item.unitPriceHT)}
                          </p>
                        ) : (
                          <input
                            type="number"
                            value={item.unitPriceHT}
                            onChange={(e) => updateItem(item.id, "unitPriceHT", parseFloat(e.target.value) || 0)}
                            onKeyDown={(e) => handleItemKeyDown(e, item.id, "unitPriceHT")}
                            disabled={item.isValidated}
                            min="0"
                            step="0.01"
                            className={cn(
                              "w-full px-2 py-2 text-sm text-right border rounded-lg focus:ring-1 focus:ring-amber-200 focus:border-amber-400 bg-white dark:bg-gray-800",
                              item.validationErrors.includes("unitPriceHT")
                                ? "border-red-400 bg-red-50 dark:bg-red-900/20 animate-shake"
                                : "border-gray-300 dark:border-gray-600"
                            )}
                          />
                        )}
                      </td>

                      {/* REMISE % */}
                      <td className="px-1 py-2">
                        {item.isValidated ? (
                          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                            {item.discountPercent > 0 ? `${item.discountPercent}%` : "-"}
                          </p>
                        ) : (
                          <input
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) => updateItem(item.id, "discountPercent", parseFloat(e.target.value) || 0)}
                            onKeyDown={(e) => handleItemKeyDown(e, item.id, "discountPercent")}
                            disabled={item.isValidated}
                            min="0"
                            max="100"
                            className="w-full px-2 py-2 text-sm text-center border rounded-lg focus:ring-1 focus:ring-amber-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          />
                        )}
                      </td>

                      {/* TVA % */}
                      <td className="px-1 py-2">
                        {item.isValidated ? (
                          <p className="text-sm text-center text-gray-600 dark:text-gray-400">{item.tvaRate}%</p>
                        ) : (
                          <select
                            value={item.tvaRate}
                            onChange={(e) => updateItem(item.id, "tvaRate", parseFloat(e.target.value))}
                            onKeyDown={(e) => handleItemKeyDown(e, item.id, "tvaRate")}
                            disabled={item.isValidated}
                            className="w-full px-1 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-amber-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-center"
                          >
                            <option value={0}>0%</option>
                            <option value={7}>7%</option>
                            <option value={10}>10%</option>
                            <option value={14}>14%</option>
                            <option value={20}>20%</option>
                          </select>
                        )}
                      </td>

                      {/* TOTAL HT */}
                      <td className="px-1 py-2">
                        <div
                          className={cn(
                            "px-2 py-2 rounded-lg text-sm text-right font-semibold whitespace-nowrap",
                            item.isValidated
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {formatCurrency(calculateLineTotal(item))}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-1 py-2">
                        <div className="flex items-center gap-0.5 justify-center">
                          {item.isValidated ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  unlockLine(item.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItem(item.id);
                                }}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => validateLine(item.id)}
                                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm transition-all hover:scale-105"
                                title="Valider (Entrée)"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
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

            {/* Global Discount */}
            {items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.globalDiscount}
                </h3>
                <div className="flex items-center gap-4">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                  >
                    <option value="percentage">{t.percentage}</option>
                    <option value="fixed">{t.fixed}</option>
                  </select>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                    min="0"
                    step="0.01"
                  />
                  {discountType === "percentage" && <span className="text-gray-500">%</span>}
                  {discountType === "fixed" && <span className="text-gray-500">DH</span>}
                </div>
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.footerText}
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
              />
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

              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                  <span>{t.discountAmount}</span>
                  <span>-{formatCurrency(globalDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t.netHT}</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(netHT)}</span>
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
                  <span className="text-amber-600">{formatCurrency(totalTTC)}</span>
                </div>
              </div>
            </div>

            {/* Amount in French words */}
            {totalTTC > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Montant en lettres :</span>{' '}
                  <span className="italic">{numberToFrenchWords(totalTTC)}</span>
                </p>
              </div>
            )}

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
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                {t.saveAndSend}
              </button>
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

      {/* Quick Client Creation Modal */}
      {showQuickClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-600" />
                Nouveau client rapide
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickClientModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Nom complet *"
                  value={quickClientData.fullName}
                  onChange={(e) => setQuickClientData({ ...quickClientData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={quickClientData.email}
                  onChange={(e) => setQuickClientData({ ...quickClientData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={quickClientData.phone}
                  onChange={(e) => setQuickClientData({ ...quickClientData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Entreprise"
                  value={quickClientData.company}
                  onChange={(e) => setQuickClientData({ ...quickClientData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="ICE (identifiant fiscal)"
                  value={quickClientData.ice}
                  onChange={(e) => setQuickClientData({ ...quickClientData, ice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleQuickCreateClient}
                disabled={isCreatingClient || !quickClientData.fullName.trim()}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingClient ? "Création..." : "Créer & sélectionner"}
              </button>
              <button
                type="button"
                onClick={() => setShowQuickClientModal(false)}
                disabled={isCreatingClient}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
