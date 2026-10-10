import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  SizeChartData,
  getHowToMeasureImageUrl,
} from "../../services/sizeChartService";

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColor: string;
  colorToAvailableSizesMap: { [colorName: string]: string[] };
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  sizeChartData: SizeChartData | null;
  onAddToCart: () => Promise<void>;
  onAddToWishlist: () => void;
  isWishlisted: boolean;
}

const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  selectedColor,
  colorToAvailableSizesMap,
  selectedSize,
  setSelectedSize,
  sizeChartData,
  onAddToCart,
  onAddToWishlist,
  isWishlisted,
}) => {
  const [activeTab, setActiveTab] = useState<"sizechart" | "measure">("sizechart");
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }
    const timer = setTimeout(() => setShouldRender(false), 320);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!shouldRender) return null;
  if (!sizeChartData) return null;

  const headers =
    Array.isArray(sizeChartData.headers) && sizeChartData.headers.length > 0
      ? sizeChartData.headers
      : ["Size", "Bust", "Waist"];

  const convertToCm = (inches: string | number) => {
    if (typeof inches === "string") {
      const parts = inches.split("-").map((s) => parseFloat(s.trim()));
      if (parts.some(isNaN)) return "-";
      return parts.map((val) => (val * 2.54).toFixed(1)).join(" - ");
    } else if (typeof inches === "number") {
      return (inches * 2.54).toFixed(1);
    }
    return "-";
  };

  const availableSizesForSelectedColor = colorToAvailableSizesMap[selectedColor] || [];

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await onAddToCart();
      onClose();
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-white ${
          isOpen ? "animate-slide-in-right" : "animate-slide-out-right"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 hover:text-gray-800 text-2xl z-10 border px-2 cursor-pointer"
        >
          ×
        </button>

        <div className="p-8">
          <h3 className="text-4xl text-[#bd9951] font-medium mb-2 font-[family-name:var(--font-optima)] text-center">
            Size Chart
          </h3>
          <p className="text-center mb-6 text-lg">
            Our Sizes fit the best for mentioned body measurements (not garment
            measurements)* Tip: SBS sizes are to fit Indian Body.
          </p>

          {/* Tabs */}
          <div className="flex justify-center mb-6 border-b border-t border-gray-200">
            <button
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                activeTab === "sizechart"
                  ? "border-[#fe5722] text-[#fe5722]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("sizechart")}
            >
              Size Chart
            </button>
            <button
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                activeTab === "measure"
                  ? "border-[#fe5722] text-[#fe5722]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("measure")}
            >
              How to Measure
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="flex justify-end mb-4">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setUnit("in")}
                className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                  unit === "in" ? "bg-orange-500 text-white" : "bg-white text-gray-700"
                } border border-gray-300 focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              >
                IN
              </button>
              <button
                onClick={() => setUnit("cm")}
                className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                  unit === "cm" ? "bg-orange-500 text-white" : "bg-white text-gray-700"
                } border border-gray-300 focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              >
                CM
              </button>
            </div>
          </div>

          {/* Size Chart Tab */}
          {activeTab === "sizechart" && (
            <div className="animate-fade-in">
              {!selectedColor ? (
                <p className="text-center text-red-500">
                  Please select a color first to see available sizes.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-white text-gray-800 font-bold border-b border-gray-200">
                        <th className="p-3"></th>
                        {headers.map((header, index) => (
                          <th key={`${header}-${index}`} className="p-3">
                            {header}
                            {index > 0 ? ` (${unit})` : ""}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartData.table.map((row: any, idx: number) => {
                        const sizeLabel = String(row?.cells?.[0] || row?.label || "");
                        const rowCells = Array.isArray(row?.cells)
                          ? row.cells
                          : [
                              row?.label || "",
                              row?.bust || "",
                              row?.waist || "",
                              row?.hip || "",
                              row?.shoulder || "",
                              row?.length || "",
                            ];
                        const isAvailable = availableSizesForSelectedColor.includes(sizeLabel);
                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-gray-50 border-b border-gray-100 last:border-0 ${!isAvailable ? "opacity-50" : ""}`}
                          >
                            <td className="p-3">
                              <input
                                type="radio"
                                name="size"
                                value={sizeLabel}
                                checked={selectedSize === sizeLabel}
                                onChange={() => setSelectedSize(sizeLabel)}
                                className="form-radio h-4 w-4 text-orange-600 cursor-pointer"
                                disabled={!isAvailable}
                              />
                            </td>
                            {headers.map((header, cellIndex) => (
                              <td
                                key={`${header}-${cellIndex}`}
                                className={`p-3 ${cellIndex === 0 ? "font-bold text-gray-700" : "text-gray-600"}`}
                              >
                                {cellIndex === 0
                                  ? rowCells[cellIndex] || "-"
                                  : unit === "in"
                                    ? rowCells[cellIndex] || "-"
                                    : convertToCm(rowCells[cellIndex] || "-")}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* How to Measure Tab */}
          {activeTab === "measure" && (
            <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
              <div className="relative w-full h-76">
                <Image
                  src={getHowToMeasureImageUrl(sizeChartData.howToMeasureImage)}
                  alt="How to Measure"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 flex flex-col items-center border-t border-gray-100">
          <p className="mb-3 text-gray-700 text-center">
            *Select your perfect size from the chart above*
          </p>
          {!selectedSize && (
            <p className="text-xs text-red-500 mb-2">
              Please select a size using the radio buttons above
            </p>
          )}
          <div className="flex space-x-4 w-full justify-center max-w-md">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || isAddingToCart}
              className="flex-1 bg-orange-500 text-white font-semibold py-3 px-4 hover:bg-orange-600 transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={() => {
                onAddToWishlist();
                onClose();
              }}
              className="flex-1 border font-semibold py-3 px-4 transition-colors cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              {isWishlisted ? "Wishlisted ♥" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
