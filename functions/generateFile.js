// ✅ Firebase Cloud Function to manage user login, registration, and admin actions
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import admin from "firebase-admin";

// ✅ Initialize Firebase Admin (once)
if (!admin.apps.length) {
  admin.initializeApp();
  logger.info("✅ Firebase Admin initialized");
}

const corsHandler = cors({ origin: true });

// ✅ MAIN FUNCTION — handles login, approval, and registration code verification
export const generateFile = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    try {
      const db = admin.firestore();
      const { email, name, deviceId, uid, action, plan, code, approvedBy } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Missing email" });
      }

      const SUPERADMIN = "primexa1967@gmail.com";
      const ADMIN = "admin@primexa.com";

      let role = "user";
      if (email === SUPERADMIN) role = "superadmin";
      else if (email === ADMIN) role = "admin";

      const pendingRef = db.collection("pendingUsers").doc(uid || email);
      const activeRef = db.collection("activeUsers").doc(uid || email);

      /* 🧩 1️⃣ LOGIN: Add new user to pending if not active */
      if (!action || action === "register") {
        await pendingRef.set(
          {
            email,
            name,
            deviceId,
            role,
            approved: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        logger.info(`🕓 User added to pending list: ${email}`);
        return res.status(200).json({
          ok: true,
          message: `User ${email} added to pending list. Awaiting approval.`,
        });
      }

      /* 🧩 2️⃣ APPROVE USER (Admin/Superadmin) */
      if (action === "approve") {
        // Fetch plan duration
        let planData = await db.collection("plans").doc(plan).get();
        let durationDays = planData.exists ? planData.data().durationDays : 90;

        // Calculate expiry
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + durationDays);

        await activeRef.set(
          {
            email,
            name,
            deviceId,
            role: "user",
            plan,
            approved: true,
            approvedBy: approvedBy || "admin",
            expiryDate: admin.firestore.Timestamp.fromDate(expiry),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        await pendingRef.delete();
        logger.info(`✅ Approved user: ${email}`);
        return res.status(200).json({ ok: true, message: `User ${email} approved for plan ${plan}` });
      }

      /* 🧩 3️⃣ VERIFY REGISTRATION CODE */
      if (action === "verifyCode") {
        const codeRef = db.collection("codes").doc(code);
        const codeSnap = await codeRef.get();

        if (!codeSnap.exists) {
          return res.status(400).json({ error: "Invalid code" });
        }

        const codeData = codeSnap.data();
        const now = new Date();

        if (codeData.used) {
          return res.status(400).json({ error: "Code already used" });
        }

        if (codeData.validUntil.toDate() < now) {
          return res.status(400).json({ error: "Code expired" });
        }

        if (codeData.issuedTo && codeData.issuedTo !== email) {
          return res.status(403).json({ error: "Code not issued to this email" });
        }

        // Activate user
        await activeRef.set(
          {
            email,
            name,
            deviceId,
            role: "user",
            plan: codeData.plan || "unknown",
            approved: true,
            approvedBy: "auto",
            expiryDate: codeData.validUntil,
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        // Mark code as used
        await codeRef.update({ used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });

        logger.info(`✅ Code verified for ${email}`);
        return res.status(200).json({ ok: true, message: "Registration verified successfully" });
      }

      /* 🧩 4️⃣ REJECT USER */
      if (action === "reject") {
        await pendingRef.delete();
        logger.info(`🚫 User rejected: ${email}`);
        return res.status(200).json({ ok: true, message: `${email} removed from pending list.` });
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (err) {
      logger.error("❌ Error handling request:", err);
      return res.status(500).json({ error: err.message });
    }
  });
});
