import { API_BASE_URL } from "./api";

export interface ContactEnquiryPayload {
  name: string;
  email: string;
  phone: string;
  query: string;
}

export const submitContactEnquiry = async (
  payload: ContactEnquiryPayload,
) => {
  const response = await fetch(`${API_BASE_URL}/contact-enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to submit contact enquiry");
  }

  return data;
};
