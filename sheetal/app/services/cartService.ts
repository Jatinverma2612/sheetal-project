import { apiFetch } from "./api";
import { CartItem } from "../hooks/useCart";

export const fetchCart = async (): Promise<{
  success: boolean;
  data: { items: CartItem[] };
}> => {
  return apiFetch("/cart");
};

export const addToCart = async (
  productId: string,
  variantId: string,
  quantity: number,
  size: string,
  price: number,
  discountPrice: number,
  color: string,
  variantImage: string,
) => {
  return apiFetch("/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      variantId,
      quantity,
      size,
      price,
      discountPrice,
      color,
      variantImage,
    }),
  });
};

export const removeFromCart = async (itemId: string) => {
  return apiFetch(`/cart/remove/${itemId}`, {
    method: "DELETE",
  });
};

export const clearCart = async (userId: string) => {
  return apiFetch(`/cart/clear/${userId}`, {
    method: "DELETE",
  });
};

export const applyCoupon = async (
  code: string,
  cartTotal: number,
  userId: string,
  cartItems: CartItem[],
) => {
  return apiFetch("/coupons/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, cartTotal, userId, cartItems }),
  });
};

export const updateCartItemQuantity = async (
  itemId: string,
  quantity: number,
) => {
  return apiFetch(`/cart/update/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });
};

export const recordCartActivity = async (
  payload: {
    source?: string;
    email?: string;
    phoneNumber?: string;
  } = {},
) => {
  return apiFetch("/cart/activity", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const checkoutExit = async () => {
  return apiFetch("/cart/checkout-exit", {
    method: "POST",
  });
};

/**
 * Merges guest cart items into the authenticated user's server cart.
 * Called once after login.
 */
export const mergeGuestCart = async (
  guestItems: Array<{
    productId: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    discountPrice: number;
    variantImage: string;
  }>,
) => {
  return apiFetch("/cart/merge-guest", {
    method: "POST",
    body: JSON.stringify({ guestItems }),
  });
};

export const createSharedCart = async (items: CartItem[]) => {
  return apiFetch("/shared-cart", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
};

export const getSharedCart = async (token: string) => {
  return apiFetch(`/shared-cart/${encodeURIComponent(token)}`);
};
