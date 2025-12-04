// functions/adminUsers.js
import { onCall } from "firebase-functions/v2/https";
import admin from "./init.js";

const db = admin.firestore();
const SUPERADMIN_EMAIL = "primexa1967@gmail.com";

/**
 * 🔹 Handles admin actions:
 * - Approve pending user → move to activeUsers
 * - Reject pending user → delete
 * - Extend / expire subscriptions
 * - Reset devices (if integrated later)
 */
export const adminUsers = onCall({ region: "asia-south1" }, async (req, ctx) => {
  try {
    const caller = ctx.auth?.token?.email;
    if (!caller) return { ok: false, error: "UNAUTHORIZED" };

    const isSuper = caller === SUPERADMIN_EMAIL;

    // Check if admin
    const adminSnap = await db.collection("admins").doc(caller).get();
    const isAdmin = adminSnap.exists;

    if (!isAdmin && !isSuper)
      return { ok: false, error: "NOT_ADMIN" };

    const { action, target, plan, days } = req.data;
    if (!target) return { ok: false, error: "NO_TARGET_USER" };

    const pendingRef = db.collection("pendingUsers").doc(target);
    const activeRef = db.collection("activeUsers").doc(target);

    // 🟢 Approve pending → active
    if (action === "approve") {
      const snap = await pendingRef.get();
      if (!snap.exists) return { ok: false, error: "USER_NOT_FOUND" };

      const data = snap.data();
      const planDays =
        plan === "plan365" ? 365 : plan === "plan180" ? 180 : 90;

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + planDays);

      await activeRef.set({
        ...data,
        plan,
        approvedBy: caller,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiryDate: expiryDate.toISOString(),
        status: "active",
      });

      await pendingRef.delete();
      return { ok: true, status: "APPROVED" };
    }

    // 🔴 Reject user
    if (action === "reject") {
      await pendingRef.delete();
      return { ok: true, status: "REJECTED" };
    }

    // ⏳ Extend subscription
    if (action === "extend") {
      const snap = await activeRef.get();
      if (!snap.exists) return { ok: false, error: "USER_NOT_FOUND" };

      const data = snap.data();
      const expiry = data.expiryDate ? new Date(data.expiryDate) : new Date();
      expiry.setDate(expiry.getDate() + (days || 30));

      await activeRef.update({
        expiryDate: expiry.toISOString(),
        updatedBy: caller,
      });

      return { ok: true, status: "EXTENDED" };
    }

    // ⚫ Expire user
    if (action === "expire") {
      await activeRef.update({ status: "expired" });
      return { ok: true, status: "EXPIRED" };
    }

    return { ok: false, error: "INVALID_ACTION" };
  } catch (err) {
    console.error("❌ adminUsers error:", err);
    return { ok: false, error: err.message };
  }
});

export const fetchUsers = onCall({ region: "asia-south1" }, async (req, ctx) => {
  const { email } = ctx.auth?.token || {};
  if (!email) return { ok: false, error: "UNAUTHORIZED" };
});
