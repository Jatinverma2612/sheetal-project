"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Filter } from "lucide-react";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";

export default function FiltersBar({ onApply }) {
  const [filters, setFilters] = useState({
    category: "all",
    product: "allProducts",
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories(1, 100, "");
        if (res.success) setCategories(res.data.categories);
      } catch (err) {
        console.log("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setFilters((prev) => ({ ...prev, product: "" }));
      try {
        const response = await getProducts();
        if (filters.category === "all") {
          const products = response.products;
          setProducts(products);
        } else {
          const products = response.products.filter(
            (item) => item.category?._id === filters.category,
          );
          setProducts(products);
        }
      } catch (err) {
        console.log("Failed to fetch products", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [filters.category]);

  const handleApply = () => {
    const selectedCategory =
      filters.category === "all" || filters.category === ""
        ? null
        : (categories.find((cat) => cat._id === filters.category) ?? null);

    const selectedProduct =
      filters.product === "allProducts" || filters.product === ""
        ? null
        : (products.find((p) => p._id === filters.product) ?? null);

    onApply?.({
      ...filters,
      categoryObject: selectedCategory,
      productObject: selectedProduct,
    });
  };

  const selectClass =
    "form-select text-slate-900 border-2 w-full px-4 py-2.5 bg-slate-50 border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-primary";
  const labelClass = "text-slate-700 text-sm font-bold";

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Category */}
        <div className="flex-1 flex-col gap-2">
          <label className={labelClass}>Category</label>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className={selectClass}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div className="flex-2 flex-col gap-2">
          <label className={labelClass}>Product</label>
          <select
            value={filters.product}
            onChange={(e) =>
              setFilters({ ...filters, product: e.target.value })
            }
            disabled={loadingProducts}
            className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="all">
              {loadingProducts ? "Loading..." : "All Products"}
            </option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Apply */}
        <button
          onClick={handleApply}
          className="bg-slate-900 flex-3 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer h-[42px]"
        >
          <Filter size={16} />
          Apply Filters
        </button>
      </div>
    </div>
  );
}
