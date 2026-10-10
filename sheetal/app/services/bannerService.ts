import { apiFetch } from "./api";

const BANNER_ENDPOINT = "/banner";

/**
 * Fetches all active banners.
 *
 * @returns {Promise<any>} A promise that resolves to the list of active banners.
 */
export const getActiveBanners = async (): Promise<any> => {
  try {
    const res = await apiFetch(BANNER_ENDPOINT, { method: "GET" });
    return res;
  } catch (error) {
    console.error("Error fetching active banners:", error);
    throw error;
  }
};
