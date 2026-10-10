/**
 * Standalone Abandoned Cart Tick Script for cPanel / Cron Job Execution
 *
 * Usage:
 *   node scripts/run-abandoned-cart-tick.js
 *
 * In cPanel Cron Jobs:
 *   * * * * * cd /home/username/path/to/server && /usr/local/bin/node scripts/run-abandoned-cart-tick.js >> logs/cron.log 2>&1
 */

import connectDB from "../config/db.js";
import { processDueAbandonedCarts } from "../services/abandonedCart.scheduler.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

const run = async () => {
  logger.info("[Cron] Running abandoned cart scheduler tick...");
  try {
    await connectDB();
    await processDueAbandonedCarts();
    logger.info("[Cron] Abandoned cart scheduler tick completed successfully.");
  } catch (error) {
    logger.error(
      { error: error?.message || String(error) },
      "[Cron] Abandoned cart scheduler tick failed",
    );
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect error on exit
    }
  }
};

run();
