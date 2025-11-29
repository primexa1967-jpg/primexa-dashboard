const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.setExpiry = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const { uid, expiry } = req.body;

      if (!uid || !expiry) {
        return res.json({ success: false, message: "Missing uid or expiry" });
      }

      // Expiry should be in YYYY-MM-DD format
      await db.collection("activeUsers").doc(uid).set(
        {
          expiry,
        },
        { merge: true }
      );

      res.json({ success: true });
    } catch (err) {
      console.error("setExpiry error:", err);
      res.json({ success: false });
    }
  });
