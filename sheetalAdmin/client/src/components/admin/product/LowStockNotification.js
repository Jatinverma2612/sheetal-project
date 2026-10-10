"use client";

import React, { useState, useEffect, useRef } from "react";
import { getLowStockProducts } from "@/services/productService";
import { AlertTriangle, X } from "lucide-react";
import { useProductModal } from "@/hooks/useProductModal";
import { useRouter, usePathname } from "next/navigation";

const LowStockNotification = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const { openModal } = useProductModal();
  const router = useRouter();
  const pathname = usePathname();

  const handleProductClick = (productId) => {
    openModal(productId);
    setIsOpen(false);
    // Navigate to products page if not already there
    if (!pathname.includes("/products")) {
      router.push("/admin/products");
    }
  };

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const res = await getLowStockProducts();
        if (res.success) {
          setLowStockProducts(res.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLowStockProducts();
  }, []);

  if (loading || lowStockProducts.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="relative cursor-pointer bg-amber-500 text-white p-3 rounded-full shadow-lg hover:bg-amber-600"
      >
        <AlertTriangle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {lowStockProducts.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-50 mt-3 w-[420px] bg-white rounded-xl shadow-2xl border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-slate-800">Low Stock</p>
            <button className="cursor-pointer" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="p-4 border-b last:border-b-0">
                <button
                  onClick={() => handleProductClick(product._id)}
                  className="w-full text-left p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {product.mainImage?.url ? (
                      <img
                        src={product.mainImage.url}
                        alt={product.mainImage.alt || product.name}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 border">
                        No image
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-slate-900">
                          {product.name}
                        </p>
                        <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Alert ≤ {product.lowStockThreshold ?? 5}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {product.lowStockVariants.flatMap((variant) =>
                          variant.sizes.map((size) => (
                            <div
                              key={`${variant.v_sku}-${size.name}`}
                              className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"
                            >
                              <div className="text-slate-600">
                                <span className="font-medium text-slate-800">
                                  {size.name}
                                </span>
                                {" • "}
                                {variant.color}
                                {" • "}
                                {variant.v_sku}
                              </div>

                              <span
                                className={`font-semibold ${
                                  size.stock <=
                                  Math.ceil(
                                    (product.lowStockThreshold ?? 5) / 2,
                                  )
                                    ? "text-red-600"
                                    : "text-amber-700"
                                }`}
                              >
                                {size.stock}
                              </span>
                            </div>
                          )),
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockNotification;
