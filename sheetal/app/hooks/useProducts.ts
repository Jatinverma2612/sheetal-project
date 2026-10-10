import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchProducts,
  Product,
  ProductQueryParams,
} from "../services/productService";
import { ORDER_CONFIRMED_EVENT } from "./shopEvents";

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  refetch: (params?: ProductQueryParams) => Promise<void>;
}

export const useProducts = (
  initialParams: ProductQueryParams = {},
  enabled: boolean = true,
): UseProductsReturn => {
  const {
    page,
    limit,
    search,
    sort,
    category,
    subCategory,
    brand,
    status,
    color,
  } = initialParams;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const requestIdRef = useRef(0);

  const loadProducts = useCallback(async (params: ProductQueryParams = {}) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProducts(params);
      if (requestId !== requestIdRef.current) return;
      if (response.success) {
        setProducts(response.products);
        setTotalProducts(response.totalProducts);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error(err);
      setError("An error occurred while fetching products");
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      return;
    }

    loadProducts({
      page,
      limit,
      search,
      sort,
      category,
      subCategory,
      brand,
      status,
      color,
    });
    return () => {
      requestIdRef.current += 1;
    };
  }, [
    enabled,
    loadProducts,
    page,
    limit,
    search,
    sort,
    category,
    subCategory,
    brand,
    status,
    color,
  ]);

  useEffect(() => {
    if (
      !enabled ||
      typeof window === "undefined" ||
      ORDER_CONFIRMED_EVENT.length === 0
    ) {
      return;
    }

    const handleOrderConfirmed = () => {
      loadProducts({
        page,
        limit,
        search,
        sort,
        category,
        subCategory,
        brand,
        status,
        color,
      });
    };

    window.addEventListener(ORDER_CONFIRMED_EVENT, handleOrderConfirmed);

    return () => {
      window.removeEventListener(
        ORDER_CONFIRMED_EVENT,
        handleOrderConfirmed,
      );
    };
  }, [
    enabled,
    loadProducts,
    page,
    limit,
    search,
    sort,
    category,
    subCategory,
    brand,
    status,
    color,
  ]);

  return {
    products,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    refetch: loadProducts,
  };
};
