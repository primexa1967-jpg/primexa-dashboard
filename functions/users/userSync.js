import { onSchedule } from "firebase-functions/v2/scheduler";
import admin from "../init.js";

const db = admin.database();

export const dailyUserSync = onSchedule(
  {
    region: "asia-south1",
    schedule: "every 24 hours",
  },
  async () => {
    const snap = await db.ref("subscriptions").once("value");
    const subs = snap.val() || {};

    const now = Date.now();

    for (let uid in subs) {
      const sub = subs[uid];
      if (sub.end < now) {
        await db.ref(`users/${uid}`).update({ status: "expired" });
      }
    }

    return null;
  }
);
