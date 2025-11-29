const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.sendOtp = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const { name, email, mobile } = req.body;

      if (!name || !email || !mobile) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await db.collection("otp").doc(mobile).set(
        {
          name,
          email,
          mobile,
          otp,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      res.json({ success: true, otp }); // temporary return OTP for testing
    } catch (e) {
      console.error("sendOtp error:", e);
      res.status(500).json({ success: false });
    }
  });
