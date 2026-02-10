"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  // Tools & Construction
  Hammer,
  Wrench,
  PaintBucket,
  Ruler,
  Axe,
  HardHat,
  Scissors,
  PenTool,
  Pencil,
  // Home & Furniture
  Home,
  Building2,
  DoorOpen,
  Armchair,
  Bed,
  Bath,
  UtensilsCrossed,
  Wine,
  Tv,
  Lamp,
  Frame,
  // Storage & Packaging
  Box,
  Package,
  Boxes,
  Warehouse,
  Store,
  Archive,
  // Layout & Design
  Layers,
  LayoutGrid,
  Grid3X3,
  Palette,
  // Shapes
  Square,
  Circle,
  Triangle,
  Hexagon,
  // Nature
  Leaf,
  TreeDeciduous,
  Trees,
  Mountain,
  Sun,
  Droplets,
  // Awards & Status
  Star,
  Sparkles,
  Crown,
  Award,
  Medal,
  Trophy,
  Target,
  // Security
  Shield,
  Lock,
  Key,
  // Settings
  Settings,
  Cog,
  // Transport
  Truck,
  Car,
  // Time
  Clock,
  Calendar,
  Timer,
  Hourglass,
  // Communication
  Phone,
  Mail,
  MessageCircle,
  Send,
  Bell,
  // Media
  Camera,
  Image,
  Video,
  // UI
  Check,
  Plus,
  Minus,
  Info,
  HelpCircle,
  AlertCircle,
  // Business
  Briefcase,
  Wallet,
  Receipt,
  Calculator,
  // Files
  File,
  FileText,
  Folder,
  Clipboard,
  // Energy
  Zap,
  Flame,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Icon Registry
// ═══════════════════════════════════════════════════════════

interface IconInfo {
  name: string;
  icon: LucideIcon;
  category: string;
}

const iconRegistry: IconInfo[] = [
  // Tools & Construction
  { name: "hammer", icon: Hammer, category: "tools" },
  { name: "wrench", icon: Wrench, category: "tools" },
  { name: "paint-bucket", icon: PaintBucket, category: "tools" },
  { name: "ruler", icon: Ruler, category: "tools" },
  { name: "axe", icon: Axe, category: "tools" },
  { name: "hard-hat", icon: HardHat, category: "tools" },
  { name: "scissors", icon: Scissors, category: "tools" },
  { name: "pen-tool", icon: PenTool, category: "tools" },
  { name: "pencil", icon: Pencil, category: "tools" },

  // Home & Furniture
  { name: "home", icon: Home, category: "home" },
  { name: "building", icon: Building2, category: "home" },
  { name: "door-open", icon: DoorOpen, category: "home" },
  { name: "armchair", icon: Armchair, category: "home" },
  { name: "bed", icon: Bed, category: "home" },
  { name: "bath", icon: Bath, category: "home" },
  { name: "utensils", icon: UtensilsCrossed, category: "home" },
  { name: "wine", icon: Wine, category: "home" },
  { name: "tv", icon: Tv, category: "home" },
  { name: "lamp", icon: Lamp, category: "home" },
  { name: "frame", icon: Frame, category: "home" },

  // Storage & Packaging
  { name: "box", icon: Box, category: "storage" },
  { name: "package", icon: Package, category: "storage" },
  { name: "boxes", icon: Boxes, category: "storage" },
  { name: "warehouse", icon: Warehouse, category: "storage" },
  { name: "store", icon: Store, category: "storage" },
  { name: "archive", icon: Archive, category: "storage" },

  // Layout & Design
  { name: "layers", icon: Layers, category: "design" },
  { name: "layout-grid", icon: LayoutGrid, category: "design" },
  { name: "grid", icon: Grid3X3, category: "design" },
  { name: "palette", icon: Palette, category: "design" },

  // Shapes
  { name: "square", icon: Square, category: "shapes" },
  { name: "circle", icon: Circle, category: "shapes" },
  { name: "triangle", icon: Triangle, category: "shapes" },
  { name: "hexagon", icon: Hexagon, category: "shapes" },

  // Nature
  { name: "leaf", icon: Leaf, category: "nature" },
  { name: "tree", icon: TreeDeciduous, category: "nature" },
  { name: "trees", icon: Trees, category: "nature" },
  { name: "mountain", icon: Mountain, category: "nature" },
  { name: "sun", icon: Sun, category: "nature" },
  { name: "droplets", icon: Droplets, category: "nature" },

  // Awards & Status
  { name: "star", icon: Star, category: "status" },
  { name: "sparkles", icon: Sparkles, category: "status" },
  { name: "crown", icon: Crown, category: "status" },
  { name: "award", icon: Award, category: "status" },
  { name: "medal", icon: Medal, category: "status" },
  { name: "trophy", icon: Trophy, category: "status" },
  { name: "target", icon: Target, category: "status" },

  // Security
  { name: "shield", icon: Shield, category: "security" },
  { name: "lock", icon: Lock, category: "security" },
  { name: "key", icon: Key, category: "security" },

  // Settings
  { name: "settings", icon: Settings, category: "settings" },
  { name: "cog", icon: Cog, category: "settings" },

  // Transport
  { name: "truck", icon: Truck, category: "transport" },
  { name: "car", icon: Car, category: "transport" },

  // Time
  { name: "clock", icon: Clock, category: "time" },
  { name: "calendar", icon: Calendar, category: "time" },
  { name: "timer", icon: Timer, category: "time" },
  { name: "hourglass", icon: Hourglass, category: "time" },

  // Communication
  { name: "phone", icon: Phone, category: "communication" },
  { name: "mail", icon: Mail, category: "communication" },
  { name: "message", icon: MessageCircle, category: "communication" },
  { name: "send", icon: Send, category: "communication" },
  { name: "bell", icon: Bell, category: "communication" },

  // Media
  { name: "camera", icon: Camera, category: "media" },
  { name: "image", icon: Image, category: "media" },
  { name: "video", icon: Video, category: "media" },

  // UI
  { name: "check", icon: Check, category: "ui" },
  { name: "plus", icon: Plus, category: "ui" },
  { name: "minus", icon: Minus, category: "ui" },
  { name: "info", icon: Info, category: "ui" },
  { name: "help", icon: HelpCircle, category: "ui" },
  { name: "alert", icon: AlertCircle, category: "ui" },

  // Business
  { name: "briefcase", icon: Briefcase, category: "business" },
  { name: "wallet", icon: Wallet, category: "business" },
  { name: "receipt", icon: Receipt, category: "business" },
  { name: "calculator", icon: Calculator, category: "business" },

  // Files
  { name: "file", icon: File, category: "files" },
  { name: "file-text", icon: FileText, category: "files" },
  { name: "folder", icon: Folder, category: "files" },
  { name: "clipboard", icon: Clipboard, category: "files" },

  // Energy
  { name: "zap", icon: Zap, category: "energy" },
  { name: "flame", icon: Flame, category: "energy" },
  { name: "lightbulb", icon: Lightbulb, category: "energy" },
];

