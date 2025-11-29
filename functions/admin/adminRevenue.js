import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();
const SUPERADMIN_EMAIL = "primexa1967@gmail.com";

export const adminRevenue = onCall(
  { region: "asia-south1" },
  async (req, ctx) => {
    const { email } = ctx.auth.token;
    if (email !== SUPERADMIN_EMAIL) return { ok: false, error: "NOT_SUPERADMIN" };

    const { amount, user } = req.data;
    const ts = Date.now();

    await db.ref(`revenue/history/${ts}`).set({ amount, user, ts });
    await db.ref("revenue/total").transaction((tot) => (tot || 0) + amount);

    return { ok: true };
  }
);
