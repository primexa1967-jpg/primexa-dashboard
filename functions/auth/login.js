import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();

export const loginUser = onCall(
  { region: "asia-south1" },
  async (req) => {
    const { email, mobile } = req.data;

    const safeEmail = email.replace(/\./g, "_");

    // validate user exist
    const userRef = db.ref(`users/${safeEmail}`);
    const userSnap = await userRef.once("value");
    const user = userSnap.val();

    if (!user) {
      return { ok: false, status: "NEW_USER" };
    }

    // check mobile matches
    if (user.mobile !== mobile) {
      return { ok: false, status: "MOBILE_MISMATCH" };
    }

    return {
      ok: true,
      status: "LOGIN_OK",
      role: user.role || "user"
    };
  }
);
