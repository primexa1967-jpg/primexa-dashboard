// functions/index.js
// -----------------------------------------------------------------------------
// ✅ Firebase Functions Entry Point (v2)
// -----------------------------------------------------------------------------

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import admin from "firebase-admin";

// -----------------------------------------------------------------------------
// 🔧 Initialize Firebase Admin (Safe Singleton)
// -----------------------------------------------------------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://fnodatadashboardstreamlite-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
  logger.info("✅ Firebase Admin initialized successfully");
} else {
  logger.info("ℹ️ Firebase Admin already initialized");
}

// -----------------------------------------------------------------------------
// 🌍 CORS Middleware Setup
// -----------------------------------------------------------------------------
const corsHandler = cors({ origin: true });

// -----------------------------------------------------------------------------
// 🩺 Health Check Endpoint
// -----------------------------------------------------------------------------
export const healthCheck = onRequest({ region: "asia-south1" }, (req, res) => {
  corsHandler(req, res, () => {
    res.status(200).json({
      status: "ok",
      region: "asia-south1",
      message: "🔥 Firebase backend (Functions v2) active and healthy",
      time: new Date().toISOString()
    });
  });
});

// -----------------------------------------------------------------------------
// 📦 Import Backend Modules (All Function Groups)
// -----------------------------------------------------------------------------

// ✅ Core generation / utilities
import { generateFile } from "./generateFile.js";
export const generateFileAsia = onRequest({ region: "asia-south1" }, generateFile);

// ✅ Authentication and login
export { sendEmailCode } from "./sendEmailCode.js";
export { login } from "./auth/login.js";
export { planHandler } from "./auth/plan.js";

// ✅ Admin tools (for approving/rejecting users, managing plans, etc.)
export { adminPlans } from "./admin/adminPlans.js";
export { adminUsers } from "./admin/adminUsers.js";
export { fetchUsers } from "./fetchUsers.js";

// ✅ Option ladder (market data + DHAN API integration)
export { fetchOptionLadder } from "./fetchOptionLadder.js";
export { activateUser } from "./activateUser.js";
export { approveUser } from "./approveUser.js";
logger.info("✅ All backend functions exported successfully (asia-south1)");
