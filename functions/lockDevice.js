/**
 * functions/lockDevice.js
 * Region: asia-southeast1
 * Node v20
 *
 * Binds a device to a user account.
 * Body:
 * {
 *   uid: "USER_ID",
 *   deviceId: "unique-device-id"
 * }
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const FALLBACK_IMAGE = "/mnt/data/de68c37b-b309-4a65-a1aa-f499a9f387b7.png";

exports.lockDevice = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.set("Access-Control-Allow-Methods", "POST,OPTIONS");

      if (req.method === "OPTIONS") return res.status(204).send("");
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Use POST" });
      }

      const { uid, deviceId } = req.body || {};

      if (!uid || !deviceId) {
        return res.status(400).json({ error: "uid and deviceId required" });
      }

      const docRef = db.collection("subscriptions").doc(uid);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      await docRef.set(
        {
          deviceId,
          deviceLinkedAt: admin.firestore.Timestamp.now(),
          deviceProof: FALLBACK_IMAGE
        },
        { merge: true }
      );

      return res.status(200).json({
        success: true,
        message: "Device locked to user",
        uid,
        deviceId
      });

    } catch (err) {
      console.error("lockDevice error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
