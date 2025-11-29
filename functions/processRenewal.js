/**
 * functions/processRenewal.js
 * Region: asia-southeast1
 * Node v20
 *
 * Body:
 * {
 *   id: "USER_ID",
 *   action: "approve" | "reject",
 *   meta: { extendDays?: number, reason?: string }
 * }
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.processRenewal = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

      if (req.method === "OPTIONS") return res.status(204).send("");

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Use POST" });
      }

      const { id, action, meta = {} } = req.body || {};

      if (!id || !action) {
        return res.status(400).json({ error: "Missing id or action" });
      }

      const docRef = db.collection("subscriptions").doc(id);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const data = snap.data() || {};
      const now = admin.firestore.Timestamp.now();

      // === APPROVE LOGIC ===
      if (action === "approve") {
        const extendDays = parseInt(meta.extendDays || 30, 10);

        let newExpiry;

        if (data.expiry && data.expiry.toDate) {
          // If already had expiry, extend from existing
          const old = data.expiry.toDate();
          const updated = new Date(old.getTime() + extendDays * 86400000);
          newExpiry = admin.firestore.Timestamp.fromDate(updated);
        } else {
          // No previous expiry → start from today
          const updated = new Date(Date.now() + extendDays * 86400000);
          newExpiry = admin.firestore.Timestamp.fromDate(updated);
        }

        await docRef.set(
          {
            expiry: newExpiry,
            renewStatus: "approved",
            lastRenewActionAt: now,
            lastRenewAction: "approved",
            lastRenewMeta: meta,
          },
          { merge: true }
        );

        return res.status(200).json({
          success: true,
          message: "Renewal approved",
          expiry: newExpiry.toDate().toISOString(),
        });
      }

      // === REJECT LOGIC ===
      if (action === "reject") {
        await docRef.set(
          {
            renewStatus: "rejected",
            lastRenewActionAt: now,
            lastRenewAction: "rejected",
            lastRenewMeta: meta,
          },
          { merge: true }
        );

        return res.status(200).json({
          success: true,
          message: "Renewal rejected"
        });
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (err) {
      console.error("processRenewal error:", err);
      return res.status(500).json({ error: err.message || String(err) });
    }
  });
