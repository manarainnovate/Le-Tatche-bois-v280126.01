import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  apiSuccess,
  apiNotFound,
  handleApiError,
  getLocaleFromHeaders,
} from "@/lib/api-helpers";

// ═══════════════════════════════════════════════════════════
// HELPER: Get visitor ID from cookie
// ═══════════════════════════════════════════════════════════

function getVisitorId(): string | null {
  const cookieStore = cookies();
  return cookieStore.get("visitor_id")?.value ?? null;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Format cart response
// ═══════════════════════════════════════════════════════════

interface CartWithItems {
  id: string;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      slug: string;
      price: unknown;
      comparePrice: unknown;
      isActive: boolean;
      stockQty: number;
      images: string[];
      translations: Array<{
        locale: string;
        name: string;
      }>;
    };
  }>;
}

function formatCartResponse(cart: CartWithItems | null, locale: string) {
  if (!cart) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  const items = cart.items.map((item) => {
    const translation = item.product.translations.find((t) => t.locale === locale)
      ?? item.product.translations[0];
    const price = Number(item.product.price);
    const comparePrice = item.product.comparePrice ? Number(item.product.comparePrice) : null;

    return {
      id: item.id,
      productId: item.product.id,
      slug: item.product.slug,
      name: translation?.name ?? item.product.slug,
      quantity: item.quantity,
      priceMAD: price,
      comparePrice,
      total: price * item.quantity,
      stockStatus: item.product.isActive ? "IN_STOCK" : "OUT_OF_STOCK",
      stockQty: item.product.stockQty,
      image: item.product.images.length > 0 ? item.product.images[0] : null,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartId: cart.id,
    items,
    subtotal,
    itemCount,
  };
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/cart/[productId] - Remove specific item
// ═══════════════════════════════════════════════════════════

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const locale = getLocaleFromHeaders(req.headers);
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const visitorId = getVisitorId();

    // Find cart
    let cart;
    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      });
    } else if (visitorId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId: visitorId },
        include: { items: true },
      });
    }

    if (!cart) {
      return apiNotFound("Cart not found");
    }

    // Find and delete item
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      return apiNotFound("Item not found in cart");
    }

    await prisma.cartItem.delete({ where: { id: item.id } });

    // Refetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
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

    return apiSuccess(formatCartResponse(updatedCart, locale));
  } catch (error) {
    return handleApiError(error, "Cart Item DELETE");
  }
}
