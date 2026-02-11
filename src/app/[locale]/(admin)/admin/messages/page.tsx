"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es, ar } from "date-fns/locale";
import {
  Mail,
  MailOpen,
  Search,
  RefreshCw,
  Trash2,
  Circle,
  Inbox,
  Send,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════

const translations = {
  fr: {
    title: "Boite de reception",
    subtitle: "Messages de contact",
    searchPlaceholder: "Rechercher par nom, email, sujet...",
    refresh: "Actualiser",
    all: "Tous",
    unread: "Non lus",
    read: "Lus",
    sent: "Envoyés",
    starred: "Favoris",
    noMessages: "Aucun message",
    markAsRead: "Marquer comme lu",
    markAsUnread: "Marquer comme non lu",
    delete: "Supprimer",
    selected: "selectionne(s)",
    from: "De",
    messages: "messages",
    today: "Aujourd'hui",
    yesterday: "Hier",
  },
  en: {
    title: "Inbox",
    subtitle: "Contact messages",
    searchPlaceholder: "Search by name, email, subject...",
    refresh: "Refresh",
    all: "All",
    unread: "Unread",
    read: "Read",
    sent: "Sent",
    starred: "Starred",
    noMessages: "No messages",
    markAsRead: "Mark as read",
    markAsUnread: "Mark as unread",
    delete: "Delete",
    selected: "selected",
    from: "From",
    messages: "messages",
    today: "Today",
    yesterday: "Yesterday",
  },
  es: {
    title: "Bandeja de entrada",
    subtitle: "Mensajes de contacto",
    searchPlaceholder: "Buscar por nombre, email, asunto...",
    refresh: "Actualizar",
    all: "Todos",
    unread: "No leidos",
    read: "Leidos",
    sent: "Enviados",
    starred: "Destacados",
    noMessages: "Sin mensajes",
    markAsRead: "Marcar como leido",
    markAsUnread: "Marcar como no leido",
    delete: "Eliminar",
    selected: "seleccionado(s)",
    from: "De",
    messages: "mensajes",
    today: "Hoy",
    yesterday: "Ayer",
  },
  ar: {
    title: "البريد الوارد",
    subtitle: "رسائل الاتصال",
    searchPlaceholder: "البحث بالاسم، البريد، الموضوع...",
    refresh: "تحديث",
    all: "الكل",
    unread: "غير مقروء",
    read: "مقروء",
    sent: "المرسلة",
    starred: "المفضلة",
    noMessages: "لا توجد رسائل",
    markAsRead: "تحديد كمقروء",
    markAsUnread: "تحديد كغير مقروء",
    delete: "حذف",
    selected: "محدد",
    from: "من",
    messages: "رسائل",
    today: "اليوم",
    yesterday: "أمس",
  },
};

const dateLocales = { fr, en: enUS, es, ar };

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  content: string;
  read: boolean;
  starred: boolean;
  type: "RECEIVED" | "SENT";
  createdAt: string;
}

interface MessagesResponse {
  messages: Message[];
  total: number;
}

type FilterType = "all" | "unread" | "read" | "sent" | "starred";

// ═══════════════════════════════════════════════════════════
// Messages Inbox Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: { locale: string };
}

export default function MessagesInboxPage({ params }: PageProps) {
  const { locale } = params;
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const dateLocale = dateLocales[locale as keyof typeof dateLocales] ?? fr;
  const isRTL = locale === "ar";

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "unread") params.set("read", "false");
      if (filter === "read") params.set("read", "true");
      if (filter === "sent") params.set("type", "SENT");
      if (filter === "starred") params.set("starred", "true");
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/messages?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, data: { data: [...], pagination: {...}, unreadCount: ... } }
        if (result.success && result.data) {
          setMessages(result.data.data ?? []);
          setTotal(result.data.pagination?.total ?? 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.id)));
    }
  };

  // Bulk mark as read/unread
  const bulkMarkAs = async (read: boolean) => {
    if (selectedIds.size === 0) return;

    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (selectedIds.has(m.id) ? { ...m, read } : m))
    );

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read }),
          })
        )
      );
      setSelectedIds(new Set());
    } catch {
      void fetchMessages();
    }
  };

  // Bulk delete
  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;

    // Optimistic update
    setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/messages/${id}`, { method: "DELETE" })
        )
      );
      setSelectedIds(new Set());
      setTotal((prev) => prev - selectedIds.size);
    } catch {
      void fetchMessages();
    }
  };

  // Filter counts
  const unreadCount = messages.filter((m) => !m.read && m.type === "RECEIVED").length;
  const sentCount = messages.filter((m) => m.type === "SENT").length;
  const starredCount = messages.filter((m) => m.starred).length;

  const filters: { key: FilterType; label: string; count?: number; icon: typeof Mail }[] = [
    { key: "all", label: t.all, count: total, icon: Inbox },
    { key: "unread", label: t.unread, count: unreadCount, icon: Mail },
    { key: "starred", label: t.starred, count: starredCount, icon: Star },
    { key: "sent", label: t.sent, count: sentCount, icon: Send },
    { key: "read", label: t.read, icon: MailOpen },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {total} {t.messages}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void fetchMessages()}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sidebar Filters */}
        <div className="hidden w-48 flex-shrink-0 md:block">
          <nav className="space-y-1">
            {filters.map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  filter === key
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                {count !== undefined && (
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {/* Select All Checkbox */}
              <input
                type="checkbox"
                checked={messages.length > 0 && selectedIds.size === messages.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />

              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {selectedIds.size} {t.selected}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void bulkMarkAs(true)}
                    title={t.markAsRead}
                  >
                    <MailOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void bulkMarkAs(false)}
                    title={t.markAsUnread}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void bulkDelete()}
                    title={t.delete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse px-4 py-4">
                    <div className="flex items-start gap-4">
                      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-64 rounded bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12">
                <Inbox className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">{t.noMessages}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {messages.map((message) => (
                  <Link
                    key={message.id}
                    href={`/${locale}/admin/messages/${message.id}`}
                    className={cn(
                      "flex items-start gap-4 px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50",
                      !message.read && "bg-amber-50/50 dark:bg-amber-900/10"
                    )}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(message.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(message.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />

                    {/* Read indicator */}
                    <div className="mt-1.5">
                      {message.read ? (
                        <Circle className="h-2 w-2 text-gray-300" />
                      ) : (
                        <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate",
                            !message.read
                              ? "font-semibold text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {message.name}
                        </span>
                        <span className="flex-shrink-0 text-xs text-gray-400">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "truncate text-sm",
                          !message.read
                            ? "font-medium text-gray-800 dark:text-gray-200"
                            : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {message.subject ?? "(No subject)"}
                      </p>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-500">
                        {message.content.slice(0, 80)}...
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
