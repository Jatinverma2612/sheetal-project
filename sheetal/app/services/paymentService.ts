import { apiFetch } from "./api";

type CheckoutAddress = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export const createRazorpayPaymentLink = async (
  addressId: string,
  shippingAddress: CheckoutAddress,
  billingAddress: CheckoutAddress,
  email: string,
  buyNowItems?: object[],
  cartItems?: object[],
  couponData?: {
    couponId?: string;
    couponCode?: string;
    discountPrice?: number;
  },
  recoveryAttribution?: {
    recoverySource?: string;
    recoveryStage?: number;
    recoveryCartId?: string;
    recoveryCycleId?: string;
  },
) => {
  const callbackUrl = `${window.location.origin}/checkout/success`;

  return await apiFetch("/payment/create-link", {
    method: "POST",
      body: JSON.stringify({
        addressId,
        shippingAddress,
        billingAddress,
        email,
        callbackUrl,
        ...(buyNowItems ? { buyNowItems } : {}),
        ...(cartItems ? { cartItems } : {}),
        ...(couponData ? couponData : {}),
        ...(recoveryAttribution ? recoveryAttribution : {}),
      }),
  });
};

/**
 * Verifies an online payment after Razorpay redirects to /checkout/success.
 * Sends the payment link ID and payment ID to the backend, which verifies
 * directly with Razorpay API — no HMAC needed on the frontend.
 */
export const verifyRazorpayPayment = async (params: {
    razorpay_payment_link_id: string;
    razorpay_payment_link_reference_id: string;
    razorpay_payment_link_status: string;
    razorpay_payment_id: string;
    razorpay_signature?: string; // optional — no longer used for verification
}) => {
    return await apiFetch("/payment/verify", {
        method: "POST",
        body: JSON.stringify(params),
    });
};
