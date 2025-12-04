// functions/fetchUsers.js
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "./init.js";

const db = admin.firestore();
const SUPERADMIN_EMAIL = "primexa1967@gmail.com";

/**
 * 🔹 Returns pending + active users for the Admin Dashboard
 * - Superadmin sees all users
 * - Admin sees only normal users (not other admins)
 */
export const fetchUsers = onCall({ region: "asia-south1" }, async (req, ctx) => {
  try {
    const { email } = ctx.auth?.token || {};
    if (!email) return { ok: false, error: "UNAUTHORIZED" };

    logger.info("📡 fetchUsers invoked by:", email);

    const isSuper = email === SUPERADMIN_EMAIL;

    const usersRef = db.collection("activeUsers");
    const pendingRef = db.collection("pendingUsers");

    const [activeSnap, pendingSnap] = await Promise.all([
      usersRef.get(),
      pendingRef.get(),
    ]);

    const active = [];
    const pending = [];

    activeSnap.forEach((doc) => {
      const data = doc.data();
      if (isSuper || data.role !== "superadmin")
        active.push({ id: doc.id, ...data });
    });

    pendingSnap.forEach((doc) => {
      const data = doc.data();
      if (isSuper || data.role !== "superadmin")
        pending.push({ id: doc.id, ...data });
    });

    return { ok: true, active, pending };
  } catch (err) {
    logger.error("❌ fetchUsers error:", err);
    return { ok: false, error: err.message };
  }
});
