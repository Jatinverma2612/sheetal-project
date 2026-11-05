import assert from "node:assert/strict";
import test from "node:test";

test("buildReminderCheckpoints scopes to cart.abandonmentCycleId and ignores stale cycles", async () => {
  // Mock cart with attempts from two different cycles (Oct 12 vs Nov 5)
  const cartMock = {
    _id: "6ac9eab3ba163d24e6d4d3df",
    abandonmentCycleId: "ab6b3219-1bac-4879-96bc-75153c8bc8ef",
    abandonedAt: new Date("2026-11-05T06:30:00.000Z"),
    abandonmentReminderAttempts: [
      // Old cycle from October 12, 2026:
      {
        cycleId: "844cdc7a-abc0-4a96-8261-848bbdb03bd5",
        stage: "first",
        status: "success",
        attemptedAt: new Date("2026-10-10T14:00:00.000Z"),
      },
      {
        cycleId: "844cdc7a-abc0-4a96-8261-848bbdb03bd5",
        stage: "second",
        status: "success",
        attemptedAt: new Date("2026-10-10T14:02:00.000Z"),
      },
      {
        cycleId: "844cdc7a-abc0-4a96-8261-848bbdb03bd5",
        stage: "third",
        status: "failure",
        attemptedAt: new Date("2026-10-12T01:40:00.000Z"),
        error: "connect ENETUNREACH 2607:f8b0:400e:c0d::6d:587 - Local (:::0)",
      },
      {
        cycleId: "844cdc7a-abc0-4a96-8261-848bbdb03bd5",
        stage: "final",
        status: "failure",
        attemptedAt: new Date("2026-10-12T23:26:00.000Z"),
        error: "Connection timeout",
      },
      // Current cycle from today (November 5, 2026):
      {
        cycleId: "ab6b3219-1bac-4879-96bc-75153c8bc8ef",
        stage: "first",
        status: "success",
        attemptedAt: new Date("2026-11-05T06:32:00.000Z"),
        completedAt: new Date("2026-11-05T06:32:01.000Z"),
        channels: ["email"],
      },
      {
        cycleId: "ab6b3219-1bac-4879-96bc-75153c8bc8ef",
        stage: "second",
        status: "success",
        attemptedAt: new Date("2026-11-05T06:34:00.000Z"),
        completedAt: new Date("2026-11-05T06:34:01.000Z"),
        channels: ["email"],
      },
      {
        cycleId: "ab6b3219-1bac-4879-96bc-75153c8bc8ef",
        stage: "third",
        status: "success",
        attemptedAt: new Date("2026-11-05T06:35:00.000Z"),
        completedAt: new Date("2026-11-05T06:35:02.000Z"),
        channels: ["email"],
      },
    ],
  };

  const { ABANDONED_CART_STEPS } = await import(
    "../constants/abandonedCart.constants.js"
  );

  const allAttempts = Array.isArray(cartMock.abandonmentReminderAttempts)
    ? cartMock.abandonmentReminderAttempts
    : [];

  const cycleId = cartMock.abandonmentCycleId;
  const cycleAttempts = cycleId
    ? allAttempts.filter((entry) => entry?.cycleId === cycleId)
    : allAttempts;

  const relevantAttempts = cycleId ? cycleAttempts : allAttempts;

  const checkpoints = ABANDONED_CART_STEPS.map((step) => {
    const stageAttempts = relevantAttempts.filter(
      (entry) => entry?.stage === step.stage,
    );
    const attempt = stageAttempts[stageAttempts.length - 1] || null;
    return {
      stage: step.stage,
      status: attempt?.status || "pending",
      error: attempt?.error || null,
      attemptedAt: attempt?.attemptedAt || null,
    };
  });

  // Verify step 1
  assert.equal(checkpoints[0].stage, "first");
  assert.equal(checkpoints[0].status, "success");

  // Verify step 2
  assert.equal(checkpoints[1].stage, "second");
  assert.equal(checkpoints[1].status, "success");

  // Verify step 3: MUST be "success" from today, NOT "failure" from Oct 12
  assert.equal(checkpoints[2].stage, "third");
  assert.equal(checkpoints[2].status, "success");
  assert.equal(checkpoints[2].error, null);
  assert.equal(checkpoints[2].attemptedAt.toISOString(), "2026-11-05T06:35:00.000Z");

  // Verify step 4: MUST be "pending", NOT "failure" from Oct 12
  assert.equal(checkpoints[3].stage, "final");
  assert.equal(checkpoints[3].status, "pending");
  assert.equal(checkpoints[3].error, null);
  assert.equal(checkpoints[3].attemptedAt, null);

  console.log("All checkpoint assertions passed!");
});

