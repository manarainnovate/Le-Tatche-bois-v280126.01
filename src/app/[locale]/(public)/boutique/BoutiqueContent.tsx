"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDirection } from "@/hooks/useDirection";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { useToast } from "@/hooks/useToast";
import { useCurrency } from "@/stores/currency";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Eye,
  Heart,
  Package,
  Filter,
  Grid3X3,
  LayoutList,
  Star,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const PRODUCTS_PER_PAGE = 12;

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  comparePrice?: number;
  image: string;
  inStock: boolean;
  stockCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  rating: number;
  reviews: number;
  material: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface BoutiqueContentProps {
  locale: string;
  translations: {
    search: string;
    filterByCategory: string;
    sortBy: string;
    filters: string;
    productsFound: string;
    noProducts: string;
    resetFilters: string;
    addToCart: string;
    addedToCart: string;
    outOfStock: string;
    lowStock: string;
    viewProduct: string;
    categories: Record<string, string>;
    sortOptions: Record<string, string>;
  };
}

// ═══════════════════════════════════════════════════════════
// MOCK DATA - Will be replaced with API fetch
// ═══════════════════════════════════════════════════════════

const productsData: Product[] = [
  {
    id: "prod-1",
    slug: "miroir-bois-sculpte",
    name: "Miroir Bois Sculpté",
    description: "Magnifique miroir avec cadre en bois de cèdre sculpté à la main",
    category: "decoration",
    price: 2500,
    comparePrice: 3000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    inStock: true,
    stockCount: 5,
    isNew: true,
    rating: 4.8,
    reviews: 24,
    material: "Cèdre",
  },
  {
    id: "prod-2",
    slug: "coffret-thuya",
    name: "Coffret en Thuya",
    description: "Coffret artisanal en bois de thuya avec motifs traditionnels",
    category: "accessoires",
    price: 850,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
    inStock: true,
    stockCount: 12,
    isNew: true,
    rating: 5,
    reviews: 18,
    material: "Thuya",
  },
  {
    id: "prod-3",
    slug: "console-style-arabe",
    name: "Console Style Arabe",
    description: "Console d'entrée en bois massif avec gravures arabesques",
    category: "mobilier",
    price: 12000,
    comparePrice: 15000,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126",
    inStock: true,
    stockCount: 1,
    isBestSeller: true,
    rating: 4.9,
    reviews: 12,
    material: "Noyer",
  },
  {
    id: "prod-4",
    slug: "table-basse-cedre",
    name: "Table Basse en Cèdre",
    description: "Table basse rectangulaire en cèdre massif finition naturelle",
    category: "mobilier",
    price: 8500,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
    inStock: true,
    stockCount: 3,
    isBestSeller: true,
    rating: 4.7,
    reviews: 31,
    material: "Cèdre",
  },
  {
    id: "prod-5",
    slug: "lampe-zellige",
    name: "Lampe Zellige Artisanale",
    description: "Lampe de table avec base en bois et abat-jour zellige",
    category: "decoration",
    price: 1200,
    comparePrice: 1500,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
    inStock: true,
    stockCount: 8,
    rating: 4.6,
    reviews: 45,
    material: "Bois & Zellige",
  },
  {
    id: "prod-6",
    slug: "chaise-traditionnelle",
    name: "Chaise Traditionnelle",
    description: "Chaise en bois massif avec assise en cuir tressé",
    category: "mobilier",
    price: 4500,
    image: "https://images.unsplash.com/photo-1503602642458-232111445657",
    inStock: true,
    stockCount: 2,
    rating: 4.8,
    reviews: 22,
    material: "Chêne & Cuir",
  },
  {
    id: "prod-7",
    slug: "cadre-marqueterie",
    name: "Cadre en Marqueterie",
    description: "Cadre photo en marqueterie de bois précieux",
    category: "decoration",
    price: 650,
    image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8",
    inStock: false,
    stockCount: 0,
    rating: 4.5,
    reviews: 16,
    material: "Marqueterie",
  },
  {
    id: "prod-8",
    slug: "boite-bijoux",
    name: "Boîte à Bijoux Sculptée",
    description: "Boîte à bijoux en thuya avec miroir intérieur",
    category: "accessoires",
    price: 450,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
    inStock: true,
    stockCount: 15,
    isNew: true,
    rating: 4.9,
    reviews: 38,
    material: "Thuya",
  },
  {
    id: "prod-9",
    slug: "plateau-service",
    name: "Plateau de Service",
    description: "Plateau de service octogonal en bois de citronnier",
    category: "accessoires",
    price: 380,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    inStock: true,
    stockCount: 20,
    rating: 4.7,
    reviews: 29,
    material: "Citronnier",
  },
  {
    id: "prod-10",
    slug: "etagere-murale",
    name: "Étagère Murale Sculptée",
    description: "Étagère murale avec motifs géométriques marocains",
    category: "mobilier",
    price: 1800,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    inStock: true,
    stockCount: 6,
    rating: 4.8,
    reviews: 14,
    material: "Cèdre",
  },
  {
    id: "prod-11",
    slug: "tabouret-cuir",
    name: "Tabouret Bois et Cuir",
    description: "Tabouret traditionnel avec assise en cuir de chèvre",
    category: "mobilier",
    price: 2200,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2",
    inStock: true,
    stockCount: 4,
    rating: 4.6,
    reviews: 21,
    material: "Noyer & Cuir",
  },
  {
    id: "prod-12",
    slug: "vase-decoratif",
    name: "Vase Décoratif",
    description: "Vase tourné en bois d'olivier avec finition cirée",
    category: "decoration",
    price: 550,
    comparePrice: 700,
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013",
    inStock: true,
    stockCount: 9,
    rating: 4.4,
    reviews: 33,
    material: "Olivier",
  },
  // Additional products for pagination (13-50)
  {
    id: "prod-13",
    slug: "armoire-traditionnelle",
    name: "Armoire Traditionnelle",
    description: "Armoire en cèdre massif avec portes sculptées",
    category: "mobilier",
    price: 18000,
    comparePrice: 22000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    inStock: true,
    stockCount: 2,
    rating: 4.9,
    reviews: 8,
    material: "Cèdre",
  },
  {
    id: "prod-14",
    slug: "table-salle-manger",
    name: "Table Salle à Manger",
    description: "Grande table familiale en noyer massif",
    category: "mobilier",
    price: 25000,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
    inStock: true,
    stockCount: 1,
    isBestSeller: true,
    rating: 5,
    reviews: 15,
    material: "Noyer",
  },
  {
    id: "prod-15",
    slug: "miroir-rond",
    name: "Miroir Rond Sculpté",
    description: "Miroir rond avec cadre en cèdre sculpté",
    category: "decoration",
    price: 1800,
    image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8",
    inStock: true,
    stockCount: 7,
    isNew: true,
    rating: 4.7,
    reviews: 19,
    material: "Cèdre",
  },
  {
    id: "prod-16",
    slug: "porte-manteau",
    name: "Porte-Manteau Artisanal",
    description: "Porte-manteau mural en chêne avec crochets forgés",
    category: "mobilier",
    price: 2800,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    inStock: true,
    stockCount: 5,
    rating: 4.6,
    reviews: 12,
    material: "Chêne",
  },
  {
    id: "prod-17",
    slug: "bougeoir-sculpte",
    name: "Bougeoir Sculpté",
    description: "Bougeoir artisanal en thuya avec motifs géométriques",
    category: "decoration",
    price: 320,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
    inStock: true,
    stockCount: 25,
    rating: 4.8,
    reviews: 42,
    material: "Thuya",
  },
  {
    id: "prod-18",
    slug: "bureau-travail",
    name: "Bureau de Travail",
    description: "Bureau élégant en noyer avec tiroirs intégrés",
    category: "mobilier",
    price: 12000,
    comparePrice: 14000,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126",
    inStock: true,
    stockCount: 3,
    rating: 4.9,
    reviews: 27,
    material: "Noyer",
  },
  {
    id: "prod-19",
    slug: "coffre-rangement",
    name: "Coffre de Rangement",
    description: "Coffre traditionnel en cèdre avec serrure ancienne",
    category: "mobilier",
    price: 5500,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
    inStock: true,
    stockCount: 4,
    rating: 4.7,
    reviews: 18,
    material: "Cèdre",
  },
  {
    id: "prod-20",
    slug: "horloge-murale",
    name: "Horloge Murale Artisanale",
    description: "Horloge murale en olivier avec mécanisme silencieux",
    category: "decoration",
    price: 1200,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    inStock: true,
    stockCount: 10,
    isNew: true,
    rating: 4.8,
    reviews: 31,
    material: "Olivier",
  },
  {
    id: "prod-21",
    slug: "lit-traditionnel",
    name: "Lit Traditionnel Sculpté",
    description: "Lit king size en cèdre avec tête de lit sculptée",
    category: "mobilier",
    price: 35000,
    comparePrice: 40000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    inStock: true,
    stockCount: 1,
    isBestSeller: true,
    rating: 5,
    reviews: 9,
    material: "Cèdre",
  },
  {
    id: "prod-22",
    slug: "table-chevet",
    name: "Table de Chevet",
    description: "Table de chevet en noyer avec tiroir",
    category: "mobilier",
    price: 2800,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
    inStock: true,
    stockCount: 8,
    rating: 4.6,
    reviews: 24,
    material: "Noyer",
  },
  {
    id: "prod-23",
    slug: "porte-encens",
    name: "Porte-Encens Sculpté",
    description: "Porte-encens artisanal en thuya parfumé",
    category: "accessoires",
    price: 180,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
    inStock: true,
    stockCount: 30,
    rating: 4.9,
    reviews: 56,
    material: "Thuya",
  },
  {
    id: "prod-24",
    slug: "bibliotheque-murale",
    name: "Bibliothèque Murale",
    description: "Bibliothèque modulaire en chêne massif",
    category: "mobilier",
    price: 15000,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    inStock: true,
    stockCount: 2,
    rating: 4.8,
    reviews: 11,
    material: "Chêne",
  },
  {
    id: "prod-25",
    slug: "dessous-plat",
    name: "Dessous de Plat Gravé",
    description: "Dessous de plat en olivier avec motifs berbères",
    category: "accessoires",
    price: 150,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    inStock: true,
    stockCount: 40,
    rating: 4.7,
    reviews: 67,
    material: "Olivier",
  },
  {
    id: "prod-26",
    slug: "fauteuil-relaxation",
    name: "Fauteuil de Relaxation",
    description: "Fauteuil confortable en noyer avec cuir naturel",
    category: "mobilier",
    price: 8500,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    inStock: true,
    stockCount: 3,
    rating: 4.9,
    reviews: 19,
    material: "Noyer & Cuir",
  },
  {
    id: "prod-27",
    slug: "cadre-photo-famille",
    name: "Cadre Photo Famille",
    description: "Cadre multi-photos en cèdre sculpté",
    category: "decoration",
    price: 450,
    image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8",
    inStock: true,
    stockCount: 15,
    rating: 4.6,
    reviews: 35,
    material: "Cèdre",
  },
  {
    id: "prod-28",
    slug: "commode-rangement",
    name: "Commode de Rangement",
    description: "Commode 5 tiroirs en noyer avec poignées en laiton",
    category: "mobilier",
    price: 9500,
    comparePrice: 11000,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126",
    inStock: true,
    stockCount: 4,
    rating: 4.8,
    reviews: 14,
    material: "Noyer",
  },
  {
    id: "prod-29",
    slug: "set-couverts",
    name: "Set de Couverts Bois",
    description: "Ensemble de couverts en olivier pour 6 personnes",
    category: "accessoires",
    price: 280,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    inStock: true,
    stockCount: 22,
    isNew: true,
    rating: 4.7,
    reviews: 48,
    material: "Olivier",
  },
  {
    id: "prod-30",
    slug: "paravent-sculpte",
    name: "Paravent Sculpté",
    description: "Paravent 3 panneaux en cèdre avec motifs arabesques",
    category: "decoration",
    price: 7500,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
    inStock: true,
    stockCount: 2,
    rating: 4.9,
    reviews: 7,
    material: "Cèdre",
  },
  {
    id: "prod-31",
    slug: "banc-entree",
    name: "Banc d'Entrée",
    description: "Banc avec rangement chaussures en chêne",
    category: "mobilier",
    price: 4200,
    image: "https://images.unsplash.com/photo-1503602642458-232111445657",
    inStock: true,
    stockCount: 5,
    rating: 4.6,
    reviews: 21,
    material: "Chêne",
  },
  {
    id: "prod-32",
    slug: "porte-cles-mural",
    name: "Porte-Clés Mural",
    description: "Porte-clés décoratif en thuya avec 6 crochets",
    category: "accessoires",
    price: 220,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
    inStock: true,
    stockCount: 35,
    rating: 4.8,
    reviews: 63,
    material: "Thuya",
  },
  {
    id: "prod-33",
    slug: "meuble-tv",
    name: "Meuble TV Moderne",
    description: "Meuble TV bas en noyer avec compartiments",
    category: "mobilier",
    price: 11000,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
    inStock: true,
    stockCount: 3,
    rating: 4.7,
    reviews: 16,
    material: "Noyer",
  },
  {
    id: "prod-34",
    slug: "statue-decorative",
    name: "Statue Décorative",
    description: "Statue abstraite sculptée en cèdre",
    category: "decoration",
    price: 1500,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
    inStock: true,
    stockCount: 8,
    rating: 4.5,
    reviews: 28,
    material: "Cèdre",
  },
  {
    id: "prod-35",
    slug: "porte-revues",
    name: "Porte-Revues Artisanal",
    description: "Porte-revues en olivier avec compartiments",
    category: "accessoires",
    price: 680,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    inStock: true,
    stockCount: 12,
    rating: 4.6,
    reviews: 19,
    material: "Olivier",
  },
  {
    id: "prod-36",
    slug: "table-appoint",
    name: "Table d'Appoint",
    description: "Petite table d'appoint en noyer sculpté",
    category: "mobilier",
    price: 3200,
    comparePrice: 3800,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126",
    inStock: true,
    stockCount: 6,
    rating: 4.8,
    reviews: 25,
    material: "Noyer",
  },
  {
    id: "prod-37",
    slug: "boite-mouchoirs",
    name: "Boîte à Mouchoirs",
    description: "Boîte à mouchoirs en thuya avec couvercle coulissant",
    category: "accessoires",
    price: 180,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
    inStock: true,
    stockCount: 45,
    rating: 4.9,
    reviews: 72,
    material: "Thuya",
  },
  {
    id: "prod-38",
    slug: "coiffeuse-miroir",
    name: "Coiffeuse avec Miroir",
    description: "Coiffeuse élégante en cèdre avec miroir pivotant",
    category: "mobilier",
    price: 14000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    inStock: true,
    stockCount: 2,
    rating: 4.9,
    reviews: 11,
    material: "Cèdre",
  },
  {
    id: "prod-39",
    slug: "lustre-bois",
    name: "Lustre en Bois",
    description: "Lustre artisanal en cèdre avec 6 points lumineux",
    category: "decoration",
    price: 5500,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
    inStock: true,
    stockCount: 4,
    isNew: true,
    rating: 4.8,
    reviews: 13,
    material: "Cèdre",
  },
  {
    id: "prod-40",
    slug: "porte-parapluie",
    name: "Porte-Parapluie",
    description: "Porte-parapluie en chêne avec bac récupérateur",
    category: "accessoires",
    price: 750,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    inStock: true,
    stockCount: 10,
    rating: 4.5,
    reviews: 22,
    material: "Chêne",
  },
  {
    id: "prod-41",
    slug: "vaisselier",
    name: "Vaisselier Traditionnel",
    description: "Grand vaisselier en noyer avec vitrines",
    category: "mobilier",
    price: 22000,
    comparePrice: 26000,
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e",
    inStock: true,
    stockCount: 1,
    isBestSeller: true,
    rating: 5,
    reviews: 6,
    material: "Noyer",
  },
  {
    id: "prod-42",
    slug: "tableau-sculpte",
    name: "Tableau Sculpté",
    description: "Tableau mural en cèdre avec relief artistique",
    category: "decoration",
    price: 2800,
    image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8",
    inStock: true,
    stockCount: 5,
    rating: 4.7,
    reviews: 17,
    material: "Cèdre",
  },
  {
    id: "prod-43",
    slug: "porte-savon",
    name: "Porte-Savon Artisanal",
    description: "Porte-savon en olivier avec drainage",
    category: "accessoires",
    price: 120,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
    inStock: true,
    stockCount: 50,
    rating: 4.8,
    reviews: 89,
    material: "Olivier",
  },
  {
    id: "prod-44",
    slug: "secretaire-bureau",
    name: "Secrétaire Bureau",
    description: "Secrétaire rabattable en noyer avec rangements",
    category: "mobilier",
    price: 16000,
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126",
    inStock: true,
    stockCount: 2,
    rating: 4.9,
    reviews: 8,
    material: "Noyer",
  },
  {
    id: "prod-45",
    slug: "applique-murale",
    name: "Applique Murale",
    description: "Applique décorative en cèdre avec LED intégrée",
    category: "decoration",
    price: 950,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
    inStock: true,
    stockCount: 12,
    rating: 4.6,
    reviews: 31,
    material: "Cèdre",
  },
  {
    id: "prod-46",
    slug: "gueridon",
    name: "Guéridon Sculpté",
    description: "Petit guéridon rond en thuya avec pieds tournés",
    category: "mobilier",
    price: 4800,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace",
    inStock: true,
    stockCount: 4,
    rating: 4.7,
    reviews: 14,
    material: "Thuya",
  },
  {
    id: "prod-47",
    slug: "range-courrier",
    name: "Range-Courrier Mural",
    description: "Organisateur mural en olivier avec 3 compartiments",
    category: "accessoires",
    price: 380,
    image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237",
    inStock: true,
    stockCount: 18,
    rating: 4.5,
    reviews: 26,
    material: "Olivier",
  },
  {
    id: "prod-48",
    slug: "console-entree",
    name: "Console d'Entrée",
    description: "Console étroite en cèdre pour entrée",
    category: "mobilier",
    price: 7500,
    comparePrice: 8500,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    inStock: true,
    stockCount: 3,
    rating: 4.8,
    reviews: 20,
    material: "Cèdre",
  },
  {
    id: "prod-49",
    slug: "cadre-miroir-ovale",
    name: "Cadre Miroir Ovale",
    description: "Miroir ovale avec cadre en noyer sculpté",
    category: "decoration",
    price: 2200,
    image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8",
    inStock: true,
    stockCount: 6,
    isNew: true,
    rating: 4.9,
    reviews: 15,
    material: "Noyer",
  },
  {
    id: "prod-50",
    slug: "set-bols-bois",
    name: "Set de Bols en Bois",
    description: "Ensemble de 4 bols en olivier de différentes tailles",
    category: "accessoires",
    price: 420,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe",
    inStock: true,
    stockCount: 28,
    rating: 4.7,
    reviews: 54,
    material: "Olivier",
  },
];

