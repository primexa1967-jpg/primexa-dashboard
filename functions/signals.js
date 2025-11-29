/**
 * functions/signals.js
 * Region: asia-southeast1
 * Node v20 compatible
 *
 * Provides placeholder signals data for users.
 * Uses uploaded file path as signal image URL.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const SIGNAL_IMAGE_PATH = "/mnt/data/de68c37b-b309-4a65-a1aa-f499a9f387b7.png";

exports.signals = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      if (req.method === "OPTIONS") return res.status(204).send("");

      // Placeholder signals data
      const signals = [
        { id: 1, title: "Buy Signal", type: "buy", image: SIGNAL_IMAGE_PATH },
        { id: 2, title: "Sell Signal", type: "sell", image: SIGNAL_IMAGE_PATH },
        { id: 3, title: "Hold Signal", type: "hold", image: SIGNAL_IMAGE_PATH }
      ];

      return res.status(200).json({ signals });
    } catch (err) {
      console.error("signals error:", err);
      return res.status(500).json({ error: err.message || String(err) });
    }
  });
