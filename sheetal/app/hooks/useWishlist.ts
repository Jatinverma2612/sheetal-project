"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  fetchWishlist,
  toggleWishlist as toggleWishlistApi,
  mergeGuestWishlist,
  fetchProducts,
  Product,
} from "../services/productService";
import {
  isAuthenticated,
  logout,
  isAuthExpiredError,
  AUTH_UPDATED_EVENT,
} from "../services/authService";
import {
  dispatchWishlistUpdated,
  WISHLIST_UPDATED_EVENT,
} from "./shopEvents";
import {
  redirectToLogin,
} from "../utils/authRedirect";

export const GUEST_WISHLIST_KEY = "guest_wishlist";

export const readGuestWishlist = (): Product[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeGuestWishlist = (items: Product[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
};

export const clearGuestWishlist = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_WISHLIST_KEY);
};

let isMergingGuestWishlist = false;

/**
 * Merges localStorage guest wishlist into the authenticated user's server wishlist.
 * Called immediately after a successful login.
 */
export const mergeGuestWishlistOnLogin = async (): Promise<void> => {
  if (isMergingGuestWishlist) return;
  const guestItems = readGuestWishlist();
  if (guestItems.length === 0) return;

  isMergingGuestWishlist = true;
  try {
    const productIds = guestItems
      .map((p) => (typeof p === "string" ? p : p?._id))
      .filter(Boolean);

    if (productIds.length > 0) {
      const res = await mergeGuestWishlist(productIds);
      if (res?.success) {
        clearGuestWishlist();
      }
    }
  } catch (err) {
    console.error("Failed to merge guest wishlist:", err);
  } finally {
    isMergingGuestWishlist = false;
    dispatchWishlistUpdated();
  }
};

export interface UseWishlistReturn {
  wishlist: Product[];
  loading: boolean;
  error: string | null;
  toggleProductInWishlist: (productId: string, productData?: Product) => Promise<void>;
  isProductInWishlist: (productId: string) => boolean;
  isLoginModalOpen: boolean;
  closeLoginModal: () => void;
  handleLoginRedirect: () => void;
}

type ErrorLike = {
  response?: { status?: number };
  status?: number;
  message?: string;
  unauthorized?: boolean;
};

/** Detects 401-style errors from axios, fetch, or plain Error messages */
const isUnauthorized = (err: ErrorLike): boolean =>
  err?.unauthorized === true ||
  err?.response?.status === 401 ||
  err?.status === 401 ||
  isAuthExpiredError(err?.message, err?.status || err?.response?.status);

let cachedWishlistSnapshot: Product[] | null = null;

const getInitialWishlistSnapshot = (): Product[] => {
  if (cachedWishlistSnapshot) return cachedWishlistSnapshot;
  if (typeof window === "undefined") return [];
  return isAuthenticated() ? [] : readGuestWishlist();
};

const commitWishlistSnapshot = (items: Product[]): Product[] => {
  cachedWishlistSnapshot = items;
  return items;
};

