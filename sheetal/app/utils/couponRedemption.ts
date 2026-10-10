const REDEMPTION_KEY = "coupon_redemptions_by_user";

const readStore = (): Record<string, string[]> => {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(REDEMPTION_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(parsed).reduce<Record<string, string[]>>((acc, [userId, value]) => {
      acc[userId] = Array.isArray(value)
        ? value.map((item) => String(item).toUpperCase())
        : [];
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const writeStore = (store: Record<string, string[]>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REDEMPTION_KEY, JSON.stringify(store));
};

const normalizeCode = (code: string) => code.trim().toUpperCase();

const readLimit = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const isSingleUseCoupon = (meta?: unknown) => {
  if (!meta || typeof meta !== "object") return false;

  const record = meta as Record<string, unknown>;

  const onePerCustomerFlags = [
    record.oncePerCustomer,
    record.onePerCustomer,
    record.singleUsePerCustomer,
    record.restrictToOnePerCustomer,
  ];

  if (onePerCustomerFlags.some(Boolean)) {
    return true;
  }

  const perCustomerLimits = [
    readLimit(record.perCustomerLimit),
    readLimit(record.maxUsesPerCustomer),
    readLimit(record.maxRedemptionsPerCustomer),
    readLimit(record.usageLimitPerCustomer),
    readLimit(record.userUsageLimit),
  ].filter((value): value is number => value !== null);

  return perCustomerLimits.some((limit) => limit === 1);
};

export const hasRedeemedCoupon = (userId: string, code: string) => {
  if (!userId || !code) return false;

  const store = readStore();
  const redeemed = store[userId] || [];
  return redeemed.includes(normalizeCode(code));
};

export const markCouponRedeemed = (userId: string, code: string) => {
  if (!userId || !code) return;

  const store = readStore();
  const redeemed = new Set(store[userId] || []);
  redeemed.add(normalizeCode(code));
  store[userId] = Array.from(redeemed);
  writeStore(store);
};
