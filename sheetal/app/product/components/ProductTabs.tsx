import React from "react";
import { sanitizeProductRichText } from "../../utils/productRichTextSanitizer";

interface ProductTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  description: string;
  materialCare: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  activeTab,
  setActiveTab,
  description,
  materialCare,
}) => {
  const sanitizedDescription = sanitizeProductRichText(description);
  const sanitizedMaterialCare = sanitizeProductRichText(materialCare);

  return (
    <div className="product-tabs border-[#fe5722] border-b mt-8">
      <div className="flex justify-center mb-8 border-y border-[#ff5722]">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-8 py-2 font-bold tracking-wide text-[16px] uppercase border-b-2 transition-colors cursor-pointer ${activeTab === "description" ? "border-[#fe5722] text-white bg-[#fe5722]" : "border-transparent text-black hover:text-black"}`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("material")}
          className={`px-8 py-2 font-bold tracking-wide text-[16px] uppercase border-b-2 transition-colors cursor-pointer ${activeTab === "material" ? "border-[#fe5722] text-white bg-[#fe5722]" : "border-transparent text-black hover:text-black"}`}
        >
          Material & Care
        </button>
      </div>
      <div className="container mx-auto px-4">
        <div className="max-w-full mx-auto leading-relaxed min-h-[200px] py-8">
          {activeTab === "description" && (
            <div
              className="prose prose-strong:font-semibold prose-headings:text-gray-900 max-w-none animate-fade-in text-gray-900"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          )}
          {activeTab === "material" && (
            <div
              className="prose prose-strong:font-semibold prose-headings:text-gray-900 max-w-none animate-fade-in text-gray-900"
              dangerouslySetInnerHTML={{ __html: sanitizedMaterialCare }}
            />
          )}
        </div>
      </div>
      <style jsx>{`
        /* Custom styles for Tiptap editor output to ensure correct rendering */
        .product-tabs :global(.prose) {
          color: #111827;
        }
        .product-tabs :global(.prose p) {
          margin-bottom: 1em; /* Add space between paragraphs */
        }
        .product-tabs :global(.prose ul) {
          list-style-type: disc; /* Ensure bullet points are discs */
          padding-left: 1.5em; /* Indent bullet points */
          margin-bottom: 1em;
        }
        .product-tabs :global(.prose ol) {
          list-style-type: decimal; /* Ensure ordered list markers are decimals */
          padding-left: 1.5em; /* Indent ordered list items */
          margin-bottom: 1em;
        }
        .product-tabs :global(.prose li::marker) {
          color: #111827;
          font-weight: 700;
        }
        .product-tabs :global(.prose li) {
          margin-bottom: 0.5em; /* Space between list items */
          color: #111827;
        }
        .product-tabs :global(.prose li p) {
          margin-bottom: 0; /* Remove extra margin from paragraphs inside list items */
        }
        .product-tabs :global(.prose strong),
        .product-tabs :global(.prose b) {
          color: #111827;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ProductTabs;
