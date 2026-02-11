export const dynamic = 'force-dynamic';


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
  Phone,
} from "lucide-react";
import { EcommerceOrderActions } from "./EcommerceOrderActions";

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
    billingAddress: "Adresse de facturation",
    orderItems: "Articles commandes",
    product: "Produit",
    price: "Prix",
    quantity: "Qte",
    subtotal: "Sous-total",
    orderSummary: "Resume de la commande",
    itemsSubtotal: "Sous-total articles",
    shipping: "Livraison",
    discount: "Remise",
    tax: "TVA",
    total: "Total",
    paymentInfo: "Informations de paiement",
    method: "Methode",
    status: "Statut",
    transactionId: "ID Transaction",
    trackingInfo: "Suivi de livraison",
    trackingNumber: "Numero de suivi",
    carrier: "Transporteur",
    updateStatus: "Mettre a jour le statut",
    sendEmail: "Envoyer un email",
    printInvoice: "Imprimer la facture",
    refund: "Rembourser",
    noTracking: "Aucun suivi disponible",
    freeShipping: "Gratuit",
    customerNotes: "Notes client",
    adminNotes: "Notes admin",
  },
  en: {
    backToOrders: "Back to orders",
    orderDetails: "Order Details",
    placedOn: "Placed on",
    customerInfo: "Customer Information",
    shippingAddress: "Shipping Address",
    billingAddress: "Billing Address",
    orderItems: "Order Items",
    product: "Product",
    price: "Price",
    quantity: "Qty",
    subtotal: "Subtotal",
    orderSummary: "Order Summary",
    itemsSubtotal: "Items Subtotal",
    shipping: "Shipping",
    discount: "Discount",
    tax: "Tax",
    total: "Total",
    paymentInfo: "Payment Information",
    method: "Method",
    status: "Status",
    transactionId: "Transaction ID",
    trackingInfo: "Tracking Information",
    trackingNumber: "Tracking Number",
    carrier: "Carrier",
    updateStatus: "Update Status",
    sendEmail: "Send Email",
    printInvoice: "Print Invoice",
    refund: "Refund",
    noTracking: "No tracking available",
    freeShipping: "Free",
    customerNotes: "Customer Notes",
    adminNotes: "Admin Notes",
  },
  es: {
    backToOrders: "Volver a pedidos",
    orderDetails: "Detalles del pedido",
    placedOn: "Realizado el",
    customerInfo: "Informacion del cliente",
    shippingAddress: "Direccion de envio",
    billingAddress: "Direccion de facturacion",
    orderItems: "Articulos del pedido",
    product: "Producto",
    price: "Precio",
    quantity: "Cant",
    subtotal: "Subtotal",
    orderSummary: "Resumen del pedido",
    itemsSubtotal: "Subtotal articulos",
    shipping: "Envio",
    discount: "Descuento",
    tax: "IVA",
    total: "Total",
    paymentInfo: "Informacion de pago",
    method: "Metodo",
    status: "Estado",
    transactionId: "ID de transaccion",
    trackingInfo: "Informacion de seguimiento",
    trackingNumber: "Numero de seguimiento",
    carrier: "Transportista",
    updateStatus: "Actualizar estado",
    sendEmail: "Enviar email",
    printInvoice: "Imprimir factura",
    refund: "Reembolsar",
    noTracking: "Sin seguimiento disponible",
    freeShipping: "Gratis",
    customerNotes: "Notas del cliente",
    adminNotes: "Notas admin",
  },
  ar: {
    backToOrders: "العودة للطلبات",
    orderDetails: "تفاصيل الطلب",
    placedOn: "تم الطلب في",
    customerInfo: "معلومات العميل",
    shippingAddress: "عنوان الشحن",
    billingAddress: "عنوان الفوترة",
    orderItems: "عناصر الطلب",
    product: "المنتج",
    price: "السعر",
    quantity: "الكمية",
    subtotal: "المجموع الفرعي",
    orderSummary: "ملخص الطلب",
    itemsSubtotal: "مجموع المنتجات",
    shipping: "الشحن",
    discount: "الخصم",
    tax: "الضريبة",
    total: "الإجمالي",
    paymentInfo: "معلومات الدفع",
    method: "الطريقة",
    status: "الحالة",
    transactionId: "رقم المعاملة",
    trackingInfo: "معلومات التتبع",
    trackingNumber: "رقم التتبع",
    carrier: "شركة الشحن",
    updateStatus: "تحديث الحالة",
    sendEmail: "إرسال بريد",
    printInvoice: "طباعة الفاتورة",
    refund: "استرداد",
    noTracking: "لا يوجد تتبع",
    freeShipping: "مجاني",
    customerNotes: "ملاحظات العميل",
    adminNotes: "ملاحظات المسؤول",
  },
};

// ═══════════════════════════════════════════════════════════
// Get Order
// ═══════════════════════════════════════════════════════════

async function getOrder(id: string) {
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

  return order;
}

// ═══════════════════════════════════════════════════════════
// Order Detail Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EcommerceOrderDetailPage({ params }: PageProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin/ecommerce/commandes`}
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
          {order.paymentMethod === "CARD" && order.paymentStatus === "PAID" && (
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
                    let imageUrl: string | null = item.image;
                    if (!imageUrl && item.product?.images) {
                      const images = item.product.images as string[];
                      if (images.length > 0) {
                        imageUrl = images[0] ?? null;
                      }
                    }
                    const productName = item.product?.translations?.find(t => t.locale === locale)?.name
                      ?? item.product?.translations?.[0]?.name
                      ?? item.name;

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
                              <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                              {item.product && (
                                <Link
                                  href={`/${locale}/admin/ecommerce/produits/${item.product.id}`}
                                  className="text-sm text-amber-600 hover:underline"
                                >
                                  <ExternalLink className="inline h-3 w-3" /> Voir produit
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                          {formatCurrency(Number(item.unitPrice))}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(Number(item.total))}
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
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t.discount}</span>
                    <span>-{formatCurrency(Number(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t.shipping}</span>
                  <span>
                    {Number(order.shippingAmount) === 0
                      ? t.freeShipping
                      : formatCurrency(Number(order.shippingAmount))}
                  </span>
                </div>
                {Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{t.tax}</span>
                    <span>{formatCurrency(Number(order.taxAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                  <span>{t.total}</span>
                  <span>{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Admin Notes */}
          {(order.customerNote || order.adminNote) && (
            <div className="grid gap-4 md:grid-cols-2">
              {order.customerNote && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {t.customerNotes}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerNote}</p>
                </div>
              )}
              {order.adminNote && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {t.adminNotes}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.adminNote}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <EcommerceOrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
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
            <div className="p-6 space-y-3">
              <p className="font-medium text-gray-900 dark:text-white">
                {order.customerName}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                {order.customerEmail}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                {order.customerPhone}
              </p>
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
              {order.shippingAddress ? (
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}
                    {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune adresse</p>
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
                <PaymentMethodBadge
                  method={order.paymentMethod === "CARD" ? "STRIPE" : "COD"}
                  locale={locale}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.status}</span>
                <PaymentStatusBadge status={order.paymentStatus as "PENDING"} locale={locale} />
              </div>
              {order.stripePaymentId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t.transactionId}</span>
                  <span className="font-mono text-xs text-gray-500">
                    {order.stripePaymentId.slice(0, 20)}...
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
                  {order.shippingMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t.carrier}
                      </span>
                      <span className="text-sm">{order.shippingMethod}</span>
                    </div>
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
    title: order ? `Commande ${order.orderNumber}` : "Commande non trouvee",
  };
}