export const useWishlist = (): UseWishlistReturn => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Product[]>(() => getInitialWishlistSnapshot());
  const [optimisticWishlistIds, setOptimisticWishlistIds] = useState<Set<string>>(() => {
    const initial = getInitialWishlistSnapshot();
    return new Set(
      initial.map((p) => (typeof p === "string" ? p : p?._id)).filter(Boolean),
    );
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync optimistic set with actual wishlist whenever it changes
  useEffect(() => {
    setOptimisticWishlistIds(
      new Set(
        wishlist
          .map((p) => (typeof p === "string" ? p : p?._id))
          .filter(Boolean),
      ),
    );
  }, [wishlist]);

  const loadWishlist = useCallback(async (showLoader: boolean = true) => {
    if (!isAuthenticated()) {
      const rawGuest = readGuestWishlist();
      const productIds = rawGuest
        .map((p) => (typeof p === "string" ? p : p?._id))
        .filter(Boolean);

      if (productIds.length === 0) {
        setWishlist(commitWishlistSnapshot([]));
        if (showLoader) setLoading(false);
        return;
      }

      // Check if any guest items need hydration from server
      const needsHydration = rawGuest.some(
        (p) =>
          !p ||
          typeof p === "string" ||
          !p.name ||
          p.name === "Product" ||
          !Array.isArray(p.variants) ||
          p.variants.length === 0 ||
          !p.mainImage?.url,
      );

      if (needsHydration) {
        if (showLoader) setLoading(true);
        try {
          const response = await fetchProducts({
            ids: productIds.join(","),
            limit: 100,
          });

          if (
            response?.success &&
            Array.isArray(response.products) &&
            response.products.length > 0
          ) {
            const productMap = new Map(
              response.products.map((p) => [String(p._id), p]),
            );
            const hydrated = productIds
              .map((id) => productMap.get(String(id)))
              .filter(Boolean) as Product[];

            if (hydrated.length > 0) {
              writeGuestWishlist(hydrated);
              setWishlist(commitWishlistSnapshot(hydrated));
              if (showLoader) setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("Failed to hydrate guest wishlist products:", err);
        }
      }

      setWishlist(commitWishlistSnapshot(rawGuest));
      if (showLoader) setLoading(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetchWishlist();
      if (response.success && Array.isArray(response.data)) {
        setWishlist(commitWishlistSnapshot(response.data));

        // Auto-merge guest items if any were left in localStorage
        const guestItems = readGuestWishlist();
        if (guestItems.length > 0) {
          void mergeGuestWishlistOnLogin();
        }
      } else {
        setWishlist(commitWishlistSnapshot([]));
      }
    } catch (err: unknown) {
      const error = err as ErrorLike;
      if (isUnauthorized(error)) {
        setWishlist(commitWishlistSnapshot([]));
      } else {
        console.error("Error loading wishlist:", err);
        setError(error.message || "An error occurred while fetching wishlist");
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  useEffect(() => {
    const handleWishlistUpdated = () => {
      loadWishlist(false);
    };
    const handleAuthUpdated = () => {
      loadWishlist(false);
    };

    window.addEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdated);
    window.addEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);

    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdated);
      window.removeEventListener(AUTH_UPDATED_EVENT, handleAuthUpdated);
    };
  }, [loadWishlist]);

  const toggleProductInWishlist = useCallback(
    async (productId: string, productData?: Product) => {
      if (!isAuthenticated()) {
        const guestItems = readGuestWishlist();
        const exists = guestItems.some(
          (p) => String(typeof p === "string" ? p : p?._id) === String(productId),
        );

        if (exists) {
          const updated = guestItems.filter(
            (p) => String(typeof p === "string" ? p : p?._id) !== String(productId),
          );
          writeGuestWishlist(updated);
          setWishlist(commitWishlistSnapshot(updated));
          dispatchWishlistUpdated();
          toast.success("Removed from wishlist");
          return;
        }

        // Check if passed productData is complete
        const hasFullData =
          productData &&
          productData.name &&
          productData.name !== "Product" &&
          Array.isArray(productData.variants) &&
          productData.variants.length > 0 &&
          Boolean(productData.mainImage?.url || (productData as any).image);

        if (hasFullData) {
          const updated = [...guestItems, productData!];
          writeGuestWishlist(updated);
          setWishlist(commitWishlistSnapshot(updated));
          dispatchWishlistUpdated();
          toast.success("Added to wishlist!");
          return;
        }

        // Optimistically show added toast & update IDs
        toast.success("Added to wishlist!");
        setOptimisticWishlistIds((prev) => new Set(prev).add(productId));

        // Fetch full product details from API
        try {
          const response = await fetchProducts({ ids: productId, limit: 1 });
          const fetchedProduct =
            response?.success && Array.isArray(response.products) && response.products.length > 0
              ? response.products[0]
              : null;

          const currentList = readGuestWishlist().filter(
            (p) => String(typeof p === "string" ? p : p?._id) !== String(productId),
          );

          if (fetchedProduct) {
            const updated = [...currentList, fetchedProduct];
            writeGuestWishlist(updated);
            setWishlist(commitWishlistSnapshot(updated));
            dispatchWishlistUpdated();
          } else {
            const fallback: Product =
              productData ||
              ({
                _id: productId,
                name: "Product",
                slug: "",
                variants: [],
              } as unknown as Product);
            const updated = [...currentList, fallback];
            writeGuestWishlist(updated);
            setWishlist(commitWishlistSnapshot(updated));
            dispatchWishlistUpdated();
          }
        } catch (fetchErr) {
          console.error("Failed to fetch product for guest wishlist:", fetchErr);
          const fallback: Product =
            productData ||
            ({
              _id: productId,
              name: "Product",
              slug: "",
              variants: [],
            } as unknown as Product);
          const currentList = readGuestWishlist().filter(
            (p) => String(typeof p === "string" ? p : p?._id) !== String(productId),
          );
          const updated = [...currentList, fallback];
          writeGuestWishlist(updated);
          setWishlist(commitWishlistSnapshot(updated));
          dispatchWishlistUpdated();
        }
        return;
      }

      const isCurrentlyInWishlist = optimisticWishlistIds.has(productId);

      // Optimistically update set
      setOptimisticWishlistIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyInWishlist) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        const response = await toggleWishlistApi(productId);
        if (response.success) {
          await loadWishlist(false);
          dispatchWishlistUpdated();
          toast.success(response.message || "Wishlist updated!");
        } else {
          setOptimisticWishlistIds((prev) => {
            const next = new Set(prev);
            if (isCurrentlyInWishlist) next.add(productId);
            else next.delete(productId);
            return next;
          });

          if (isUnauthorized(response as ErrorLike)) {
            logout();
            return;
          }
          toast.error(response.message || "Failed to update wishlist.");
        }
      } catch (err: unknown) {
        setOptimisticWishlistIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyInWishlist) next.add(productId);
          else next.delete(productId);
          return next;
        });

        const error = err as ErrorLike;
        if (isUnauthorized(error)) {
          logout();
          return;
        }
        toast.error("Could not update wishlist. Please try again.");
      }
    },
    [optimisticWishlistIds, loadWishlist],
  );

  const isProductInWishlist = useCallback(
    (productId: string) => optimisticWishlistIds.has(productId),
    [optimisticWishlistIds],
  );

  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const handleLoginRedirect = useCallback(() => {
    setIsLoginModalOpen(false);
    if (typeof window !== "undefined") {
      redirectToLogin(router, undefined, {
        modals: {
          wishlistLoginModalOpen: true,
        },
      });
    }
  }, [router]);

  return {
    wishlist,
    loading,
    error,
    toggleProductInWishlist,
    isProductInWishlist,
    isLoginModalOpen,
    closeLoginModal,
    handleLoginRedirect,
  };
};
