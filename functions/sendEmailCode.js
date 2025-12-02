/**
 * sendEmailCode.js
 * Sends registration or verification codes via Gmail SMTP.
 * Compatible with Firebase Functions v7+ (.env params)
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import nodemailer from "nodemailer";
import admin from "firebase-admin";

const corsHandler = cors({ origin: true });

// ✅ Define secrets (but do NOT access .value() here)
const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_PASS = defineSecret("GMAIL_PASS");

// ✅ Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
  logger.info("✅ Firebase Admin initialized (sendEmailCode.js)");
}
const db = admin.firestore();

/**
 * 🔹 Cloud Function: sendEmailCode
 */
export const sendEmailCode = onRequest(
  { region: "asia-south1", secrets: [GMAIL_USER, GMAIL_PASS] },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
      }

      try {
        // ✅ Access secret values only at runtime
        const gmailUser = GMAIL_USER.value();
        const gmailPass = GMAIL_PASS.value();

        const { toEmail, code, plan, validityDays } = req.body;
        if (!toEmail || !code) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Create transporter inside the request (runtime secrets)
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const mailOptions = {
          from: `"Primexa Dashboard" <${gmailUser}>`,
          to: toEmail,
          subject: "Your Primexa Registration Code",
          html: `
            <div style="font-family:Arial,sans-serif;padding:20px;">
              <h2>Welcome to PRIMEXA Dashboard</h2>
              <p>Your registration code is:</p>
              <h3 style="color:#007bff;">${code}</h3>
              <p>Plan: <b>${plan || "Trial"}</b></p>
              <p>Validity: <b>${validityDays || 90} days</b></p>
              <p>Please enter this code during registration to activate your account.</p>
              <br/>
              <p>— Team Primexa</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        logger.info(`✅ Email sent to ${toEmail}`);

        await db.collection("logs").add({
          toEmail,
          code,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          type: "emailCode",
        });

        return res.status(200).json({ ok: true, message: "Email sent successfully" });
      } catch (error) {
        logger.error("❌ sendEmailCode Error:", error);
        res.status(500).json({ error: error.message });
      }
    });
  }
);
