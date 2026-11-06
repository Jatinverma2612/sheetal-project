"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center font-[family-name:var(--font-montserrat)]">
      <h1 className="text-4xl sm:text-5xl font-bold text-[#6a3f0e] font-[family-name:var(--font-optima)] mb-4">
        Something Went Wrong
      </h1>
      <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
        We encountered an unexpected issue
      </h2>
      <p className="text-gray-500 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        An error occurred while loading this page. Please try again or return to the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="cursor-pointer rounded border border-[#bd9951] bg-[#bd9951] px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a38547]"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-block rounded border border-gray-300 bg-white px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

