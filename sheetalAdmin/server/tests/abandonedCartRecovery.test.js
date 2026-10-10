import test, { mock } from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import Settings from "../models/settings.model.js";

const setupIsolatedEnv = () => {
  process.env.NODE_ENV = "test";
  process.env.EMAIL_DRY_RUN = "true";
  process.env.EMAIL_PROVIDER = "mock";
  process.env.ENABLE_ABANDONED_CART_SCHEDULER = "false";
  process.env.MONGO_URI = "mongodb://127.0.0.1:27017/sheetal_test";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.FRONTEND_URL = "http://localhost:3001";
  process.env.ABANDONED_CART_FIRST_REMINDER_MINUTES = "1";
  process.env.ABANDONED_CART_DISCOUNT_PERCENT = "10";
  process.env.ABANDONED_CART_COUPON_CODE = "SAVE10";
};

setupIsolatedEnv();

// Global Settings.findOne mock to prevent Mongoose connection buffering in isolated tests
mock.method(Settings, "findOne", () => ({
  lean: async () => ({
    abandonedCartInactivityMinutes: 1,
    abandonedCartDiscountPercent: 10,
    abandonedCartCouponCode: "SAVE10",
  }),
}));

const createMockCartQuery = (cartDoc) => {
  const query = {
    populate() {
      return query;
    },
    lean() {
      return Promise.resolve(cartDoc);
    },
    select() {
      return query;
    },
    then(resolve, reject) {
      return Promise.resolve(cartDoc).then(resolve, reject);
    },
  };
  return query;
};

test("Scenario 1: All four reminder timing thresholds match 1/3/5/10 minutes consistently", async () => {
  const {
    ABANDONED_CART_SCHEDULE,
    REMINDER_STAGES,
    ABANDONED_CART_STEPS,
    REMINDER_STAGE_TO_RECOVERY_STEP,
  } = await import("../constants/abandonedCart.constants.js");

  assert.equal(ABANDONED_CART_SCHEDULE.length, 4);
  assert.deepEqual(
    REMINDER_STAGES.map((s) => s.delayMinutes),
    [1, 3, 5, 10],
  );
  assert.deepEqual(
    REMINDER_STAGES.map((s) => s.stage),
    ["first", "second", "third", "final"],
  );

  assert.deepEqual(
    ABANDONED_CART_STEPS.map((s) => ({
      step: s.label,
      delayMinutes: s.delayMinutes,
    })),
    [
      { step: "Step 1", delayMinutes: 1 },
      { step: "Step 2", delayMinutes: 3 },
      { step: "Step 3", delayMinutes: 5 },
      { step: "Step 4", delayMinutes: 10 },
    ],
  );

  assert.deepEqual(REMINDER_STAGE_TO_RECOVERY_STEP, {
    first: 1,
    second: 2,
    third: 3,
    final: 4,
  });
});

