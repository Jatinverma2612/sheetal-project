import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import logger from "../utils/logger.js";
import { handleUserActivity } from "./abandonedCart.service.js";
import { recalculateAbandonedCartDiscount } from "./abandonedcartcoupon.service.js";

const sanitizeAbandonmentReminderAttempts = (cart) => {
  if (!Array.isArray(cart?.abandonmentReminderAttempts)) {
    return [];
  }

  const validStatuses = new Set(["success", "failure", "skipped"]);

  return cart.abandonmentReminderAttempts.filter(
    (attempt) =>
      attempt &&
      typeof attempt.stage === "string" &&
      attempt.stage.trim() &&
      typeof attempt.jobId === "string" &&
      attempt.jobId.trim() &&
      typeof attempt.status === "string" &&
      validStatuses.has(attempt.status),
  );
};

/**
 * After saving a cart mutation, recalculate the abandoned-cart coupon
 * discount if one is applied. Errors are swallowed so they never break
 * the primary cart operation.
 */
const tryRecalculateCoupon = async (cart) => {
  if (!cart?.appliedAbandonedCoupon?.couponRecordId) return;
  try {
    await recalculateAbandonedCartDiscount(cart);
  } catch (err) {
    logger.error(
      { cartId: cart._id?.toString?.(), error: err.message },
      "[Cart] Failed to recalculate abandoned-cart coupon discount",
    );
  }
};

const normalizeQuantity = (quantity) => {
  const parsed = Number(quantity);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
};

const getVariantForCartItem = (product, cartItemLike) => {
  if (
    !product ||
    !Array.isArray(product.variants) ||
    product.variants.length === 0
  ) {
    return null;
  }

  const requestedVariantId = String(
    cartItemLike?.variantId ||
      cartItemLike?.variant?._id ||
      cartItemLike?._id ||
      "",
  ).trim();

  // 1. Exact match by Variant ID
  if (requestedVariantId) {
    const byId = product.variants.find(
      (variant) => String(variant?._id || "").trim() === requestedVariantId,
    );
    if (byId) return byId;
  }

  const requestedSku = String(
    cartItemLike?.variant?.v_sku || cartItemLike?.v_sku || "",
  )
    .trim()
    .toUpperCase();
  const requestedColor = String(cartItemLike?.color || "")
    .trim()
    .toLowerCase();
  const requestedSize = String(cartItemLike?.size || "")
    .trim()
    .toLowerCase();

  // 2. Exact match by variant v_sku
  if (requestedSku) {
    const bySku = product.variants.find((variant) => {
      const vSku = String(variant?.v_sku || "").trim().toUpperCase();
      return vSku && vSku === requestedSku;
    });
    if (bySku) return bySku;
  }

  // 3. Match by Color (support ObjectId string, populated colorId.name, or color.name)
  if (requestedColor) {
    const byColor = product.variants.find((variant) => {
      const colorName = String(variant?.color?.name || variant?.color || "")
        .trim()
        .toLowerCase();
      if (colorName && colorName === requestedColor) return true;

      if (variant?.colorId && typeof variant.colorId === "object") {
        const cIdName = String(variant.colorId.name || "")
          .trim()
          .toLowerCase();
        if (cIdName && cIdName === requestedColor) return true;
      }

      const cIdStr = String(variant?.colorId?._id || variant?.colorId || "")
        .trim()
        .toLowerCase();
      if (cIdStr && cIdStr === requestedColor) return true;

      return false;
    });
    if (byColor) return byColor;
  }

  // 4. Fallback to size: Prefer variants that have positive stock for the requested size!
  if (requestedSize) {
    const inStockVariant = product.variants.find(
      (variant) =>
        Array.isArray(variant?.sizes) &&
        variant.sizes.some((size) => {
          const sName = String(size?.name || "").trim().toLowerCase();
          return sName === requestedSize && Number(size?.stock) > 0;
        }),
    );
    if (inStockVariant) return inStockVariant;

    const anySizeVariant = product.variants.find(
      (variant) =>
        Array.isArray(variant?.sizes) &&
        variant.sizes.some((size) => {
          const sName = String(size?.name || "").trim().toLowerCase();
          return sName === requestedSize;
        }),
    );
    if (anySizeVariant) return anySizeVariant;
  }

  return null;
};

