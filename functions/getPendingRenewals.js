/**
 * functions/getPendingRenewals.js
 * Region: asia-southeast1
 * Node v20 compatible
 *
 * Returns all subscription renewal requests with renewStatus == "pending"
 * Response:
 * {
 *   requests: [
 *     { id, uid, plan, renewProof, renewRequestedAt, renewStatus, extendDays, raw }
 *   ]
 * }
 *
 * Note: renewProof uses the local path from conversation session which your tooling will convert:
 * "/mnt/data/de68c37b-b309-4a65-a1aa-f499a9f387b7.png"
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const FALLBACK_PROOF_PATH = "/mnt/data/de68c37b-b309-4a65-a1aa-f499a9f387b7.png";

exports.getPendingRenewals = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      if (req.method === "OPTIONS") return res.status(204).send("");

      // Query subscriptions collection for docs where renewStatus == "pending"
      const q = db.collection("subscriptions").where("renewStatus", "==", "pending").orderBy("renewRequestedAt", "desc");
      const snap = await q.get();

      const requests = [];
      snap.forEach(doc => {
        const d = doc.data() || {};
        requests.push({
          id: doc.id, // doc id (usually uid)
          uid: doc.id,
          plan: d.plan || null,
          renewProof: d.renewProof || FALLBACK_PROOF_PATH,
          renewRequestedAt: d.renewRequestedAt ? (d.renewRequestedAt.toDate ? d.renewRequestedAt.toDate().toISOString() : d.renewRequestedAt) : null,
          renewStatus: d.renewStatus || "pending",
          extendDays: (d.renewMeta && d.renewMeta.extendDays) || null,
          raw: d
        });
      });

      return res.status(200).json({ requests });
    } catch (err) {
      console.error("getPendingRenewals error:", err);
      return res.status(500).json({ error: err.message || String(err) });
    }
  });
