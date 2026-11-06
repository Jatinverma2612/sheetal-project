"use client";

import React from "react";
import { CreditCard } from "lucide-react";

const CardsPage = () => {
  return (
    <div className="w-full max-w-2xl px-4 py-2 sm:px-0">
      <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 font-[family-name:var(--font-optima)]">
        Saved Cards
      </h4>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f8f5ee] flex items-center justify-center text-[#bd9951] mb-4">
          <CreditCard className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h5 className="text-lg font-semibold text-gray-800 mb-2">
          No Saved Cards
        </h5>
        <p className="text-sm text-gray-500 max-w-sm">
          You don&apos;t have any saved cards yet. For your security, card details can be saved during your next checkout.
        </p>
      </div>
    </div>
  );
};

export default CardsPage;
