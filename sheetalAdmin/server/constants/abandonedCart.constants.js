/**
 * Authoritative Abandoned Cart Reminder Workflow Policy
 *
 * Sequence:
 * Step 1: 1 minute
 * Step 2: 3 minutes
 * Step 3: 5 minutes
 * Step 4: 10 minutes
 *
 * Delays are cumulative from cart abandonment timestamp (abandonedAt).
 */

export const ABANDONED_CART_SCHEDULE = Object.freeze([
  {
    stage: "first",
    step: 1,
    label: "Step 1",
    title: "1 min reminder",
    modalTitle: "1 Minute Reminder",
    timing: "After 1 minute",
    delayMinutes: 1,
    channels: ["email", "whatsapp"],
    tone: "Soft Reminder",
    accent: "rose",
  },
  {
    stage: "second",
    step: 2,
    label: "Step 2",
    title: "3 min reminder",
    modalTitle: "3 Minute Reminder",
    timing: "After 3 minutes",
    delayMinutes: 3,
    channels: ["email", "whatsapp"],
    tone: "Warm Follow-up",
    accent: "amber",
  },
  {
    stage: "third",
    step: 3,
    label: "Step 3",
    title: "5 min reminder",
    modalTitle: "5 Minute Reminder",
    timing: "After 5 minutes",
    delayMinutes: 5,
    channels: ["email", "whatsapp", "sms"],
    tone: "Coupon Offer",
    accent: "emerald",
    coupon: true,
  },
  {
    stage: "final",
    step: 4,
    label: "Step 4",
    title: "10 min final reminder",
    modalTitle: "10 Minute Final Reminder",
    timing: "After 10 minutes",
    delayMinutes: 10,
    channels: ["email"],
    tone: "Last Chance",
    accent: "slate",
  },
]);

export const REMINDER_STAGES = Object.freeze(
  ABANDONED_CART_SCHEDULE.map(({ stage, delayMinutes }) => ({
    stage,
    delayMinutes,
  })),
);

export const ABANDONED_CART_STEPS = Object.freeze(
  ABANDONED_CART_SCHEDULE.map(({ stage, label, title, delayMinutes }) => ({
    stage,
    label,
    title,
    delayMinutes,
  })),
);

export const ABANDONED_CART_RECOVERY_STEPS = Object.freeze(
  Object.fromEntries(
    ABANDONED_CART_SCHEDULE.map(({ step, title }) => [step, title]),
  ),
);

export const REMINDER_STAGE_TO_RECOVERY_STEP = Object.freeze(
  Object.fromEntries(
    ABANDONED_CART_SCHEDULE.map(({ stage, step }) => [stage, step]),
  ),
);

export const getStepByStage = (stage) =>
  ABANDONED_CART_SCHEDULE.find((s) => s.stage === stage) || null;