test("Scenario 2: Checkpoint timestamps and status transitions include quarantined and channel states", async () => {
  const { ABANDONED_CART_STEPS } = await import(
    "../constants/abandonedCart.constants.js"
  );

  const abandonedAt = new Date("2026-10-10T12:00:00Z");
  const cartMock = {
    _id: "cart-123",
    abandonedAt,
    abandonmentReminderAttempts: [
      {
        stage: "first",
        status: "success",
        attemptedAt: new Date("2026-10-10T12:01:05Z"),
        completedAt: new Date("2026-10-10T12:01:06Z"),
        channels: ["email", "whatsapp"],
        metadata: {
          channels: [
            { channel: "email", status: "sent" },
            { channel: "whatsapp", status: "sent" },
          ],
        },
      },
      {
        stage: "second",
        status: "quarantined",
        attemptedAt: new Date("2026-10-10T12:03:05Z"),
        completedAt: new Date("2026-10-10T12:03:06Z"),
        channels: ["email", "whatsapp"],
        metadata: {
          channels: [
            {
              channel: "email",
              quarantined: true,
              error: "HTTP 504 Gateway Timeout",
            },
          ],
        },
      },
    ],
  };

  const checkpoints = ABANDONED_CART_STEPS.map((step) => {
    const attempt = cartMock.abandonmentReminderAttempts.find(
      (entry) => entry.stage === step.stage,
    );
    const scheduledFor = new Date(
      abandonedAt.getTime() + step.delayMinutes * 60 * 1000,
    );

    return {
      ...step,
      status: attempt?.status || "pending",
      scheduledFor,
      attemptedAt: attempt?.attemptedAt || null,
      completedAt: attempt?.completedAt || null,
    };
  });

  assert.equal(checkpoints[0].status, "success");
  assert.equal(
    checkpoints[0].scheduledFor.toISOString(),
    "2026-10-10T12:01:00.000Z",
  );

  assert.equal(checkpoints[1].status, "quarantined");
  assert.equal(
    checkpoints[1].scheduledFor.toISOString(),
    "2026-10-10T12:03:00.000Z",
  );

  assert.equal(checkpoints[2].status, "pending");
  assert.equal(
    checkpoints[2].scheduledFor.toISOString(),
    "2026-10-10T12:05:00.000Z",
  );

  assert.equal(checkpoints[3].status, "pending");
  assert.equal(
    checkpoints[3].scheduledFor.toISOString(),
    "2026-10-10T12:10:00.000Z",
  );
});

test("Scenario 3: Steps Details and individual cart modal timing consistency", async () => {
  const stepsModalContent = await fs.readFile(
    "d:/downloads/StudioBySheetal/sheetalAdmin/client/src/components/admin/sales/AbandonedCartStepsModal.js",
    "utf8",
  );

  assert.ok(stepsModalContent.includes("1 Minute Reminder"));
  assert.ok(stepsModalContent.includes("After 1 minute"));
  assert.ok(stepsModalContent.includes("3 Minute Reminder"));
  assert.ok(stepsModalContent.includes("After 3 minutes"));
  assert.ok(stepsModalContent.includes("5 Minute Reminder"));
  assert.ok(stepsModalContent.includes("After 5 minutes"));
  assert.ok(stepsModalContent.includes("10 Minute Final Reminder"));
  assert.ok(stepsModalContent.includes("After 10 minutes"));

  assert.ok(!stepsModalContent.includes("30 Minute Reminder"));
  assert.ok(!stepsModalContent.includes("After 30 minutes"));
  assert.ok(!stepsModalContent.includes("6 Hour Reminder"));
  assert.ok(!stepsModalContent.includes("After 6 hours"));
  assert.ok(!stepsModalContent.includes("24 Hour Reminder"));
  assert.ok(!stepsModalContent.includes("After 24 hours"));
  assert.ok(!stepsModalContent.includes("48 Hour Final Reminder"));
  assert.ok(!stepsModalContent.includes("After 48 hours"));

  const detailsModalContent = await fs.readFile(
    "d:/downloads/StudioBySheetal/sheetalAdmin/client/src/components/admin/sales/AbandonedCartDetailsModal.js",
    "utf8",
  );
  assert.ok(detailsModalContent.includes("quarantined:"));
  assert.ok(detailsModalContent.includes("ShieldAlert"));
});

test("Scenario 4: One-stage-per-tick handling of overdue carts", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const scheduler = await import("../services/abandonedCart.scheduler.js");

  const now = new Date();
  const abandonedAt = new Date(now.getTime() - 30 * 60 * 1000);

  const mockCartDoc = {
    _id: "cart-overdue-1",
    email: "test@example.com",
    phoneNumber: "+919876543210",
    abandonmentStatus: "abandoned",
    abandonmentCycleId: "cycle-test-1",
    abandonedAt,
    items: [{ product: "p1", quantity: 1, price: 500 }],
    abandonmentReminderAttempts: [],
    abandonmentActiveLease: null,
  };

  const claimedStages = [];

  const mocks = [
    mock.method(Cart, "find", (filter) => {
      if (filter.abandonmentStatus === "active") {
        return { select: () => ({ lean: async () => [] }) };
      }
      return {
        select: () => ({
          lean: async () => [mockCartDoc],
        }),
      };
    }),
    mock.method(Cart, "findById", () => createMockCartQuery(mockCartDoc)),
    mock.method(Cart, "findOneAndUpdate", async (filter, update) => {
      const lease = update?.$set?.abandonmentActiveLease;
      if (lease) {
        claimedStages.push(lease.stage);
        return {
          ...mockCartDoc,
          abandonmentActiveLease: lease,
        };
      }
      return mockCartDoc;
    }),
    mock.method(Cart, "findByIdAndUpdate", async () => mockCartDoc),
  ];

  try {
    await scheduler.processDueAbandonedCarts();

    // CRITICAL REQUIREMENT: Exactly 1 stage claimed and processed per tick!
    assert.equal(claimedStages.length, 1);
    assert.equal(claimedStages[0], "first");
  } finally {
    mocks.forEach((m) => m.mock.restore());
  }
});

