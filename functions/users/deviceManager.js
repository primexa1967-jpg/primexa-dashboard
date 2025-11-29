import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "../init.js";

const db = admin.database();

export const manageDevice = onCall(
  { region: "asia-south1" },
  async (req) => {
    const { email, role, fingerprint } = req.data;

    const safeEmail = email.replace(/\./g, "_");
    const devRef = db.ref(`devices/${safeEmail}`);
    const snap = await devRef.once("value");

    let devices = snap.val() || {};

    const limits = {
      superadmin: 3,
      admin: 1,
      user: 2,
    };

    const maxDevices = limits[role] || 2;

    if (devices[fingerprint]) {
      await devRef.child(fingerprint).update({
        lastLogin: Date.now(),
      });
      return { ok: true, status: "EXISTING_DEVICE" };
    }

    const keys = Object.keys(devices);

    if (keys.length >= maxDevices) {
      const oldest = keys.sort(
        (a, b) => devices[a].created - devices[b].created
      )[0];

      await devRef.child(oldest).remove();
      logger.log("Old device removed:", oldest);
    }

    await devRef.child(fingerprint).set({
      approved: true,
      created: Date.now(),
      lastLogin: Date.now(),
    });

    await db.ref(`logs/device/${safeEmail}`).push({
      event: "DEVICE_ADDED",
      fingerprint,
      time: Date.now(),
    });

    return { ok: true, status: "NEW_DEVICE_SAVED" };
  }
);
