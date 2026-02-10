import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  apiSuccess,
  apiError,
  apiNotFound,
  handleApiError,
  getLocaleFromHeaders,
} from "@/lib/api-helpers";
import { addToCartSchema } from "@/lib/validations";

// ═══════════════════════════════════════════════════════════
// HELPER: Get or create session ID
// ═══════════════════════════════════════════════════════════

function getSessionId(): string {
  const cookieStore = cookies();
  let sessionId = cookieStore.get("cart_session_id")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  return sessionId;
}

// ═══════════════════════════════════════════════════════════
// HELPER: Get or create cart
// ═══════════════════════════════════════════════════════════

async function getOrCreateCart(userId: string | null, sessionId: string) {
  // If logged in, find user cart
  if (userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId },
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

    if (!cart) {
      // Check if there's an anonymous cart to merge
      const anonymousCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      // Create user cart
      cart = await prisma.cart.create({
        data: { userId },
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

      // Merge anonymous cart items if exists
      if (anonymousCart && anonymousCart.items.length > 0) {
        for (const item of anonymousCart.items) {
          // Check if item already exists
          const existingItem = await prisma.cartItem.findFirst({
            where: {
              cartId: cart.id,
              productId: item.productId,
              variantId: item.variantId ?? null,
            },
          });

          if (existingItem) {
            await prisma.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: { increment: item.quantity } },
            });
          } else {
            await prisma.cartItem.create({
              data: {
                cartId: cart.id,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              },
            });
          }
        }

        // Delete anonymous cart
        await prisma.cart.delete({ where: { id: anonymousCart.id } });

        // Refetch cart with merged items
        cart = await prisma.cart.findFirst({
          where: { userId },
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
      }
    }

    return cart;
  }

  // Anonymous user - find or create by sessionId
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
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

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
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
  }

  return cart;
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
// GET /api/cart - Get cart items
// ═══════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  try {
    const locale = getLocaleFromHeaders(req.headers);
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const sessionId = getSessionId();

    const cart = await getOrCreateCart(userId, sessionId);

    const response = NextResponse.json({
      success: true,
      data: formatCartResponse(cart, locale),
    });

    // Set session cookie if not logged in
    if (!userId) {
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return handleApiError(error, "Cart GET");
  }
}

// ═══════════════════════════════════════════════════════════
// POST /api/cart - Add item to cart
// ═══════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const locale = getLocaleFromHeaders(req.headers);
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const sessionId = getSessionId();

    const body: unknown = await req.json();
    const result = addToCartSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const { productId, quantity } = result.data;

    // Check product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return apiNotFound("Product not found");
    }

    if (!product.isActive) {
      return apiError("Product is not available", 400);
    }

    // Check stock
    if (product.stockQty <= 0) {
      return apiError("Product is out of stock", 400);
    }

    if (product.stockQty < quantity) {
      return apiError(`Only ${product.stockQty} items available`, 400);
    }

    // Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return apiError("Could not create cart", 500);
    }

    // Add or update item
    const existingItem = cart.items.find((item) => item.product.id === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stockQty) {
        return apiError(`Cannot add more. Only ${product.stockQty} items available`, 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Refetch updated cart
    const updatedCart = await getOrCreateCart(userId, sessionId);

    const response = NextResponse.json({
      success: true,
      data: formatCartResponse(updatedCart, locale),
    });

    if (!userId) {
      response.cookies.set("cart_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return handleApiError(error, "Cart POST");
  }
}

// ═══════════════════════════════════════════════════════════
// PUT /api/cart - Update item quantity
// ═══════════════════════════════════════════════════════════

export async function PUT(req: NextRequest) {
  try {
    const locale = getLocaleFromHeaders(req.headers);
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const sessionId = getSessionId();

    const body: unknown = await req.json();

    // Validate: need productId and quantity
    const schema = addToCartSchema;
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return apiError("Validation failed", 400, errors);
    }

    const { productId, quantity } = result.data;

    // Get cart
    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) {
      return apiError("Cart not found", 404);
    }

    // Find item
    const item = cart.items.find((i) => i.product.id === productId);
    if (!item) {
      return apiNotFound("Item not found in cart");
    }

    // Check stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return apiNotFound("Product not found");
    }

    if (quantity > product.stockQty) {
      return apiError(`Only ${product.stockQty} items available`, 400);
    }

    // Update or remove if quantity is 0
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    // Refetch updated cart
    const updatedCart = await getOrCreateCart(userId, sessionId);

    return apiSuccess(formatCartResponse(updatedCart, locale));
  } catch (error) {
    return handleApiError(error, "Cart PUT");
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE /api/cart - Clear entire cart
// ═══════════════════════════════════════════════════════════

export async function DELETE(_req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const sessionId = getSessionId();

    // Find cart
    let cart;
    if (userId) {
      cart = await prisma.cart.findFirst({ where: { userId } });
    } else {
      cart = await prisma.cart.findUnique({ where: { sessionId } });
    }

    if (cart) {
      // Delete all items
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return apiSuccess({ items: [], subtotal: 0, itemCount: 0 });
  } catch (error) {
    return handleApiError(error, "Cart DELETE");
  }
}
