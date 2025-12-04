import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";

const db = admin.database();

/**
 * 🔐 login — Role-based login control + device limits
 * -------------------------------------------------
 * Roles:
 * - superadmin → 3 devices
 * - admin → 1 device
 * - user (paid) → 2 devices
 * - new / unpaid user → redirected to plan page
 */
export const login = onCall(
  { region: "asia-south1" },
  async (req) => {
    // ✅ Require verified Google email
    if (!req.auth || !req.auth.token.email_verified) {
      return { ok: false, status: "UNAUTHORIZED_OR_UNVERIFIED" };
    }

    const email = req.auth.token.email;
    const safeEmail = email.replace(/\./g, "_");
    const deviceId = req.data.deviceId || "unknown-device";

    // 🔹 Reference to user node
    const userRef = db.ref(`users/${safeEmail}`);
    const snapshot = await userRef.once("value");
    const user = snapshot.val();

    // 🆕 First-time login → redirect to Plan Page
    if (!user) {
      await userRef.set({
        email,
        role: "new_user",
        devices: [deviceId],
        createdAt: Date.now(),
        lastLogin: Date.now(),
        approved: false,
        planStatus: "pending",
      });

      return {
        ok: true,
        status: "NEW_USER_REDIRECT",
        redirect: "/plan",
        message: "Please select a plan and complete payment.",
      };
    }

    // 🔹 Role-based device limits
    const role = user.role || "user";
    let deviceLimit = 2; // default for paid user

    if (role === "superadmin") deviceLimit = 3;
    if (role === "admin") deviceLimit = 1;
    if (role === "new_user" || user.approved === false) {
      return {
        ok: false,
        status: "PLAN_PENDING",
        redirect: "/plan",
        message: "Payment not verified or plan not approved.",
      };
    }

    // 🔹 Device management
    const devices = user.devices || [];
    if (!devices.includes(deviceId)) {
      if (devices.length >= deviceLimit) {
        devices.shift(); // remove oldest
      }
      devices.push(deviceId);
    }

    // 🕒 Update user data
    await userRef.update({
      devices,
      lastLogin: Date.now(),
    });

    return {
      ok: true,
      status: "LOGIN_OK",
      role,
      devices,
      deviceLimit,
    };
  }
);
