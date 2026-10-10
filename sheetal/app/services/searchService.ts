import { apiFetch } from "./api";

export const searchService = async (query: string) => {
  return apiFetch(`/search?q=${query}`);
};
