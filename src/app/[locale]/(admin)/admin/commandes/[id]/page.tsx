import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { PaymentStatusBadge, PaymentMethodBadge } from "@/components/admin/PaymentStatusBadge";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  Mail,
  Printer,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { OrderActions } from "./OrderActions";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    backToOrders: "Retour aux commandes",
    orderDetails: "Details de la commande",
    placedOn: "Passee le",
    customerInfo: "Informations client",
    shippingAddress: "Adresse de livraison",
    orderItems: "Articles commandes",
    product: "Produit",
    price: "Prix",
    quantity: "Qte",
    subtotal: "Sous-total",
    orderSummary: "Resume de la commande",
    itemsSubtotal: "Sous-total articles",
    shipping: "Livraison",
    total: "Total",
    paymentInfo: "Informations de paiement",
    method: "Methode",
    status: "Statut",
    transactionId: "ID Transaction",
    trackingInfo: "Suivi de livraison",
    trackingNumber: "Numero de suivi",
    carrier: "Transporteur",
    orderTimeline: "Historique de la commande",
    updateStatus: "Mettre a jour le statut",
    sendEmail: "Envoyer un email",
    printInvoice: "Imprimer la facture",
    refund: "Rembourser",
    noTracking: "Aucun suivi disponible",
    freeShipping: "Gratuit",
  },
  en: {
    backToOrders: "Back to orders",
    orderDetails: "Order Details",
    placedOn: "Placed on",
    customerInfo: "Customer Information",
    shippingAddress: "Shipping Address",
    orderItems: "Order Items",
    product: "Product",
    price: "Price",
    quantity: "Qty",
    subtotal: "Subtotal",
    orderSummary: "Order Summary",
    itemsSubtotal: "Items Subtotal",
    shipping: "Shipping",
    total: "Total",
    paymentInfo: "Payment Information",
    method: "Method",
    status: "Status",
    transactionId: "Transaction ID",
    trackingInfo: "Tracking Information",
    trackingNumber: "Tracking Number",
    carrier: "Carrier",
    orderTimeline: "Order Timeline",
    updateStatus: "Update Status",
    sendEmail: "Send Email",
    printInvoice: "Print Invoice",
    refund: "Refund",
    noTracking: "No tracking available",
    freeShipping: "Free",
  },
  es: {
    backToOrders: "Volver a pedidos",
    orderDetails: "Detalles del pedido",
    placedOn: "Realizado el",
    customerInfo: "Informacion del cliente",
    shippingAddress: "Direccion de envio",
    orderItems: "Articulos del pedido",
    product: "Producto",
    price: "Precio",
    quantity: "Cant",
    subtotal: "Subtotal",
    orderSummary: "Resumen del pedido",
    itemsSubtotal: "Subtotal articulos",
    shipping: "Envio",
    total: "Total",
    paymentInfo: "Informacion de pago",
    method: "Metodo",
    status: "Estado",
    transactionId: "ID de transaccion",
    trackingInfo: "Informacion de seguimiento",
    trackingNumber: "Numero de seguimiento",
    carrier: "Transportista",
    orderTimeline: "Historial del pedido",
    updateStatus: "Actualizar estado",
    sendEmail: "Enviar email",
    printInvoice: "Imprimir factura",
    refund: "Reembolsar",
    noTracking: "Sin seguimiento disponible",
    freeShipping: "Gratis",
  },
  ar: {
    backToOrders: "العودة للطلبات",
    orderDetails: "تفاصيل الطلب",
    placedOn: "تم الطلب في",
    customerInfo: "معلومات العميل",
    shippingAddress: "عنوان الشحن",
    orderItems: "عناصر الطلب",
    product: "المنتج",
    price: "السعر",
    quantity: "الكمية",
    subtotal: "المجموع الفرعي",
    orderSummary: "ملخص الطلب",
    itemsSubtotal: "مجموع المنتجات",
    shipping: "الشحن",
    total: "الإجمالي",
    paymentInfo: "معلومات الدفع",
    method: "الطريقة",
    status: "الحالة",
    transactionId: "رقم المعاملة",
    trackingInfo: "معلومات التتبع",
    trackingNumber: "رقم التتبع",
    carrier: "شركة الشحن",
    orderTimeline: "سجل الطلب",
    updateStatus: "تحديث الحالة",
    sendEmail: "إرسال بريد",
    printInvoice: "طباعة الفاتورة",
    refund: "استرداد",
    noTracking: "لا يوجد تتبع",
    freeShipping: "مجاني",
  },
};

// ═══════════════════════════════════════════════════════════
// Get Order
// ═══════════════════════════════════════════════════════════

interface OrderItem {
  id: string;
  productName: string;
  price: number | { toNumber: () => number };
  quantity: number;
  product?: {
    id: string;
    images: unknown; // JSON field
    translations: { locale: string; name: string }[];
  } | null;
}

interface StatusHistory {
  id: string;
  status: string;
  reason?: string | null;
  changedBy?: string | null;
  createdAt: Date;
}

interface Order {
  id: string;
  orderNumber: string;
  customerEmail?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number | { toNumber: () => number };
  shippingCost: number | { toNumber: () => number };
  total: number | { toNumber: () => number };
  shippingAddress: unknown;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  stripePaymentIntentId?: string | null;
  createdAt: Date;
  customer?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  items: OrderItem[];
  statusHistory: StatusHistory[];
}

