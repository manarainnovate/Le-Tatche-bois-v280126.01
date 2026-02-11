export const dynamic = 'force-dynamic';


import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import type { LocaleCode, TranslationData } from "@/components/admin/TranslationTabs";
import type { UploadedImage } from "@/components/admin/ImageUploader";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ProductTranslation {
  name: string;
  description: string | null;
  locale: string;
}

interface ImageData {
  id?: string;
  url?: string;
  alt?: string;
  isMain?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Get Product
// ═══════════════════════════════════════════════════════════

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      translations: {
        select: { name: true, description: true, locale: true },
      },
    },
  });

  if (!product) return null;

  // Transform translations to the expected format
  const translationsMap: Record<LocaleCode, TranslationData> = {
    fr: { name: "", description: "" },
    en: { name: "", description: "" },
    es: { name: "", description: "" },
    ar: { name: "", description: "" },
  };

  const productTranslations = product.translations as ProductTranslation[];
  productTranslations.forEach((t: ProductTranslation) => {
    const localeKey = t.locale as LocaleCode;
    if (localeKey in translationsMap) {
      translationsMap[localeKey] = {
        name: t.name,
        description: t.description ?? "",
      };
    }
  });

  // Parse images from JSON field
  let images: UploadedImage[] = [];
  try {
    const imagesJson = product.images as unknown;
    if (Array.isArray(imagesJson)) {
      images = (imagesJson as ImageData[]).map((img: ImageData, index: number) => ({
        id: img.id ?? `img-${index}`,
        url: img.url ?? "",
        alt: img.alt,
        isMain: img.isMain ?? index === 0,
      }));
    }
  } catch {
    images = [];
  }

  const priceValue = Number(product.price);
  const comparePriceValue = product.comparePrice ? Number(product.comparePrice) : null;
  const stockValue = product.stockQty;
  const isPublishedValue = product.isActive;
  const isFeaturedValue = product.isFeatured;

  return {
    id: product.id,
    sku: product.sku ?? "",
    categoryId: product.categoryId ?? "",
    price: priceValue,
    comparePrice: comparePriceValue,
    stock: stockValue,
    lowStockThreshold: 5,
    trackInventory: true,
    isPublished: isPublishedValue,
    isFeatured: isFeaturedValue,
    translations: translationsMap,
    images,
  };
}

// ═══════════════════════════════════════════════════════════
// Get Categories
// ═══════════════════════════════════════════════════════════

async function getCategories() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      translations: {
        select: { name: true, locale: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return categories;
}

// ═══════════════════════════════════════════════════════════
// Edit Product Page
// ═══════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { locale, id } = await params;

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} categories={categories} locale={locale} />;
}

// ═══════════════════════════════════════════════════════════
// Metadata
// ═══════════════════════════════════════════════════════════

export const metadata = {
  title: "Edit Product",
};