test("Scenario 5: Checkout cancellation and recovered carts stop future reminders", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { completeAbandonedCartFlow, sendReminder } = await import(
    "../services/abandonedCart.service.js"
  );

  let savedCart = null;
  const mockCart = {
    _id: "cart-checkout-1",
    user: "user-1",
    abandonmentStatus: "abandoned",
    abandonmentCycleId: "cycle-to-cancel",
    abandonedAt: new Date(Date.now() - 5 * 60 * 1000),
    abandonmentReminderJobIds: { first: "job-1", second: "job-2" },
    abandonmentActiveLease: { stage: "first", token: "tok-1" },
    abandonmentReminderAttempts: [],
    async save() {
      savedCart = this;
      return this;
    },
  };

  const mocks = [
    mock.method(Cart, "findOne", () => mockCart),
    mock.method(Cart, "findById", () => createMockCartQuery(mockCart)),
  ];

  try {
    await completeAbandonedCartFlow({ cartId: "cart-checkout-1" });

    assert.equal(savedCart.abandonmentStatus, "completed");
    assert.equal(savedCart.abandonedAt, null);
    assert.equal(savedCart.abandonmentCycleId, null);
    assert.equal(savedCart.abandonmentActiveLease, null);
    assert.deepEqual(savedCart.abandonmentReminderJobIds, {});

    // Lingering job fires after checkout:
    mockCart.abandonmentStatus = "completed";
    const lingeringResult = await sendReminder({
      cartId: "cart-checkout-1",
      cycleId: "cycle-to-cancel",
      stage: "second",
      jobId: "job-2",
    });

    assert.equal(lingeringResult.status, "skipped");
    assert.equal(lingeringResult.reason, "cart_completed");
  } finally {
    mocks.forEach((m) => m.mock.restore());
  }
});

test("Scenario 6: Concurrent duplicate-claim prevention via atomic lease", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { claimReminderStageLease } = await import(
    "../services/abandonedCart.service.js"
  );

  let activeLeaseInDb = null;

  const mockFindOneAndUpdate = mock.method(
    Cart,
    "findOneAndUpdate",
    async (filter, update) => {
      const now = new Date();
      if (
        activeLeaseInDb === null ||
        (activeLeaseInDb.expiresAt && activeLeaseInDb.expiresAt < now)
      ) {
        activeLeaseInDb = update.$set.abandonmentActiveLease;
        return {
          _id: filter._id,
          abandonmentActiveLease: activeLeaseInDb,
        };
      }
      return null;
    },
  );

  try {
    const worker1 = await claimReminderStageLease({
      cartId: "cart-conc-1",
      cycleId: "cycle-c1",
      stage: "first",
    });

    const worker2 = await claimReminderStageLease({
      cartId: "cart-conc-1",
      cycleId: "cycle-c1",
      stage: "first",
    });

    assert.equal(worker1.acquired, true);
    assert.ok(worker1.leaseToken);
    assert.equal(worker2.acquired, false);
    assert.equal(worker2.leaseToken, null);
  } finally {
    mockFindOneAndUpdate.mock.restore();
  }
});

