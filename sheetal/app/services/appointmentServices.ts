import { API_BASE_URL } from "./api";

export interface AppointmentPayload {
    name: string;
    email: string;
    contact: string;
    address: string;
    city: string;
    pincode: string;
    requirements: string;
}

export const bookAppointment = async (payload: AppointmentPayload) => {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to book appointment");
    }

    return data;
};