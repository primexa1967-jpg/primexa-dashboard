const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.activateUser = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid) return res.json({ success: false, message: "Missing uid" });

      const approvedDoc = await db.collection("approvedUsers").doc(uid).get();
      if (!approvedDoc.exists)
        return res.json({ success: false, message: "User not approved" });

      const data = approvedDoc.data();

      await db.collection("activeUsers").doc(uid).set({
        ...data,
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Remove from approved list
      await db.collection("approvedUsers").doc(uid).delete();

      res.json({ success: true });
    } catch (err) {
      console.error("activateUser error:", err);
      res.json({ success: false });
    }
  });
