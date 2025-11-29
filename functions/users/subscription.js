import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();

export const checkSubscription = onCall(
  { region: "asia-south1" },
  async (req) => {
    const { email } = req.data;
    const safeEmail = email.replace(/\./g, "_");

    const snap = await db.ref(`subscriptions/${safeEmail}`).once("value");
    const sub = snap.val();

    if (!sub) {
      return { ok: false, status: "NO_SUB" };
    }

    const now = Date.now();

    if (now > sub.end) {
      await db.ref(`users/${safeEmail}`).update({ status: "expired" });
      return { ok: false, status: "EXPIRED" };
    }

    return {
      ok: true,
      status: "ACTIVE",
      remainingDays: Math.ceil((sub.end - now) / 86400000),
    };
  }
);
