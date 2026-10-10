export const normalizeAddress = (value = {}) => ({
  addressLine: value?.addressLine || "",
  pincode: value?.pincode || "",
  city: value?.city || "",
  state: value?.state || "",
  country: value?.country || "",
});