const getSizeForCartItem = (variant, cartItemLike) => {
  if (!variant || !Array.isArray(variant.sizes) || variant.sizes.length === 0) {
    return null;
  }

  const requestedSize = String(cartItemLike?.size || "")
    .trim()
    .toLowerCase();
  if (!requestedSize) {
    return variant.sizes[0] || null;
  }

  return (
    variant.sizes.find(
      (size) =>
        String(size?.name || "")
          .trim()
          .toLowerCase() === requestedSize,
    ) || null
  );
};

const getAvailableStockForCartItem = (product, cartItemLike) => {
  const variant = getVariantForCartItem(product, cartItemLike);
  const size = getSizeForCartItem(variant, cartItemLike);

  if (variant && size) {
    return Number(size.stock) || 0;
  }

  return Number(product?.stock) || 0;
};

const ensureCartItemStock = (product, cartItemLike, desiredQuantity) => {
  const normalizedDesiredQuantity = normalizeQuantity(desiredQuantity);
  if (normalizedDesiredQuantity <= 0) {
    throw new ErrorResponse("Quantity must be at least 1", 400);
  }

  const availableStock = getAvailableStockForCartItem(product, cartItemLike);
  if (availableStock < normalizedDesiredQuantity) {
    throw new ErrorResponse(`This item only has ${availableStock} left.`, 400);
  }
};

export const getCartByUserIdService = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    model: "Product",
    select: "name mainImage.url category slug stock variants",
    populate: {
      path: "category",
      model: "Category",
      select: "_id name slug",
    },
  });

  if (!cart) {
    const newCart = await Cart.create({ user: userId, items: [] });
    return { success: true, data: newCart };
  }

  // Strip orphan items (product deleted from admin).
  const orphanCount = cart.items.filter((item) => !item.product).length;
  if (orphanCount > 0) {
    cart.items = cart.items.filter((item) => item.product != null);
    cart.abandonmentReminderAttempts =
      sanitizeAbandonmentReminderAttempts(cart);
    await cart.save();
    // Recalculate coupon after orphan strip — cart value changed.
    await tryRecalculateCoupon(cart);
  }

  return { success: true, data: cart };
};

export const addToCartService = async (
  userId,
  productId,
  quantity,
  size,
  color,
  price,
  discountPrice,
  variantImage,
  variantId = null,
) => {
  const normalizedQuantity = normalizeQuantity(quantity);
  const cart = await Cart.findOne({ user: userId });
  const product = await Product.findById(productId).populate(
    "variants.colorId",
  );

  if (!product) {
    throw new ErrorResponse("Product not found", 404);
  }

  if (normalizedQuantity <= 0) {
    throw new ErrorResponse("Quantity must be at least 1", 400);
  }

  if (!cart) {
    ensureCartItemStock(product, { size, color, variantId }, normalizedQuantity);
    const newCart = await Cart.create({
      user: userId,
      items: [
        {
          product: productId,
          variantId,
          quantity: normalizedQuantity,
          size,
          color,
          price,
          discountPrice,
          variantImage,
        },
      ],
    });
    return {
      success: true,
      data: newCart,
    };
  }

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      (variantId && item.variantId ? item.variantId === variantId : true) &&
      item.size === size &&
      item.color === color,
  );

  if (existingItem) {
    const desiredQuantity = existingItem.quantity + normalizedQuantity;
    ensureCartItemStock(product, existingItem, desiredQuantity);
    existingItem.quantity = desiredQuantity;
    existingItem.price = price;
    existingItem.discountPrice = discountPrice;
    existingItem.variantImage = variantImage;
    if (variantId && !existingItem.variantId) {
      existingItem.variantId = variantId;
    }
  } else {
    ensureCartItemStock(product, { size, color, variantId }, normalizedQuantity);
    cart.items.push({
      product: productId,
      variantId,
      quantity: normalizedQuantity,
      size,
      color,
      price,
      discountPrice,
      variantImage,
    });
  }

  cart.abandonmentReminderAttempts = sanitizeAbandonmentReminderAttempts(cart);
  await cart.save();

  // Adding items changes the cart total, so recalculate the abandoned-cart
  // discount to keep the applied amount in sync.
  await tryRecalculateCoupon(cart);

  try {
    await handleUserActivity({ userId, cartId: cart._id, source: "cart_add" });
  } catch (error) {
    logger.error(
      { userId, cartId: cart._id?.toString?.(), error: error.message },
      "[Cart] Failed to register cart add activity",
    );
  }
  return {
    success: true,
    data: cart,
  };
};

