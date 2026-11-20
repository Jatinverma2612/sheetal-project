"use client";
import React, { Suspense, useEffect, useState } from "react";
import WishlistContent from "./components/WishlistContent";
import StorefrontLoadingShell from "../components/StorefrontLoadingShell";

const WishlistPage = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <StorefrontLoadingShell message="Loading wishlist..." />;
  }

  return (
    <Suspense
      fallback={<StorefrontLoadingShell message="Loading wishlist..." />}
    >
      <WishlistContent />
    </Suspense>
  );
};

export default WishlistPage;
