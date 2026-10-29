"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WishlistContent from "./components/WishlistContent";
import { isAuthenticated } from "../services/authService";
import { redirectToLogin } from "../utils/authRedirect";
import StorefrontLoadingShell from "../components/StorefrontLoadingShell";

const WishlistPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      redirectToLogin(router, "/wishlist");
    }
  }, [mounted, router, isLoggedIn]);

  if (!mounted || !isLoggedIn) {
    return <StorefrontLoadingShell message={!mounted ? "Loading wishlist..." : "Redirecting to login..."} />;
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
