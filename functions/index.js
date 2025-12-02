// ✅ Import Firebase Functions (v2 syntax)
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import admin from "firebase-admin";

// ✅ Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp();
  logger.info("✅ Firebase Admin initialized successfully");
} else {
  logger.info("ℹ️ Firebase Admin already initialized");
}

// ✅ Import your main backend logic
import { generateFile } from "./generateFile.js";

// ✅ Setup global CORS handler
const corsHandler = cors({ origin: true });

// ✅ Health Check (region: asia-south1)
export const healthCheck = onRequest({ region: "asia-south1" }, (req, res) => {
  corsHandler(req, res, () => {
    res.status(200).json({
      status: "ok",
      region: "asia-south1",
      message: "🔥 Firebase backend (Functions v2) is running fine in Asia!",
    });
  });
});

// ✅ Export generateFile function (your main logic)
export const generateFileAsia = onRequest(
  { region: "asia-south1" },
  generateFile
);

// ✅ Add this line to include the email sender
export { sendEmailCode } from "./sendEmailCode.js";
