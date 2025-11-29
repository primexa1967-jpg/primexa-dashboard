/**
 * ================================================================
 *  PRIMEXA Option Buyer’s Dashboard — Backend Entry (index.js)
 * ================================================================
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// ✅ Initialize Firebase Admin
try {
  admin.initializeApp();
  console.log("✅ Firebase Admin initialized successfully");
} catch (err) {
  console.warn("⚠️ Firebase Admin already initialized:", err.message);
}

// ✅ Import Cloud Function modules
const generateFile = require("./generateFile");

// ✅ Export all modules
exports.generateFile = generateFile.generateFile;

// ✅ Health Check endpoint
exports.healthCheck = functions
  .region("asia-south1")
  .https.onRequest((req, res) => {
    res.status(200).json({
      status: "ok",
      message: "PRIMEXA backend running successfully 🚀",
      region: "asia-south1",
      time: new Date().toISOString(),
    });
  });
