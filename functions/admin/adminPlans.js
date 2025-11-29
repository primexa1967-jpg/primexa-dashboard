import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "../init.js";

const db = admin.database();

const SUPERADMIN_EMAIL = "primexa1967@gmail.com";

export const adminPlans = onCall(
  { region: "asia-south1" },
  async (req, ctx) => {
    const { email } = ctx.auth.token;
    if (email !== SUPERADMIN_EMAIL) {
      return { ok: false, error: "NOT_SUPERADMIN" };
    }

    const { plans, gst, upi, qr } = req.data;

    await db.ref("settings/plans").set(plans);
    await db.ref("settings/gst").set(gst);
    await db.ref("settings/upi").set(upi);
    await db.ref("settings/qr").set(qr);

    logger.log("Plans updated by superadmin:", email);

    return { ok: true };
  }
);