// ═══════════════════════════════════════════════════════════
// Icon Picker Component
// ═══════════════════════════════════════════════════════════

interface IconPickerProps {
  value: string | null;
  onChange: (iconName: string) => void;
  locale?: string;
}

const translations = {
  fr: {
    selectIcon: "Selectionner une icone",
    searchIcons: "Rechercher une icone...",
    noResults: "Aucune icone trouvee",
    clear: "Effacer",
  },
  en: {
    selectIcon: "Select an icon",
    searchIcons: "Search icons...",
    noResults: "No icons found",
    clear: "Clear",
  },
  es: {
    selectIcon: "Seleccionar icono",
    searchIcons: "Buscar iconos...",
    noResults: "No se encontraron iconos",
    clear: "Borrar",
  },
  ar: {
    selectIcon: "اختر أيقونة",
    searchIcons: "البحث عن أيقونة...",
    noResults: "لم يتم العثور على أيقونات",
    clear: "مسح",
  },
};

export function IconPicker({ value, onChange, locale = "fr" }: IconPickerProps) {
  const t = translations[locale as keyof typeof translations] ?? translations.fr;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get selected icon
  const selectedIcon = useMemo(() => {
    return iconRegistry.find((i) => i.name === value);
  }, [value]);

  // Filter icons
  const filteredIcons = useMemo(() => {
    if (!search) return iconRegistry;
    const query = search.toLowerCase();
    return iconRegistry.filter(
      (i) => i.name.includes(query) || i.category.includes(query)
    );
  }, [search]);

  // Handle select
  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearch("");
  };

  // Handle clear
  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    setSearch("");
  };

  const SelectedIconComponent = selectedIcon?.icon;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors",
          "border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700",
          "focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        )}
      >
        {SelectedIconComponent ? (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <SelectedIconComponent className="h-5 w-5" />
            </div>
            <span className="flex-1 text-start text-gray-900 dark:text-white">
              {selectedIcon.name}
            </span>
          </>
        ) : (
          <span className="flex-1 text-gray-400">{t.selectIcon}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setSearch("");
            }}
          />

          {/* Picker Panel */}
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchIcons}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 ps-10 pe-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>

            {/* Icons Grid */}
            {filteredIcons.length > 0 ? (
              <div className="grid max-h-60 grid-cols-6 gap-2 overflow-y-auto">
                {filteredIcons.map((iconInfo) => {
                  const IconComponent = iconInfo.icon;
                  const isSelected = value === iconInfo.name;

                  return (
                    <button
                      key={iconInfo.name}
                      type="button"
                      onClick={() => handleSelect(iconInfo.name)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                        isSelected
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      )}
                      title={iconInfo.name}
                    >
                      <IconComponent className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">
                {t.noResults}
              </p>
            )}

            {/* Clear Button */}
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
                {t.clear}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Get Icon Component by Name
// ═══════════════════════════════════════════════════════════

export function getIconByName(name: string | null): LucideIcon | null {
  if (!name) return null;
  const iconInfo = iconRegistry.find((i) => i.name === name);
  return iconInfo?.icon ?? null;
}

export { iconRegistry };