test("Scenario 7: Expired pre-dispatch lease recovery", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { claimReminderStageLease } = await import(
    "../services/abandonedCart.service.js"
  );

  let activeLeaseInDb = {
    stage: "first",
    cycleId: "cycle-exp-1",
    leaseToken: "old-crashed-worker-token",
    claimedAt: new Date(Date.now() - 10 * 60 * 1000),
    expiresAt: new Date(Date.now() - 5 * 60 * 1000),
  };

  const mockFindOneAndUpdate = mock.method(
    Cart,
    "findOneAndUpdate",
    async (filter, update) => {
      const now = new Date();
      const expiredCond = activeLeaseInDb.expiresAt < now;
      if (activeLeaseInDb === null || expiredCond) {
        activeLeaseInDb = update.$set.abandonmentActiveLease;
        return {
          _id: filter._id,
          abandonmentActiveLease: activeLeaseInDb,
        };
      }
      return null;
    },
  );

  try {
    const recoveryWorker = await claimReminderStageLease({
      cartId: "cart-exp-1",
      cycleId: "cycle-exp-1",
      stage: "first",
    });

    assert.equal(recoveryWorker.acquired, true);
    assert.ok(recoveryWorker.leaseToken);
    assert.notEqual(recoveryWorker.leaseToken, "old-crashed-worker-token");
  } finally {
    mockFindOneAndUpdate.mock.restore();
  }
});

test("Scenario 8: Quarantine after ambiguous dispatch protects against duplicate sends", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { sendReminder } = await import(
    "../services/abandonedCart.service.js"
  );

  let persistedAttempt = null;
  let activeLeaseReleased = false;

  const mockCartDoc = {
    _id: "cart-quar-1",
    email: "customer@example.com",
    phoneNumber: null,
    abandonmentStatus: "abandoned",
    abandonmentCycleId: "cycle-q1",
    abandonedAt: new Date(),
    items: [{ product: "p1", quantity: 1, price: 1000 }],
    abandonmentReminderAttempts: [],
    abandonmentActiveLease: { stage: "first", token: "tok-q1" },
  };

  const prevEnv = process.env.NODE_ENV;
  const prevProvider = process.env.EMAIL_PROVIDER;
  const prevDryRun = process.env.EMAIL_DRY_RUN;
  const prevFallback = process.env.EMAIL_FALLBACK_TO_SMTP;

  process.env.NODE_ENV = "production";
  process.env.EMAIL_PROVIDER = "brevo";
  process.env.EMAIL_DRY_RUN = "false";
  process.env.EMAIL_FALLBACK_TO_SMTP = "false";
  process.env.BREVO_API_KEY = "mock-brevo-key";
  process.env.BREVO_SENDER_EMAIL = "sender@example.com";

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 504,
    statusText: "Gateway Timeout",
    json: async () => ({ message: "Gateway Timeout" }),
  });

  const mocks = [
    mock.method(Cart, "findById", () => createMockCartQuery(mockCartDoc)),
    mock.method(Cart, "findByIdAndUpdate", (id, update) => {
      if (update?.$push?.abandonmentReminderAttempts) {
        persistedAttempt = update.$push.abandonmentReminderAttempts;
      }
      if (update?.$set?.abandonmentActiveLease === null) {
        activeLeaseReleased = true;
      }
      return Promise.resolve(mockCartDoc);
    }),
  ];

  try {
    const result = await sendReminder({
      cartId: "cart-quar-1",
      cycleId: "cycle-q1",
      stage: "first",
      jobId: "job-q1",
      leaseToken: "tok-q1",
    });

    assert.equal(result.status, "quarantined");
    assert.equal(persistedAttempt.status, "quarantined");
    assert.equal(activeLeaseReleased, true);

    // If another job attempts this stage again, it must be skipped:
    mockCartDoc.abandonmentReminderAttempts.push(persistedAttempt);
    const retryResult = await sendReminder({
      cartId: "cart-quar-1",
      cycleId: "cycle-q1",
      stage: "first",
      jobId: "job-q1-retry",
    });
    assert.equal(retryResult.status, "skipped");
  } finally {
    process.env.NODE_ENV = prevEnv;
    process.env.EMAIL_PROVIDER = prevProvider;
    process.env.EMAIL_DRY_RUN = prevDryRun;
    process.env.EMAIL_FALLBACK_TO_SMTP = prevFallback;
    global.fetch = originalFetch;
    mocks.forEach((m) => m.mock.restore());
  }
});