const categoriesData: Category[] = [
  { id: "all", name: "Tous les produits", count: 50 },
  { id: "mobilier", name: "Mobilier", count: 22 },
  { id: "decoration", name: "Décoration", count: 15 },
  { id: "accessoires", name: "Accessoires", count: 13 },
];

const sortOptionsData = [
  { id: "newest", name: "Plus récent" },
  { id: "priceAsc", name: "Prix croissant" },
  { id: "priceDesc", name: "Prix décroissant" },
  { id: "popular", name: "Populaires" },
  { id: "rating", name: "Mieux notés" },
];

// ═══════════════════════════════════════════════════════════
// TRUST BADGES COMPONENT
// ═══════════════════════════════════════════════════════════

function TrustBadges({ isRTL }: { isRTL: boolean }) {
  const badges = [
    { icon: Truck, text: "Livraison gratuite dès 1000 DH" },
    { icon: Shield, text: "Paiement sécurisé" },
    { icon: RotateCcw, text: "Retour sous 14 jours" },
    { icon: Award, text: "Fait main au Maroc" },
  ];

  return (
    <section className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className={cn(
          "flex flex-wrap justify-center gap-6 md:gap-10 text-sm",
          isRTL && "flex-row-reverse"
        )}>
          {badges.map((badge, i) => (
            <div key={i} className={cn(
              "flex items-center gap-2 text-wood-dark",
              isRTL && "flex-row-reverse"
            )}>
              <badge.icon className="w-5 h-5 text-wood-primary" />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// STAR RATING COMPONENT
// ═══════════════════════════════════════════════════════════

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const stars = [0, 1, 2, 3, 4] as const; // Fixed array for 5 stars
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {stars.map((i) => (
          <Star
            key={i}
            size={14}
            className={cn(
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">({reviews})</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT
// ═══════════════════════════════════════════════════════════

function ProductCard({
  product,
  locale,
  isRTL,
  translations,
  onAddToCart,
  isVisible,
  index,
  viewMode,
  wishlist,
  onToggleWishlist,
  addedToCart,
}: {
  product: Product;
  locale: string;
  isRTL: boolean;
  translations: BoutiqueContentProps["translations"];
  onAddToCart: () => void;
  isVisible: boolean;
  index: number;
  viewMode: "grid" | "list";
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  addedToCart: string | null;
}) {
  const { format } = useCurrency();
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const isLowStock = product.inStock && product.stockCount <= 5;
  const isInWishlist = wishlist.includes(product.id);
  const isJustAdded = addedToCart === product.id;

  return (
    <div
      className={cn(
        "transform transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        viewMode === "list" && "flex"
      )}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className={cn(
        "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full",
        viewMode === "list" && "flex w-full"
      )}>
        {/* Image Container - MUST have explicit height for fill to work */}
        <div className={cn(
          "relative overflow-hidden bg-gray-100",
          viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "h-64 w-full"
        )}>
          <Link href={`/${locale}/boutique/${product.slug}`} className="block absolute inset-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes={viewMode === "list"
                ? "192px"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              priority={index < 6}
            />
          </Link>

          {/* Badges */}
          <div className={cn(
            "absolute top-3 flex flex-col gap-2 z-10",
            isRTL ? "right-3" : "left-3"
          )}>
            {product.isNew && (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow">
                NOUVEAU
              </span>
            )}
            {discount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow">
                -{discount}%
              </span>
            )}
            {product.isBestSeller && (
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">
                BEST-SELLER
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className={cn(
            "absolute top-3 flex flex-col gap-2 z-10",
            "opacity-0 group-hover:opacity-100 transition-all duration-300",
            "translate-x-2 group-hover:translate-x-0",
            isRTL ? "left-3" : "right-3"
          )}>
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(product.id);
              }}
              className={cn(
                "p-2.5 rounded-full shadow-lg transition-all",
                isInWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-600 hover:bg-red-500 hover:text-white"
              )}
            >
              <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
            </button>
            <Link
              href={`/${locale}/boutique/${product.slug}`}
              className="p-2.5 bg-white rounded-full shadow-lg text-gray-600 hover:bg-wood-primary hover:text-white transition-all"
            >
              <Eye size={18} />
            </Link>
          </div>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <span className="px-6 py-3 bg-white text-wood-dark font-bold rounded-full shadow-lg">
                {translations.outOfStock}
              </span>
            </div>
          )}

          {/* Quick Add to Cart (on hover) - Grid View Only */}
          {product.inStock && viewMode === "grid" && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart();
                }}
                className={cn(
                  "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                  isJustAdded
                    ? "bg-green-500 text-white"
                    : "bg-white text-wood-dark hover:bg-wood-primary hover:text-white"
                )}
              >
                {isJustAdded ? (
                  <>
                    <Check size={18} />
                    {translations.addedToCart}
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {translations.addToCart}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn(
          "p-5",
          viewMode === "list" && "flex-1 flex flex-col",
          isRTL && "text-right"
        )}>
          {/* Category */}
          <span className="text-xs font-medium text-wood-primary uppercase tracking-wide">
            {translations.categories[product.category] || product.category}
          </span>

          {/* Name */}
          <Link href={`/${locale}/boutique/${product.slug}`}>
            <h3 className="text-lg font-bold text-wood-dark mt-1 hover:text-wood-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Description (List view only) */}
          {viewMode === "list" && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Rating */}
          <div className="mt-2">
            <StarRating rating={product.rating} reviews={product.reviews} />
          </div>

          {/* Price */}
          <div className={cn(
            "flex items-center gap-3 mt-3",
            isRTL && "flex-row-reverse justify-end"
          )}>
            <span className="text-xl font-bold text-wood-primary">
              {format(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                {format(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {isLowStock && (
            <p className={cn(
              "text-xs text-orange-500 font-medium mt-2 flex items-center gap-1",
              isRTL && "flex-row-reverse justify-end"
            )}>
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              {translations.lowStock.replace("{count}", String(product.stockCount))}
            </p>
          )}

          {/* Material Tag */}
          <div className="mt-3">
            <span className="inline-block px-3 py-1 bg-wood-cream text-wood-dark text-xs rounded-full">
              {product.material}
            </span>
          </div>

          {/* Add to Cart Button (List view) */}
          {viewMode === "list" && product.inStock && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
              className={cn(
                "mt-4 w-full sm:w-auto px-6 py-3 rounded-xl font-bold",
                "flex items-center justify-center gap-2 transition-all",
                isJustAdded
                  ? "bg-green-500 text-white"
                  : "bg-wood-primary text-white hover:bg-wood-secondary"
              )}
            >
              {isJustAdded ? (
                <>
                  <Check size={18} />
                  {translations.addedToCart}
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  {translations.addToCart}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR COMPONENT
// ═══════════════════════════════════════════════════════════

function Sidebar({
  selectedCategory,
  setSelectedCategory,
  isRTL,
}: {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isRTL: boolean;
}) {
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [materialFilters, setMaterialFilters] = useState<string[]>([]);

  const priceRanges = [
    { id: "under500", label: "Moins de 500 DH" },
    { id: "500-2000", label: "500 - 2000 DH" },
    { id: "2000-5000", label: "2000 - 5000 DH" },
    { id: "over5000", label: "Plus de 5000 DH" },
  ];

  const materials = ["Cèdre", "Thuya", "Noyer", "Chêne", "Olivier"];

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
        {/* Categories */}
        <h3 className={cn(
          "text-lg font-bold text-wood-dark mb-4 flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <Filter size={20} className="text-wood-primary" />
          Catégories
        </h3>
        <ul className="space-y-2">
          {categoriesData.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                  selectedCategory === cat.id
                    ? "bg-wood-primary text-white"
                    : "hover:bg-wood-primary/10 text-wood-dark",
                  isRTL && "flex-row-reverse"
                )}
              >
                <span className="font-medium">{cat.name}</span>
                <span className={cn(
                  "text-sm px-2 py-0.5 rounded-full",
                  selectedCategory === cat.id ? "bg-white/20" : "bg-gray-100"
                )}>
                  {cat.count}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Price Range */}
        <div className="mt-8 pt-6 border-t">
          <h4 className={cn("font-bold text-wood-dark mb-4", isRTL && "text-right")}>
            Prix
          </h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label
                key={range.id}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isRTL && "flex-row-reverse"
                )}
              >
                <input
                  type="checkbox"
                  checked={priceFilters.includes(range.id)}
                  onChange={() => {
                    setPriceFilters((prev) =>
                      prev.includes(range.id)
                        ? prev.filter((p) => p !== range.id)
                        : [...prev, range.id]
                    );
                  }}
                  className="w-4 h-4 text-wood-primary rounded border-gray-300 focus:ring-wood-primary"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Material */}
        <div className="mt-8 pt-6 border-t">
          <h4 className={cn("font-bold text-wood-dark mb-4", isRTL && "text-right")}>
            Matériau
          </h4>
          <div className="space-y-2">
            {materials.map((mat) => (
              <label
                key={mat}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isRTL && "flex-row-reverse"
                )}
              >
                <input
                  type="checkbox"
                  checked={materialFilters.includes(mat)}
                  onChange={() => {
                    setMaterialFilters((prev) =>
                      prev.includes(mat)
                        ? prev.filter((m) => m !== mat)
                        : [...prev, mat]
                    );
                  }}
                  className="w-4 h-4 text-wood-primary rounded border-gray-300 focus:ring-wood-primary"
                />
                <span className="text-sm">{mat}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN CONTENT COMPONENT
// ═══════════════════════════════════════════════════════════

export function BoutiqueContent({ locale, translations }: BoutiqueContentProps) {
  const direction = useDirection();
  const isRTL = direction === "rtl";
  const { addItem } = useCartStore();
  const { success } = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Animation state
  const gridRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = productsData.filter((p) => {
      const categoryMatch = selectedCategory === "all" || p.category === selectedCategory;
      const searchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });

    // Sort
    switch (sortBy) {
      case "priceAsc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  // Generate page numbers for pagination UI
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll to top of products
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Handlers
  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
    success(translations.addedToCart, product.name);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  return (
    <>
      {/* Trust Badges */}
      <TrustBadges isRTL={isRTL} />

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className={cn("flex gap-8", isRTL && "flex-row-reverse")}>
            {/* Sidebar */}
            <Sidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              isRTL={isRTL}
            />

            {/* Products Area */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className={cn(
                "flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm",
                isRTL && "flex-row-reverse"
              )}>
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400",
                    isRTL ? "right-3" : "left-3"
                  )} />
                  <input
                    type="search"
                    placeholder={translations.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full py-2.5 border border-gray-200 rounded-lg bg-white",
                      "focus:outline-none focus:ring-2 focus:ring-wood-primary/50",
                      isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                    )}
                  />
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={cn(
                    "lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <SlidersHorizontal size={18} />
                  {translations.filters}
                </button>

                {/* Results Count */}
                <p className="text-wood-dark/70 hidden sm:block">
                  <span className="font-semibold text-wood-dark">{startIndex + 1}-{endIndex}</span>{" "}
                  sur <span className="font-semibold text-wood-dark">{totalProducts}</span>{" "}
                  {translations.productsFound}
                </p>

                {/* Sort & View */}
                <div className={cn(
                  "flex items-center gap-3",
                  isRTL && "flex-row-reverse"
                )}>
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={cn(
                        "appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-white",
                        "focus:outline-none focus:ring-2 focus:ring-wood-primary/50 cursor-pointer",
                        isRTL && "text-right"
                      )}
                    >
                      {sortOptionsData.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Toggle */}
                  <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-2.5 transition-colors",
                        viewMode === "grid"
                          ? "bg-wood-primary text-white"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "p-2.5 transition-colors",
                        viewMode === "list"
                          ? "bg-wood-primary text-white"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Filters */}
              {showMobileFilters && (
                <div className="lg:hidden mb-6 bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {categoriesData.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                          selectedCategory === cat.id
                            ? "bg-wood-primary text-white"
                            : "bg-gray-100 text-wood-dark hover:bg-gray-200"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <div
                ref={gridRef}
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {paginatedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    isRTL={isRTL}
                    translations={translations}
                    onAddToCart={() => handleAddToCart(product)}
                    isVisible={isVisible}
                    index={index}
                    viewMode={viewMode}
                    wishlist={wishlist}
                    onToggleWishlist={toggleWishlist}
                    addedToCart={addedToCart}
                  />
                ))}
              </div>

              {/* No Products */}
              {paginatedProducts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    {translations.noProducts}
                  </h3>
                  <p className="text-gray-400 mb-4">Essayez de modifier vos filtres</p>
                  <button
                    onClick={resetFilters}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3",
                      "bg-wood-primary text-white rounded-lg font-medium",
                      "hover:bg-wood-secondary transition-colors",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <X size={18} />
                    {translations.resetFilters}
                  </button>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* PAGINATION                                                  */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {totalPages > 1 && (
                <div className={cn(
                  "mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm",
                  isRTL && "flex-row-reverse"
                )}>
                  {/* Results Info */}
                  <p className="text-sm text-gray-500">
                    Page <span className="font-semibold text-wood-dark">{currentPage}</span> sur{" "}
                    <span className="font-semibold text-wood-dark">{totalPages}</span>{" "}
                    ({totalProducts} produits)
                  </p>

                  {/* Pagination Controls */}
                  <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-wood-primary/10 hover:text-wood-primary"
                      )}
                      title="Première page"
                    >
                      <ChevronsLeft size={20} />
                    </button>

                    {/* Previous */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-wood-primary/10 hover:text-wood-primary"
                      )}
                      title="Page précédente"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {/* Page Numbers */}
                    <div className={cn("flex items-center gap-1 mx-2", isRTL && "flex-row-reverse")}>
                      {getPageNumbers().map((page, idx) =>
                        typeof page === "number" ? (
                          <button
                            key={idx}
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              "min-w-[40px] h-10 rounded-lg font-medium transition-all",
                              page === currentPage
                                ? "bg-wood-primary text-white shadow-lg shadow-wood-primary/30"
                                : "text-gray-600 hover:bg-wood-primary/10 hover:text-wood-primary"
                            )}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={idx} className="px-2 text-gray-400">
                            {page}
                          </span>
                        )
                      )}
                    </div>

                    {/* Next */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-wood-primary/10 hover:text-wood-primary"
                      )}
                      title="Page suivante"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-wood-primary/10 hover:text-wood-primary"
                      )}
                      title="Dernière page"
                    >
                      <ChevronsRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

BoutiqueContent.displayName = "BoutiqueContent";
