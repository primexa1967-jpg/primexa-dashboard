// functions/activateUser.js
// -----------------------------------------------------------------------------
// ✅ Activate User (Moves user from approvedUsers → activeUsers)
// -----------------------------------------------------------------------------

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "./init.js"; // ✅ Uses your shared init.js (Firestore + Auth)
const db = admin.firestore();

/**
 * 🔹 activateUser()
 * Moves a user from `approvedUsers` → `activeUsers`
 * - Adds activation timestamp
 * - Removes from approved list
 * - Ensures safety if user already active
 */
export const activateUser = onRequest({ region: "asia-south1" }, async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ ok: false, error: "MISSING_UID" });
    }

    logger.info(`⚙️ Activating user: ${uid}`);

    // Check if already active
    const activeDoc = await db.collection("activeUsers").doc(uid).get();
    if (activeDoc.exists) {
      logger.warn(`User ${uid} is already active`);
      return res.status(200).json({ ok: true, status: "ALREADY_ACTIVE" });
    }

    // Fetch from approved list
    const approvedDoc = await db.collection("approvedUsers").doc(uid).get();
    if (!approvedDoc.exists) {
      logger.warn(`❌ No approved user found for UID: ${uid}`);
      return res.status(404).json({ ok: false, error: "NOT_APPROVED" });
    }

    const data = approvedDoc.data();

    // Move to activeUsers
    await db.collection("activeUsers").doc(uid).set({
      ...data,
      status: "active",
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      activatedBy: data?.approvedBy || "system",
    });

    // Remove from approvedUsers
    await db.collection("approvedUsers").doc(uid).delete();

    logger.info(`✅ User ${uid} moved to activeUsers successfully`);
    res.status(200).json({ ok: true, status: "ACTIVATED" });
  } catch (err) {
    logger.error("❌ activateUser error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