test("Scenario 9: Provider rejection records failure and releases lease safely", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { sendReminder } = await import(
    "../services/abandonedCart.service.js"
  );

  let persistedAttempt = null;
  let activeLeaseReleased = false;

  const mockCartDoc = {
    _id: "cart-fail-1",
    email: "invalid@example.com",
    phoneNumber: null,
    abandonmentStatus: "abandoned",
    abandonmentCycleId: "cycle-f1",
    abandonedAt: new Date(),
    items: [{ product: "p1", quantity: 1, price: 1000 }],
    abandonmentReminderAttempts: [],
  };

  const prevEnv = process.env.NODE_ENV;
  const prevProvider = process.env.EMAIL_PROVIDER;
  const prevDryRun = process.env.EMAIL_DRY_RUN;
  const prevFallback = process.env.EMAIL_FALLBACK_TO_SMTP;

  process.env.NODE_ENV = "production";
  process.env.EMAIL_PROVIDER = "brevo";
  process.env.EMAIL_DRY_RUN = "false";
  process.env.EMAIL_FALLBACK_TO_SMTP = "false";
  process.env.BREVO_API_KEY = "mock-brevo-key";
  process.env.BREVO_SENDER_EMAIL = "sender@example.com";

  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 400,
    statusText: "Bad Request",
    json: async () => ({ message: "Invalid email" }),
  });

  const mocks = [
    mock.method(Cart, "findById", () => createMockCartQuery(mockCartDoc)),
    mock.method(Cart, "findByIdAndUpdate", (id, update) => {
      if (update?.$push?.abandonmentReminderAttempts) {
        persistedAttempt = update.$push.abandonmentReminderAttempts;
      }
      if (update?.$set?.abandonmentActiveLease === null) {
        activeLeaseReleased = true;
      }
      return Promise.resolve(mockCartDoc);
    }),
  ];

  try {
    const result = await sendReminder({
      cartId: "cart-fail-1",
      cycleId: "cycle-f1",
      stage: "first",
      jobId: "job-fail-1",
      leaseToken: "fail-token-1",
    });

    assert.equal(result.status, "failure");
    assert.equal(persistedAttempt.status, "failure");
    assert.equal(activeLeaseReleased, true);
  } finally {
    process.env.NODE_ENV = prevEnv;
    process.env.EMAIL_PROVIDER = prevProvider;
    process.env.EMAIL_DRY_RUN = prevDryRun;
    process.env.EMAIL_FALLBACK_TO_SMTP = prevFallback;
    global.fetch = originalFetch;
    mocks.forEach((m) => m.mock.restore());
  }
});

test("Scenario 10: Email dry-run makes zero external network calls and sets diagnostics", async () => {
  const { default: sendEmail } = await import(
    "../utils/sendEmail.js?dryrun-check=3"
  );

  let fetchCalled = false;
  const originalFetch = global.fetch;
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error("External fetch MUST NOT be called in dry-run mode!");
  };

  try {
    const result = await sendEmail({
      email: "test@example.com",
      subject: "Dry Run Test",
      message: "Test content",
    });

    assert.equal(fetchCalled, false);
    assert.equal(result.success, true);
    assert.equal(result.mock, true);
    assert.equal(result.provider, "mock");
    assert.equal(result.providerAccepted, false);
    assert.equal(result.deliveryConfirmed, false);
    assert.ok(result.messageId.startsWith("mock-"));
  } finally {
    global.fetch = originalFetch;
  }
});

