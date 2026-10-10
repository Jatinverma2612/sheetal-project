"use client";
import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import WishlistContent from "./components/WishlistContent";
import { isAuthenticated } from "../services/authService";
import { redirectToLogin } from "../utils/authRedirect";
import StorefrontLoadingShell from "../components/StorefrontLoadingShell";

const WishlistPage = () => {
  const router = useRouter();
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    if (!isLoggedIn) {
      redirectToLogin(router, "/wishlist");
    }
  }, [router, isLoggedIn]);

  if (!isLoggedIn) {
    return <StorefrontLoadingShell message="Redirecting to login..." />;
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
