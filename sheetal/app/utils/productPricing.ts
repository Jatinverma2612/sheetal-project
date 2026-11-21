/**
 * Central product pricing utility for StudioBySheetal storefront.
 * Standardizes calculation of selling price, MRP, and discount percentage
 * across Product List, Product Detail, Similar Products, Collections, and Recently Viewed.
 */

export interface ProductPriceInfo {
  price: number;
  mrp: number;
  discount: string;
  hasDiscount: boolean;
}

/**
 * Computes standard display prices for any product:
 * - Scans variant sizes for valid, positive selling prices (> 0).
 * - Correctly pairs the lowest selling price with its own regular MRP.
 * - Prevents 0-price or unpriced dummy sizes from skewing the display price.
 * - If no size has a discount, mrp equals price (preventing strike-through ₹0.00).
 */
export function getProductDisplayPrice(product: any): ProductPriceInfo {
  let lowestSellingPrice = Infinity;
  let matchingMrp = Infinity;

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  for (const variant of variants) {
    const sizes = Array.isArray(variant?.sizes) ? variant.sizes : [];
    for (const size of sizes) {
      const regPrice = Number(size?.price) || 0;
      const discPrice = Number(size?.discountPrice) || 0;

      // Real discount exists only if discountPrice > 0 and discountPrice < regPrice
      const isDiscounted = discPrice > 0 && discPrice < regPrice;
      const effective = isDiscounted ? discPrice : regPrice;

      // Only consider positive valid prices (skip dummy/zero prices)
      if (effective > 0 && effective < lowestSellingPrice) {
        lowestSellingPrice = effective;
        matchingMrp = regPrice > 0 ? regPrice : effective;
      }
    }
  }

  // Fallback to top-level price if variants had no valid sizes
  if (lowestSellingPrice === Infinity) {
    const topPrice = Number(product?.price) || 0;
    const topMrp = Number(product?.mrp) || topPrice;
    if (topPrice > 0) {
      lowestSellingPrice = topPrice;
      matchingMrp = topMrp > 0 ? topMrp : topPrice;
    } else {
      lowestSellingPrice = 0;
      matchingMrp = 0;
    }
  }

  const hasDiscount = matchingMrp > 0 && lowestSellingPrice < matchingMrp;
  const discountPercent = hasDiscount
    ? Math.round(((matchingMrp - lowestSellingPrice) / matchingMrp) * 100)
    : 0;

  return {
    price: lowestSellingPrice,
    mrp: matchingMrp > 0 ? matchingMrp : lowestSellingPrice,
    discount: discountPercent > 0 ? `${discountPercent}%` : "",
    hasDiscount,
  };
}
