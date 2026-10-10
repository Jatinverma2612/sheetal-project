import { API_BASE_URL } from "./api";

export interface EnquiryPayload {
  productName: string;
  size: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const submitEnquiry = async (payload: EnquiryPayload) => {
  const res = await fetch(`${API_BASE_URL}/enquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to submit enquiry");
  }

  return data;
};

export const saveEnquiryNotes = async (id: string, notes: string) => {
  const res = await fetch(`${API_BASE_URL}/enquiries/${id}/notes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ notes }),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to save notes");
  return data.enquiry;
};
