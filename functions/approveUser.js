// functions/approveUser.js
// -----------------------------------------------------------------------------
// ✅ Approve User (Moves user from pendingUsers → approvedUsers)
// -----------------------------------------------------------------------------

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "./init.js";

const db = admin.firestore();

/**
 * 🔹 approveUser()
 * Moves a user from `pendingUsers` → `approvedUsers`
 * - Sets plan, expiry, and approval metadata
 * - Ensures idempotency (skips if already approved)
 */
export const approveUser = onRequest({ region: "asia-south1" }, async (req, res) => {
  try {
    const { uid, plan, approvedBy } = req.body;

    if (!uid || !plan || !approvedBy) {
      return res.status(400).json({
        ok: false,
        error: "MISSING_FIELDS",
        message: "uid, plan, and approvedBy are required.",
      });
    }

    logger.info(`⚙️ Approving user: ${uid}, Plan: ${plan}`);

    // Check if user already approved
    const approvedDoc = await db.collection("approvedUsers").doc(uid).get();
    if (approvedDoc.exists) {
      logger.warn(`ℹ️ User ${uid} is already in approvedUsers`);
      return res.status(200).json({ ok: true, status: "ALREADY_APPROVED" });
    }

    // Fetch from pendingUsers
    const pendingDoc = await db.collection("pendingUsers").doc(uid).get();
    if (!pendingDoc.exists) {
      logger.warn(`❌ No pending user found for UID: ${uid}`);
      return res.status(404).json({ ok: false, error: "NOT_PENDING" });
    }

    const data = pendingDoc.data();

    // Calculate expiry based on plan
    const planDays =
      plan === "plan90" ? 90 : plan === "plan180" ? 180 : plan === "plan365" ? 365 : 0;
    const expiryDate = new Date(Date.now() + planDays * 86400000);

    // Move to approvedUsers
    await db.collection("approvedUsers").doc(uid).set({
      ...data,
      plan,
      approvedBy,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiryDate,
      status: "approved",
    });

    // Remove from pendingUsers
    await db.collection("pendingUsers").doc(uid).delete();

    logger.info(`✅ User ${uid} approved successfully under ${plan}`);
    res.status(200).json({ ok: true, status: "APPROVED" });
  } catch (err) {
    logger.error("❌ approveUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export { approveUser };
