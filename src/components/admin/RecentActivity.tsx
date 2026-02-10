"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es, ar } from "date-fns/locale";
import {
  ShoppingCart,
  FileText,
  MessageSquare,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: Date;
}

interface RecentQuote {
  id: string;
  quoteNumber: string;
  customerName: string;
  service: string;
  status: string;
  createdAt: Date;
}

interface RecentMessage {
  id: string;
  senderName: string;
  subject: string;
  isRead: boolean;
  createdAt: Date;
}

interface RecentActivityProps {
  orders: RecentOrder[];
  quotes: RecentQuote[];
  messages: RecentMessage[];
  locale: string;
}

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    recentOrders: "Commandes recentes",
    recentQuotes: "Devis recents",
    recentMessages: "Messages recents",
    viewAll: "Voir tout",
    noOrders: "Aucune commande",
    noQuotes: "Aucun devis",
    noMessages: "Aucun message",
  },
  en: {
    recentOrders: "Recent Orders",
    recentQuotes: "Recent Quotes",
    recentMessages: "Recent Messages",
    viewAll: "View all",
    noOrders: "No orders",
    noQuotes: "No quotes",
    noMessages: "No messages",
  },
  es: {
    recentOrders: "Pedidos recientes",
    recentQuotes: "Presupuestos recientes",
    recentMessages: "Mensajes recientes",
    viewAll: "Ver todo",
    noOrders: "Sin pedidos",
    noQuotes: "Sin presupuestos",
    noMessages: "Sin mensajes",
  },
  ar: {
    recentOrders: "الطلبات الأخيرة",
    recentQuotes: "عروض الأسعار الأخيرة",
    recentMessages: "الرسائل الأخيرة",
    viewAll: "عرض الكل",
    noOrders: "لا توجد طلبات",
    noQuotes: "لا توجد عروض أسعار",
    noMessages: "لا توجد رسائل",
  },
};

const dateLocales = { fr, en: enUS, es, ar };

// ═══════════════════════════════════════════════════════════
// Status Badge
// ═══════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PROCESSING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    QUOTED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// Activity Card
// ═══════════════════════════════════════════════════════════

interface ActivityCardProps {
  title: string;
  icon: typeof ShoppingCart;
  viewAllHref: string;
  viewAllText: string;
  emptyText: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}

function ActivityCard({
  title,
  icon: Icon,
  viewAllHref,
  viewAllText,
  emptyText,
  children,
  isEmpty,
}: ActivityCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700"
        >
          {viewAllText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {isEmpty ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Clock className="mr-2 h-5 w-5" />
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Recent Activity Component
// ═══════════════════════════════════════════════════════════

export function RecentActivity({ orders, quotes, messages, locale }: RecentActivityProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? fr;

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : `${locale}-MA`, {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Recent Orders */}
      <ActivityCard
        title={t.recentOrders}
        icon={ShoppingCart}
        viewAllHref={`/${locale}/admin/commandes`}
        viewAllText={t.viewAll}
        emptyText={t.noOrders}
        isEmpty={orders.length === 0}
      >
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/${locale}/admin/commandes/${order.id}`}
            className="block px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.orderNumber}
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {order.customerName}
                </p>
                <p className="mt-1 text-xs text-gray-400">{formatTime(order.createdAt)}</p>
              </div>
              <div className="ml-4 text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(order.total)}
                </p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </Link>
        ))}
      </ActivityCard>

      {/* Recent Quotes */}
      <ActivityCard
        title={t.recentQuotes}
        icon={FileText}
        viewAllHref={`/${locale}/admin/devis`}
        viewAllText={t.viewAll}
        emptyText={t.noQuotes}
        isEmpty={quotes.length === 0}
      >
        {quotes.map((quote) => (
          <Link
            key={quote.id}
            href={`/${locale}/admin/devis/${quote.id}`}
            className="block px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {quote.quoteNumber}
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {quote.customerName}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{quote.service}</p>
              </div>
              <div className="ml-4 text-right">
                <StatusBadge status={quote.status} />
                <p className="mt-1 text-xs text-gray-400">{formatTime(quote.createdAt)}</p>
              </div>
            </div>
          </Link>
        ))}
      </ActivityCard>

      {/* Recent Messages */}
      <ActivityCard
        title={t.recentMessages}
        icon={MessageSquare}
        viewAllHref={`/${locale}/admin/messages`}
        viewAllText={t.viewAll}
        emptyText={t.noMessages}
        isEmpty={messages.length === 0}
      >
        {messages.map((message) => (
          <Link
            key={message.id}
            href={`/${locale}/admin/messages/${message.id}`}
            className={cn(
              "block px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50",
              !message.isRead && "bg-amber-50/50 dark:bg-amber-900/10"
            )}
          >
            <div className="flex items-start gap-3">
              {!message.isRead && (
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {message.senderName}
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-500">{message.subject}</p>
                <p className="mt-1 text-xs text-gray-400">{formatTime(message.createdAt)}</p>
              </div>
            </div>
          </Link>
        ))}
      </ActivityCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════

export function RecentActivitySkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="px-6 py-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
