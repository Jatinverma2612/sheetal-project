/**
 * useCategories Hook
 * Custom hook to fetch and manage categories
 */

"use client";

import { useEffect, useState } from "react";
import { fetchAllCategories, Category } from "../services/categoryService";

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCategories();
      setCategories(data);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      console.error("Error in useCategories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = async () => {
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch,
  };
};