async function getOrder(id: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      shippingAddress: true,
      billingAddress: true,
      items: {
        include: {
          product: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  // Transform to match the Order interface
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    shippingCost: order.shippingAmount,
    total: order.total,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber,
    trackingUrl: null, // Not in schema, could be part of shippingAddress JSON
    stripePaymentIntentId: order.stripePaymentId,
    createdAt: order.createdAt,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    items: order.items.map(item => ({
      id: item.id,
      productName: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      product: item.product ? {
        id: item.product.id,
        images: item.product.images,
        translations: item.product.translations,
      } : null,
    })),
    statusHistory: [], // No status history in schema, use empty array
  };
}

// ═══════════════════════════════════════════════════════════
// Order Detail Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const t = translations[locale as keyof typeof translations] ?? translations.fr;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const shippingAddress = order.shippingAddress as {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    phone?: string;
  } | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin/commandes`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToOrders}
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status as "PENDING"} locale={locale} size="lg" />
            <PaymentStatusBadge status={order.paymentStatus as "PENDING"} locale={locale} size="lg" />
          </div>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {t.placedOn} {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Mail className="me-2 h-4 w-4" />
            {t.sendEmail}
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="me-2 h-4 w-4" />
            {t.printInvoice}
          </Button>
          {order.paymentMethod === "STRIPE" && order.paymentStatus === "PAID" && (
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
              <RefreshCw className="me-2 h-4 w-4" />
              {t.refund}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Package className="h-5 w-5 text-amber-600" />
                {t.orderItems}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      {t.product}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      {t.price}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                      {t.quantity}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      {t.subtotal}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item) => {
                    // Parse images from JSON - use productImage snapshot first, then try product images
                    let imageUrl: string | null = null;
                    if (item.product?.images) {
                      const images = item.product.images as { url: string }[] | null;
                      if (Array.isArray(images) && images.length > 0 && images[0]?.url) {
                        imageUrl = images[0].url;
                      }
                    }
                    // Get product name from translations
                    const productName = item.product?.translations?.find(t => t.locale === locale)?.name
                      ?? item.product?.translations?.[0]?.name
                      ?? item.productName;

                    return (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {productName}
                            </p>
                            {item.product && (
                              <Link
                                href={`/${locale}/admin/produits/${item.product.id}`}
                                className="text-sm text-amber-600 hover:underline"
                              >
                                <ExternalLink className="inline h-3 w-3" /> View product
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(Number(item.price))}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t.itemsSubtotal}</span>
                  <span>{formatCurrency(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t.shipping}</span>
                  <span>
                    {Number(order.shippingCost) === 0
                      ? t.freeShipping
                      : formatCurrency(Number(order.shippingCost))}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                  <span>{t.total}</span>
                  <span>{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Clock className="h-5 w-5 text-amber-600" />
                {t.orderTimeline}
              </h2>
            </div>
            <div className="p-6">
              <div className="relative">
                {order.statusHistory.map((history, index) => (
                  <div key={history.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Line */}
                    {index < order.statusHistory.length - 1 && (
                      <div className="absolute left-[11px] top-6 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}
                    {/* Dot */}
                    <div className="relative z-10 mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 border-amber-500 bg-white dark:bg-gray-800" />
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={history.status as "PENDING"} locale={locale} size="sm" />
                        {history.changedBy && (
                          <span className="text-xs text-gray-500">by {history.changedBy}</span>
                        )}
                      </div>
                      {history.reason && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {history.reason}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">{formatDate(history.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            locale={locale}
          />

          {/* Customer Info */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-amber-600" />
                {t.customerInfo}
              </h2>
            </div>
            <div className="p-6">
              <p className="font-medium text-gray-900 dark:text-white">
                {order.customer?.name ?? shippingAddress?.name ?? "Customer"}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {order.customer?.email ?? order.customerEmail}
              </p>
              {(order.customer?.phone ?? shippingAddress?.phone) && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {order.customer?.phone ?? shippingAddress?.phone}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <MapPin className="h-5 w-5 text-amber-600" />
                {t.shippingAddress}
              </h2>
            </div>
            <div className="p-6">
              {shippingAddress ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {shippingAddress.name}
                  </p>
                  <p>{shippingAddress.address}</p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.postalCode}
                  </p>
                  {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No address provided</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <CreditCard className="h-5 w-5 text-amber-600" />
                {t.paymentInfo}
              </h2>
            </div>
            <div className="space-y-3 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.method}</span>
                <PaymentMethodBadge method={order.paymentMethod as "STRIPE"} locale={locale} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.status}</span>
                <PaymentStatusBadge status={order.paymentStatus as "PENDING"} locale={locale} />
              </div>
              {order.stripePaymentIntentId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t.transactionId}</span>
                  <span className="font-mono text-xs text-gray-500">
                    {order.stripePaymentIntentId.slice(0, 20)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Info */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Truck className="h-5 w-5 text-amber-600" />
                {t.trackingInfo}
              </h2>
            </div>
            <div className="p-6">
              {order.trackingNumber ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.trackingNumber}
                    </span>
                    <span className="font-mono text-sm font-medium">{order.trackingNumber}</span>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-amber-600 hover:underline"
                    >
                      Track shipment <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t.noTracking}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true },
  });

  return {
    title: order ? `Order ${order.orderNumber}` : "Order Not Found",
  };
}
