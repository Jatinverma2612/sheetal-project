"use client";
import {
  X,
  Package,
  Tag,
  ShieldCheck,
  IndianRupee,
  Info,
  Layers,
  ListChecks,
  FileText,
  CheckCircle2,
  Boxes,
  BadgePercent,
  Ruler,
} from "lucide-react";
import { sanitizeProductRichText } from "@/utils/productRichTextSanitizer";

export default function ViewProductDrawer({ isOpen, onClose, product }) {
  if (!product) return null;

  const sanitizedDescription = sanitizeProductRichText(product.description);

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-slate-50 z-[160] shadow-2xl transform transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none uppercase tracking-tight">
                {product.name}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                SKU: {product.sku || "NOT-SET"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-rose-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-80px)] scrollbar-thin">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-4 aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <img
                src={product.images?.[0]?.url}
                className="w-full h-full object-cover"
                alt="Main"
              />
            </div>
            {product.images?.slice(1).map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover"
                  alt={`Gallery ${idx}`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                Selling Price
              </p>
              <div className="flex items-center justify-center text-blue-600 font-black text-lg">
                <IndianRupee size={16} />{" "}
                {product.discountPrice?.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                MRP
              </p>
              <div className="text-slate-400 font-bold text-lg line-through">
                ₹{product.price?.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                Total Stock
              </p>
              <div
                className={`text-lg font-black ${product.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {product.stock}{" "}
                <span className="text-[10px] uppercase">Units</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Category
                </span>
              </div>
              <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase italic">
                {product.category?.name || "Uncategorized"}
              </span>
            </div>
            {product.subCategory && (
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    Sub Category
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase">
                  {product.subCategory}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Featured / Deal
                </span>
              </div>
              <div className="flex gap-2">
                {product.isFeatured && (
                  <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    Featured
                  </span>
                )}
                {product.isDealOfTheDay && (
                  <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    Deal
                  </span>
                )}
              </div>
            </div>
          </div>

          {product.keyBenefits?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Key
                Highlights
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {product.keyBenefits.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-bold text-slate-600">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.variants?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Boxes size={16} className="text-blue-500" /> Inventory Variants
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border border-slate-300"
                        style={{ backgroundColor: v.color }}
                      />
                      <span className="text-xs font-black text-slate-800 uppercase">
                        {v.size}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">
                      {v.stock} pcs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pb-10">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-slate-500" /> Detailed
              Description
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div
                className="prose prose-sm max-w-full text-slate-600 text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
