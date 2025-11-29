import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "../init.js";

const db = admin.database();

/**
 * Automatic token refresh every 6 hours
 */
export const refreshDhanToken = onSchedule(
  { region: "asia-south1", schedule: "every 360 minutes" },
  async () => {
    logger.log("Auto token refresh triggered");

    const tokenRef = db.ref("dhan/token");

    await tokenRef.update({
      refreshedAt: Date.now(),
    });

    return null;
  }
);

/**
 * Manual token refresh via button (admin only)
 */
export const manualTokenRefresh = onCall(
  { region: "asia-south1" },
  async () => {
    const tokenRef = db.ref("dhan/token");

    await tokenRef.update({
      refreshedAt: Date.now(),
    });

    return { ok: true, status: "MANUAL_REFRESH_DONE" };
  }
);