export const removeFromCartService = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ErrorResponse("Cart not found", 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId,
  );

  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1);
    cart.abandonmentReminderAttempts =
      sanitizeAbandonmentReminderAttempts(cart);
    await cart.save();

    // Removing an item changes the cart total, so recalculate the discount.
    await tryRecalculateCoupon(cart);

    try {
      await handleUserActivity({
        userId,
        cartId: cart._id,
        source: "cart_remove",
      });
    } catch (error) {
      logger.error(
        { userId, cartId: cart._id?.toString?.(), error: error.message },
        "[Cart] Failed to register cart remove activity",
      );
    }
    return {
      success: true,
      data: cart,
      message: "Item removed from cart successfully",
    };
  } else {
    throw new ErrorResponse("Item not found in cart", 404);
  }
};

export const updateCartItemQuantityService = async (
  userId,
  itemId,
  newQuantity,
) => {
  const normalizedQuantity = normalizeQuantity(newQuantity);
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ErrorResponse("Cart not found", 404);
  }

  const itemToUpdate = cart.items.find(
    (item) => item._id.toString() === itemId,
  );

  if (!itemToUpdate) {
    throw new ErrorResponse("Item not found in cart", 404);
  }

  if (normalizedQuantity <= 0) {
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  } else {
    const product = await Product.findById(itemToUpdate.product).populate(
      "variants.colorId",
    );
    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    ensureCartItemStock(product, itemToUpdate, normalizedQuantity);
    itemToUpdate.quantity = normalizedQuantity;
  }

  cart.abandonmentReminderAttempts = sanitizeAbandonmentReminderAttempts(cart);
  await cart.save();

  // Quantity change affects cart total — recalculate discount.
  await tryRecalculateCoupon(cart);

  try {
    await handleUserActivity({
      userId,
      cartId: cart._id,
      source: "cart_update",
    });
  } catch (error) {
    logger.error(
      { userId, cartId: cart._id?.toString?.(), error: error.message },
      "[Cart] Failed to register cart update activity",
    );
  }
  return {
    success: true,
    data: cart,
    message: "Cart item quantity updated successfully",
  };
};

export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ErrorResponse("Cart not found", 404);
  }

  cart.items = [];
  // Clearing the cart zeros the discount and clears the applied coupon —
  // no point keeping it when the cart is empty.
  cart.appliedAbandonedCoupon = null;
  cart.abandonmentReminderAttempts = sanitizeAbandonmentReminderAttempts(cart);
  await cart.save();

  try {
    await handleUserActivity({
      userId,
      cartId: cart._id,
      source: "cart_clear",
    });
  } catch (error) {
    logger.error(
      { userId, cartId: cart._id?.toString?.(), error: error.message },
      "[Cart] Failed to register cart clear activity",
    );
  }

  return {
    success: true,
    message: "Cart cleared successfully",
  };
};

export const mergeGuestCartService = async (userId, guestItems) => {
  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    return { success: true, message: "Nothing to merge" };
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  for (const guestItem of guestItems) {
    const {
      productId,
      quantity,
      size,
      color,
      price,
      discountPrice,
      variantImage,
    } = guestItem;
    const normalizedQuantity = normalizeQuantity(quantity);
    const product = await Product.findById(productId);

    if (!product) {
      continue;
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color,
    );

    if (existingItem) {
      const desiredQuantity = existingItem.quantity + normalizedQuantity;
      ensureCartItemStock(product, existingItem, desiredQuantity);
      existingItem.quantity = desiredQuantity;
      existingItem.price = price;
      existingItem.discountPrice = discountPrice;
      if (variantImage) existingItem.variantImage = variantImage;
    } else {
      ensureCartItemStock(product, { size, color }, normalizedQuantity);
      cart.items.push({
        product: productId,
        quantity: normalizedQuantity,
        size,
        color,
        price,
        discountPrice,
        variantImage,
      });
    }
  }

  cart.abandonmentReminderAttempts = sanitizeAbandonmentReminderAttempts(cart);
  await cart.save();

  // Merging adds items — re-enforce the cap.
  await tryRecalculateCoupon(cart);

  try {
    await handleUserActivity({
      userId,
      cartId: cart._id,
      source: "cart_merge",
    });
  } catch (error) {
    logger.error(
      { userId, cartId: cart._id?.toString?.(), error: error.message },
      "[Cart] Failed to register cart merge activity",
    );
  }
  return {
    success: true,
    data: cart,
    message: "Guest cart merged successfully",
  };
};
