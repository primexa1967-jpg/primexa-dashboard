const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.getAdminStats = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const pending = (await db.collection("pendingUsers").get()).size;
      const paid = (await db.collection("paidUsers").get()).size;
      const approved = (await db.collection("approvedUsers").get()).size;

      const activeSnap = await db.collection("activeUsers").get();
      const active = activeSnap.size;

      let expired = 0;
      const now = Date.now();
      activeSnap.forEach(doc => {
        const expiry = doc.data().expiry;
        if (expiry && new Date(expiry).getTime() < now) expired++;
      });

      res.json({
        success: true,
        stats: {
          pending,
          paid,
          approved,
          active,
          expired
        }
      });
    } catch (err) {
      console.error("getAdminStats error:", err);
      res.json({ success: false });
    }
  });
