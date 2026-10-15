export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://node.projects.codenap.in/mmk");

export const API_BASE_URL = `${BASE_URL}/api/v1`;

export const IMAGE_BASE_URL = BASE_URL;

export const getApiImageUrl = (
  path,
  fallback = "/assets/default-image.png",
) => {
  if (!path) return fallback;
  if (typeof path === "string") {
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE_URL}/${path.startsWith("/") ? path.substring(1) : path}`;
  }
  if (path.url) {
    return path.url;
  }
  return fallback;
};
