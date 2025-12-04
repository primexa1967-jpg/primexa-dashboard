import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();

export const planHandler = onCall(
  { region: "asia-south1" },
  async (req) => {
    const { email, code, name, mobile } = req.data;
    const safeEmail = email.replace(/\./g, "_");

    const codeRef = db.ref(`codes/${code}`);
    const codeSnap = await codeRef.once("value");
    const codeData = codeSnap.val();

    if (!codeData || codeData.used) {
      return { ok: false, status: "INVALID_CODE" };
    }

    if (new Date(codeData.validUntil) < new Date()) {
      return { ok: false, status: "CODE_EXPIRED" };
    }

    if (codeData.issuedTo && codeData.issuedTo !== email) {
      return { ok: false, status: "EMAIL_MISMATCH" };
    }

    // Mark code as used
    await codeRef.update({ used: true });

    // Create user
    const userRef = db.ref(`users/${safeEmail}`);
    await userRef.set({
      name,
      email,
      mobile,
      plan: codeData.plan,
      role: "user",
      status: "pending",
      approved: false,
      expiryDate: codeData.validUntil,
      registeredAt: new Date().toISOString(),
    });

    return { ok: true, status: "REGISTERED_PENDING" };
  }
);
