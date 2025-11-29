import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();

export const verifyDeviceOtp = onCall(
  { region: "asia-south1" },
  async (req) => {
    const { email, otp } = req.data;

    const safeEmail = email.replace(".", "_");
    const otpSnap = await db.ref(`pendingOtp/${safeEmail}`).once("value");
    const otpRecord = otpSnap.val();

    if (!otpRecord) {
      return { ok: false, error: "NO_OTP_FOUND" };
    }

    if (otpRecord.otp !== otp) {
      return { ok: false, error: "WRONG_OTP" };
    }

    // SAVE DEVICE
    await db.ref(`devices/${safeEmail}/${otpRecord.fingerprint}`).set({
      approved: true,
      created: Date.now(),
      lastLogin: Date.now(),
    });

    // CLEAN OTP
    await db.ref(`pendingOtp/${safeEmail}`).remove();

    return { ok: true };
  }
);