test("Scenario 11: SAVE10 coupon behavior on stage 3 reminder", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { default: AbandonedCartCoupon } = await import(
    "../models/abandonedcartcoupon.model.js"
  );
  const service = await import("../services/abandonedCart.service.js");

  let createdCouponPayload = null;

  const mockCartDoc = {
    _id: "cart-c3-1",
    user: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    phoneNumber: "+919988776655",
    abandonmentStatus: "abandoned",
    abandonmentCycleId: "cycle-c3",
    abandonedAt: new Date(),
    items: [{ product: "507f1f77bcf86cd799439012", quantity: 1, price: 1500 }],
    abandonmentReminderAttempts: [],
  };

  const mocks = [
    mock.method(Cart, "findById", () => createMockCartQuery(mockCartDoc)),
    mock.method(Cart, "findByIdAndUpdate", () => Promise.resolve(mockCartDoc)),
    mock.method(AbandonedCartCoupon, "findOne", async () => null),
    mock.method(AbandonedCartCoupon, "create", async (payload) => {
      createdCouponPayload = payload;
      return {
        _id: "coupon-rec-1",
        ...payload,
      };
    }),
  ];

  try {
    const result = await service.sendReminder({
      cartId: "cart-c3-1",
      cycleId: "cycle-c3",
      stage: "third",
      jobId: "job-c3",
      leaseToken: "tok-c3",
    });

    assert.equal(result.status, "success");
    assert.ok(createdCouponPayload);
    assert.equal(createdCouponPayload.code, "SAVE10");
    assert.equal(createdCouponPayload.discountPercent, 10);
  } finally {
    mocks.forEach((m) => m.mock.restore());
  }
});

test("Scenario 12: Missing email and contact information cleanly skipped without error", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { sendReminder } = await import(
    "../services/abandonedCart.service.js"
  );

  let persistedEntry = null;

  const mockCartNoContact = {
    _id: "cart-nocontact-1",
    email: null,
    phoneNumber: null,
    user: null,
    abandonmentStatus: "abandoned",
    abandonmentCycleId: "cycle-nc",
    abandonedAt: new Date(),
    items: [{ product: "p1", quantity: 1, price: 500 }],
    abandonmentReminderAttempts: [],
  };

  const mocks = [
    mock.method(Cart, "findById", () => createMockCartQuery(mockCartNoContact)),
    mock.method(Cart, "findByIdAndUpdate", (id, update) => {
      persistedEntry = update.$push.abandonmentReminderAttempts;
      return Promise.resolve(mockCartNoContact);
    }),
  ];

  try {
    const result = await sendReminder({
      cartId: "cart-nocontact-1",
      cycleId: "cycle-nc",
      stage: "first",
      jobId: "job-nc-1",
    });

    assert.equal(result.status, "skipped");
    assert.equal(result.reason, "no_available_channels");
    assert.equal(persistedEntry.status, "skipped");
  } finally {
    mocks.forEach((m) => m.mock.restore());
  }
});

test("Scenario 13: Redis unavailable behavior falls back cleanly to polling scheduler", async () => {
  const { default: Cart } = await import("../models/cart.model.js");
  const { scheduleReminders } = await import(
    "../services/abandonedCart.service.js"
  );
  const { config } = await import("../config/config.js");

  let savedCart = null;
  const mockCart = {
    _id: "cart-redis-down-1",
    abandonmentStatus: "abandoned",
    abandonmentCycleId: "cycle-rd-1",
    abandonedAt: new Date(),
    items: [{ product: "p1", quantity: 1, price: 800 }],
    abandonmentReminderJobIds: { first: "old-job" },
    abandonmentReminderAttempts: [],
    async save() {
      savedCart = this;
      return this;
    },
  };

  const prevHost = config.redis.host;
  const prevUrl = config.redis.url;
  config.redis.host = null;
  config.redis.url = null;

  const mocks = [
    mock.method(Cart, "findById", () => createMockCartQuery(mockCart)),
  ];

  try {
    const resultCart = await scheduleReminders("cart-redis-down-1", {
      cycleId: "cycle-rd-1",
      abandonedAt: new Date(),
    });

    assert.ok(resultCart);
    assert.deepEqual(savedCart.abandonmentReminderJobIds, {});
  } finally {
    config.redis.host = prevHost;
    config.redis.url = prevUrl;
    mocks.forEach((m) => m.mock.restore());
  }
});
