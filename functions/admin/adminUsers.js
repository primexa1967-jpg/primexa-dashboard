import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();

export const adminUsers = onCall(
  { region: "asia-south1" },
  async (req, ctx) => {

    const email = ctx.auth.token.email;

    const isSuper = email === "primexa1967@gmail.com";
    const isAdmin = await db
      .ref("admins")
      .child(email.replace(/\./g, "_"))
      .once("value")
      .then((s) => s.exists());

    if (!isAdmin && !isSuper) {
      return { ok: false, error: "NOT_ADMIN" };
    }

    const { action, target, data } = req.data;
    const safeTarget = target.replace(/\./g, "_");

    if (action === "resetDevices") {
      await db.ref(`devices/${safeTarget}`).remove();
    }

    if (action === "expireUser") {
      await db.ref(`users/${safeTarget}`).update({ status: "expired" });
    }

    if (action === "extendSubscription") {
      const { days } = data;
      const now = Date.now();

      await db.ref(`subscriptions/${safeTarget}`).transaction((sub) => {
        if (!sub) return null;
        sub.end = (sub.end || now) + days * 86400000;
        return sub;
      });
    }

    return { ok: true };
  }
);
