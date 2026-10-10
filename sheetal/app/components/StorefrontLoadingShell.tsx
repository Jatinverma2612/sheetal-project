"use client";

import React from "react";

interface StorefrontLoadingShellProps {
  message?: string;
}

const StorefrontLoadingShell: React.FC<StorefrontLoadingShellProps> = ({
  message = "Loading...",
}) => {
  return (
    <main className="flex min-h-[40vh] items-center justify-center bg-white px-4 py-16 md:py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#bd9951] animate-spin" />
          <p className="text-sm md:text-base text-gray-500 tracking-wide">
            {message}
          </p>
        </div>
    </main>
  );
};

export default StorefrontLoadingShell;
