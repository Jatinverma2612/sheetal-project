"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront Root Layout Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-[#fafaf8]">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#6a3f0e] mb-4">
            Application Error
          </h1>
          <h2 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
            An unexpected error occurred
          </h2>
          <p className="text-gray-500 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
            We apologize for the inconvenience. Please reload the page or click below to retry.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="cursor-pointer rounded border border-[#bd9951] bg-[#bd9951] px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a38547]"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-block rounded border border-gray-300 bg-white px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-700 transition-colors hover:bg-gray-50"
            >
              Return to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

