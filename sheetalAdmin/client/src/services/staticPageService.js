import { API_BASE_URL } from "./api";

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

export const getStaticPages = async (search = "") => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);

  const res = await fetch(`${API_BASE_URL}/pages/admin?${params.toString()}`, {
    credentials: "include",
  });
  return handleResponse(res);
};

export const createStaticPage = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/pages/admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateStaticPage = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/pages/admin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteStaticPage = async (id) => {
  const res = await fetch(`${API_BASE_URL}/pages/admin/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
};

export const getFooterStaticPages = async () => {
  const res = await fetch(`${API_BASE_URL}/pages/public/footer`, {
    credentials: "include",
  });
  return handleResponse(res);
};
