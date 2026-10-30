import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-[#6a3f0e] font-[family-name:var(--font-optima)] mb-4">
        404
      </h1>
      <h2 className="text-2xl font-medium text-gray-800 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="inline-block rounded border border-[#bd9951] bg-[#bd9951] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a38547]"
      >
        Return to Home
      </Link>
    </div>
  );
}
