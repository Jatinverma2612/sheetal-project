import Cart from "../models/cart.model.js";
import Settings from "../models/settings.model.js";
import { config } from "../config/config.js";
import logger from "../utils/logger.js";
import { REMINDER_STAGES } from "../constants/abandonedCart.constants.js";
import {
  claimReminderStageLease,
  releaseReminderStageLease,
  markCartAsAbandonedByJob,
  sendReminderByJob,
} from "./abandonedCart.service.js";

const POLL_INTERVAL_MS = 30_000;

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, Number(value) || min));

let timerHandle;
let schedulerRunning = false;

const loadReminderPolicy = async () => {
  const settings = await Settings.findOne().lean();

  return {
    inactivityMinutes: clamp(
      settings?.abandonedCartInactivityMinutes ??
        config.abandonedCart.inactivityMinutes,
      1,
      30,
    ),
    discountPercent: clamp(
      settings?.abandonedCartDiscountPercent ??
        config.abandonedCart.discountPercent,
      5,
      10,
    ),
    couponCode:
      settings?.abandonedCartCouponCode || config.abandonedCart.couponCode,
  };
};

const buildAbandonedCartJobId = (cartId, cycleId, stage) =>
  `abandoned-cart-${cartId}-${cycleId || "no-cycle"}-${stage}`;

const stageAlreadyHandled = (cart, cycleId, stage) =>
  Array.isArray(cart?.abandonmentReminderAttempts) &&
  cart.abandonmentReminderAttempts.some(
    (attempt) =>
      attempt?.cycleId === cycleId &&
      attempt?.stage === stage &&
      ["success", "quarantined", "skipped"].includes(attempt?.status),
  );

export const processDueAbandonedCarts = async () => {
  if (schedulerRunning) {
    return;
  }

  schedulerRunning = true;

  try {
    const policy = await loadReminderPolicy();
    const now = new Date();

    const activeCutoff = new Date(
      now.getTime() - policy.inactivityMinutes * 60 * 1000,
    );

    const dueActiveCarts = await Cart.find({
      abandonmentStatus: "active",
      "items.0": { $exists: true },
      lastActivityAt: { $lte: activeCutoff },
    })
      .select("_id abandonmentCycleId")
      .lean();

    for (const cart of dueActiveCarts) {
      await markCartAsAbandonedByJob({
        cartId: cart._id.toString(),
        cycleId: cart.abandonmentCycleId || null,
      });
    }

    const dueAbandonedCarts = await Cart.find({
      abandonmentStatus: "abandoned",
      "items.0": { $exists: true },
      abandonedAt: { $ne: null },
    })
      .select(
        "_id abandonmentCycleId abandonedAt abandonmentReminderAttempts abandonmentActiveLease",
      )
      .lean();

    for (const cart of dueAbandonedCarts) {
      const cycleId = cart.abandonmentCycleId || null;
      if (!cart.abandonedAt || !cycleId) continue;

      const abandonedAt = new Date(cart.abandonedAt);

      for (const reminder of REMINDER_STAGES) {
        const dueAt = new Date(
          abandonedAt.getTime() + reminder.delayMinutes * 60 * 1000,
        );

        if (now < dueAt) {
          continue;
        }

        if (stageAlreadyHandled(cart, cycleId, reminder.stage)) {
          continue;
        }

        // Skip if active unexpired lease exists from another worker
        if (
          cart.abandonmentActiveLease?.stage === reminder.stage &&
          cart.abandonmentActiveLease?.cycleId === cycleId &&
          new Date(cart.abandonmentActiveLease?.expiresAt) > now
        ) {
          continue;
        }

        // Two-phase atomic lease claim
        const leaseResult = await claimReminderStageLease({
          cartId: cart._id.toString(),
          cycleId,
          stage: reminder.stage,
        });

        if (!leaseResult.acquired) {
          continue;
        }

        const jobId = buildAbandonedCartJobId(
          cart._id.toString(),
          cycleId,
          reminder.stage,
        );

        try {
          await sendReminderByJob({
            cartId: cart._id.toString(),
            cycleId,
            stage: reminder.stage,
            jobId,
            abandonedAt,
            leaseToken: leaseResult.leaseToken,
          });
        } catch (dispatchErr) {
          logger.error(
            {
              cartId: cart._id.toString(),
              stage: reminder.stage,
              error: dispatchErr?.message || String(dispatchErr),
            },
            "[AbandonedCart] Scheduler reminder dispatch threw error",
          );
          await releaseReminderStageLease(
            cart._id.toString(),
            leaseResult.leaseToken,
          ).catch(() => {});
        }

        // Enforce: Process at most one overdue reminder stage per cart per polling tick
        break;
      }
    }
  } catch (error) {
    logger.error(
      { error: error?.message || String(error) },
      "[AbandonedCart] Scheduler run failed",
    );
  } finally {
    schedulerRunning = false;
  }
};

export const initializeAbandonedCartScheduler = () => {
  if (process.env.ENABLE_ABANDONED_CART_SCHEDULER !== "true") {
    logger.info(
      "[AbandonedCart] Scheduler disabled by default (set ENABLE_ABANDONED_CART_SCHEDULER=true to enable)",
    );
    return null;
  }

  if (timerHandle) {
    return timerHandle;
  }

  timerHandle = setInterval(() => {
    void processDueAbandonedCarts();
  }, POLL_INTERVAL_MS);

  if (typeof timerHandle.unref === "function") {
    timerHandle.unref();
  }

  void processDueAbandonedCarts();
  return timerHandle;
};

export const closeAbandonedCartScheduler = async () => {
  if (!timerHandle) return;
  clearInterval(timerHandle);
  timerHandle = undefined;
};
