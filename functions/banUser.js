const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.banUser = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.json({ success: false, message: "Missing uid" });
      }

      await db.collection("activeUsers").doc(uid).set(
        {
          banned: true,
        },
        { merge: true }
      );

      res.json({ success: true });
    } catch (err) {
      console.error("banUser error:", err);
      res.json({ success: false });
    }
  });
