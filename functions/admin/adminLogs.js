import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();
const SUPERADMIN_EMAIL = "primexa1967@gmail.com";

export const writeAdminLog = onCall(
  { region: "asia-south1" },
  async (req, ctx) => {
    const actor = ctx.auth.token.email;
    const { message } = req.data;

    await db.ref("logs/admin").push({
      message,
      actor,
      time: Date.now(),
    });

    return { ok: true };
  }
);

export const clearAdminLogs = onCall(
  { region: "asia-south1" },
  async (req, ctx) => {
    if (ctx.auth.token.email !== SUPERADMIN_EMAIL) {
      return { ok: false, error: "NOT_SUPERADMIN" };
    }

    await db.ref("logs/admin").remove();

    return { ok: true };
  }
);
