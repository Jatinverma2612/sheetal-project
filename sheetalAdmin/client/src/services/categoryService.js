import { API_BASE_URL } from "./api";

// Helper function to get auth headers from localStorage
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle response (DRY Principle)
const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(
      `Server error (${res.status}): ${res.statusText || "Request failed"}`,
    );
  }
  if (!res.ok) throw new Error(data?.message || "Something went wrong");
  return data;
};

/* =========================
   Get Categories (Admin)
   ========================= */
export const getCategories = async (page = 1, limit = 50, search = "") => {
  const res = await fetch(
    `${API_BASE_URL}/categories/admin/all?page=${page}&limit=${limit}&search=${search}`,
    {
      credentials: "include",
      headers: getAuthHeaders(),
    },
  );
  return handleResponse(res);
};

/* =========================
   Get All Categories (Public)
   ========================= */
export const fetchAllCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: { "Content-Type": "application/json" }
  });
  return handleResponse(res);
};

/* =========================
   Add Category (Handles Files)
   ========================= */
export const addCategory = async (formData) => {
  // NOTE: When sending FormData, browser automatically sets multipart/form-data
  // boundary. We only supply Authorization headers.
  const res = await fetch(`${API_BASE_URL}/categories/admin`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(res);
};

/* =========================
   Update Category
   ========================= */
export const updateCategory = async (id, formData) => {
  const res = await fetch(`${API_BASE_URL}/categories/admin/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: getAuthHeaders(),
    body: formData,
  });

  return handleResponse(res);
};

/* =========================
   Delete Category
   ========================= */
export const deleteCategory = async (id) => {
  const res = await fetch(`${API_BASE_URL}/categories/admin/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  return handleResponse(res);
};

/* =========================
   Reorder Categories
   ========================= */
export const reorderCategories = async (orderedIds) => {
  const res = await fetch(`${API_BASE_URL}/categories/admin/reorder`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ orderedIds }),
  });
  return handleResponse(res);
};

/* =========================
   Get Category Stats
   ========================= */
export const getCategoryStats = async () => {
  const res = await fetch(`${API_BASE_URL}/categories/admin/stats`, {
    credentials: "include",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};
