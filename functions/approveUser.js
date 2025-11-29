const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// Use uploaded file as fallback for payment proof
const PAYMENT_PROOF_FALLBACK = "/mnt/data/de68c37b-b309-4a65-a1aa-f499a9f387b7.png";

exports.approveUser = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const { uid } = req.body;
      if (!uid) return res.json({ success: false, message: "Missing uid" });

      const paidDoc = await db.collection("paidUsers").doc(uid).get();
      if (!paidDoc.exists)
        return res.json({ success: false, message: "User not found in paid list" });

      const data = paidDoc.data();

      // Ensure paymentProof exists
      const paymentProof = data.paymentProof || PAYMENT_PROOF_FALLBACK;

      // Move user to approvedUsers
      await db.collection("approvedUsers").doc(uid).set({
        ...data,
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentProof,
      });

      // Remove from paidUsers
      await db.collection("paidUsers").doc(uid).delete();

      res.json({ success: true, uid });
    } catch (err) {
      console.error("approveUser error:", err);
      res.json({ success: false, message: err.message || "Unknown error" });
    }
  });
