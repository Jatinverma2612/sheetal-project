import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CartItem } from "../../hooks/useCart";
import { getApiImageUrl } from "../../services/api";
import { buildProductHref } from "../../utils/productRoutes";

// Looser type to support both cart items and buy-now items
type DisplayItem = CartItem | {
  product: {
    _id: string;
    name: string;
    mainImage?: { url: string };
    slug?: string;
    sku?: string;
  };
  size: string;
  color: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  variantImage?: string;
  _id?: string;
};

interface MiniCartSummaryProps {
  cartItems: DisplayItem[];
}

const MiniCartSummary: React.FC<MiniCartSummaryProps> = ({ cartItems }) => {
  return (
    <div className="p-4 mb-4">
      <h3 className="text-md font-semibold mb-3 border-b border-gray-200 pb-2">
        Order Summary
      </h3>
      <div className="space-y-4">
        {cartItems.map((item, idx) => {
          const imageUrl = getApiImageUrl(
            item.variantImage || item.product.mainImage?.url,
          );
          const price = (item.discountPrice || item.price || 0).toFixed(2);
          const productHref = buildProductHref(item.product);

          return (
            <div key={item._id ?? idx} className="flex gap-3">
              <div className="w-16 h-20 shrink-0 relative">
                <Image
                  src={imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                {item.product.slug ? (
                  <Link
                    href={productHref}
                    className="text-sm text-gray-800 hover:text-[#bd9951] line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {item.product.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Qty: {item.quantity} | {item.size} | {item.color}
                </p>
                <p className="text-sm font-semibold mt-1">₹{price}</p>
              </div>
            </div>
          );
        })}
        {cartItems.length === 0 && (
          <p className="text-sm text-gray-500">No items in cart.</p>
        )}
      </div>
    </div>
  );
};

export default MiniCartSummary;
