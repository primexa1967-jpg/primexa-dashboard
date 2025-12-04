// functions/init.js
// -----------------------------------------------------------------------------
// ✅ Firebase Admin Initialization (Shared across all Functions)
// -----------------------------------------------------------------------------

import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// -----------------------------------------------------------------------------
// 🔧 Initialize Admin SDK (safe singleton)
// -----------------------------------------------------------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL:
      "https://fnodatadashboardstreamlite-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
  logger.info("✅ Firebase Admin initialized (Firestore + Auth ready)");
} else {
  logger.info("ℹ️ Firebase Admin already initialized");
}

// -----------------------------------------------------------------------------
// 🔗 Firestore & Realtime DB references
// -----------------------------------------------------------------------------
const db = admin.firestore();
const rtdb = admin.database();

// -----------------------------------------------------------------------------
// 📦 Exports (for all other functions)
// -----------------------------------------------------------------------------
export { admin, db, rtdb };

// Optional default export for backward compatibility
export default admin;
