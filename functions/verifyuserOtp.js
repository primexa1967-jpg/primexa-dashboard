const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.verifyOtp = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const { email, mobile, otp } = req.body;

      if (!email || !mobile || !otp) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }

      const otpDoc = await db.collection("otp").doc(mobile).get();
      if (!otpDoc.exists)
        return res.status(404).json({ success: false, message: "OTP not found" });

      const data = otpDoc.data();
      if (data.otp !== otp)
        return res.status(400).json({ success: false, message: "Invalid OTP" });

      // OTP Valid → Move user to pending list
      await db.collection("pendingUsers").doc(mobile).set({
        name: data.name,
        email,
        mobile,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true });
    } catch (e) {
      console.error("verifyOtp error:", e);
      res.status(500).json({ success: false });
    }
  });
