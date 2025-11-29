/**
 * functions/getUserSubscription.js
 * Region: asia-southeast1
 * Node v20 compatible
 *
 * Usage:
 *  - GET /?uid=USER_ID
 *  - (or POST with JSON body { uid: "USER_ID" })
 *
 * Returns:
 * {
 *   plan, status, expiry, deviceId, renewProof
 * }
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const FALLBACK_PROOF = "/mnt/data/de68c37b-b309-4a65-a1aa-f499a9f387b7.png";

exports.getUserSubscription = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      if (req.method === "OPTIONS") return res.status(204).send("");

      const q = req.method === "GET" ? req.query : req.body;
      const uid = q.uid;

      if (!uid) {
        return res.status(400).json({ error: "Missing uid parameter" });
      }

      const docRef = db.collection("subscriptions").doc(uid);
      const snap = await docRef.get();

      if (!snap.exists) {
        return res.status(200).json({
          plan: null,
          status: null,
          expiry: null,
          deviceId: null,
          renewProof: FALLBACK_PROOF,
        });
      }

      const d = snap.data() || {};
      const expiryIso = d.expiry && d.expiry.toDate ? d.expiry.toDate().toISOString() : (d.expiry || null);

      return res.status(200).json({
        plan: d.plan || null,
        status: d.status || null,
        expiry: expiryIso,
        deviceId: d.deviceId || null,
        renewProof: d.renewProof || FALLBACK_PROOF,
        raw: d,
      });
    } catch (err) {
      console.error("getUserSubscription error:", err);
      return res.status(500).json({ error: err.message || String(err) });
    }
  });
