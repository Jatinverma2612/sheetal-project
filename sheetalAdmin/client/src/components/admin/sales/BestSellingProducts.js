import Image from "next/image";
import { Package, ArrowRight } from "lucide-react";
import Link from "next/link";

function SkeletonRow() {
  return (
    <tr>
      <td className="py-4 px-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
          <div className="h-3 w-28 bg-slate-100 rounded-full animate-pulse" />
        </div>
      </td>
      <td className="py-4 px-3">
        <div className="h-3 w-10 bg-slate-100 rounded-full animate-pulse" />
      </td>
      <td className="py-4 px-3">
        <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse ml-auto" />
      </td>
    </tr>
  );
}

export default function BestSellingProducts({
  products = [],
  isLoading = false,
  error = null,
}) {
  const visibleProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product &&
          product.productId &&
          product.name &&
          product.totalRevenue != null,
      )
    : [];

  const maxRevenue = visibleProducts.length
    ? Math.max(...visibleProducts.map((p) => p.totalRevenue))
    : 1;

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@500&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#818cf8,#4f46e5)",
                boxShadow: "0 0 8px rgba(99,102,241,0.6)",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#6366f1",
                textTransform: "uppercase",
              }}
            >
              Top Performers
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
            Best Selling Products
          </h3>
        </div>
        <Link
          href="/admin/sales-report/best-selling"
          className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          See all Products <ArrowRight size={14} />
        </Link>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3 mb-4 border border-rose-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr
              style={{ fontSize: 9, letterSpacing: "0.12em", color: "#cbd5e1" }}
              className="font-bold border-b border-slate-100"
            >
              <th className="pb-3 px-3 font-bold">PRODUCT</th>
              <th className="pb-3 px-3 font-bold">UNITS SOLD</th>
              <th className="pb-3 px-3 font-bold text-right">REVENUE</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : visibleProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-12 text-center text-sm text-slate-400"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              visibleProducts.map((product, i) => {
                const barWidth = Math.round(
                  (product.totalRevenue / maxRevenue) * 100,
                );
                return (
                  <tr
                    key={product.productId}
                    className="group border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    {/* Product */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        {/* Rank */}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: i < 3 ? "#6366f1" : "#cbd5e1",
                            fontFamily: "'DM Mono', monospace",
                            width: 16,
                            flexShrink: 0,
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        {/* Thumbnail */}
                        <div
                          className="flex-shrink-0 overflow-hidden"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                          }}
                        >
                          {product.image ? (
                            <img
                              src={product.image.replace(/\\/g, "/")}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} color="#cbd5e1" />
                            </div>
                          )}
                        </div>

                        <p
                          className="text-slate-800 font-bold"
                          style={{ fontSize: 13 }}
                        >
                          {product.name}
                        </p>
                      </div>
                    </td>

                    {/* Units sold */}
                    <td className="py-4 px-3">
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {product.unitsSold.toLocaleString()}
                      </span>
                    </td>

                    {/* Revenue + bar */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#4f46e5",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          ₹{product.totalRevenue.toLocaleString()}
                        </span>
                        <div
                          style={{
                            width: 80,
                            height: 3,
                            borderRadius: 99,
                            background: "#f1f5f9",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${barWidth}%`,
                              height: "100%",
                              borderRadius: 99,
                              background:
                                i === 0
                                  ? "linear-gradient(90deg,#818cf8,#4f46e5)"
                                  : "linear-gradient(90deg,#c7d2fe,#a5b4fc)",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
