import { API_BASE_URL } from "./api";

export const createSubscriber = async (email: string) => {
  return await fetch(`${API_BASE_URL}/newsletter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
};
