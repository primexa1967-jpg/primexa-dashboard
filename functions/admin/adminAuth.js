/**
 * adminAuth.js
 * Role- and device-based access control middleware
 * for Firebase Cloud Functions (Asia-South1)
 */

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Verify role (admin / superadmin) and enforce device limits
 */
exports.verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;
    if (!email) return res.status(401).json({ error: "Invalid token (no email)" });

    // Device ID is sent from frontend on every request
    const deviceId = req.headers["x-device-id"];
    if (!deviceId) {
      return res.status(400).json({ error: "Device ID missing in headers" });
    }

    // --- Fetch user record ---
    const userRef = db.collection("activeUsers").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return res.status(403).json({ error: "User not active" });

    const user = userSnap.data();
    if (!user.approved) return res.status(403).json({ error: "User not approved" });
    if (!["admin", "superadmin"].includes(user.role))
      return res.status(403).json({ error: "Insufficient privileges" });

    // --- Device management logic ---
    const devices = Array.isArray(user.devices) ? user.devices : [];
    const maxAllowed =
      user.role === "superadmin" ? 3 : user.role === "admin" ? 1 : 2;

    let updatedDevices = devices;

    if (!devices.includes(deviceId)) {
      if (devices.length < maxAllowed) {
        updatedDevices = [...devices, deviceId];
      } else {
        // remove oldest, keep most recent
        updatedDevices = [...devices.slice(1), deviceId];
      }

      await userRef.update({
        devices: updatedDevices,
        lastDevice: deviceId,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await userRef.update({
        lastDevice: deviceId,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Attach verified info
    req.user = { uid, email, role: user.role, deviceId };
    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    res.status(401).json({ error: "Unauthorized or expired token" });
  }
};

/**
 * Verify Superadmin only (primexa1967@gmail.com)
 * also enforces its own device limit (3)
 */
exports.verifySuperadmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    const uid = decoded.uid;
    const deviceId = req.headers["x-device-id"];

    if (email !== "primexa1967@gmail.com") {
      return res.status(403).json({ error: "Superadmin access only" });
    }
    if (!deviceId) return res.status(400).json({ error: "Device ID missing" });

    const userRef = db.collection("activeUsers").doc(uid);
    const snap = await userRef.get();
    const data = snap.exists ? snap.data() : {};
    const devices = Array.isArray(data.devices) ? data.devices : [];

    let updatedDevices = devices;
    if (!devices.includes(deviceId)) {
      if (devices.length < 3) {
        updatedDevices = [...devices, deviceId];
      } else {
        updatedDevices = [...devices.slice(1), deviceId];
      }
      await userRef.set(
        {
          email,
          role: "superadmin",
          devices: updatedDevices,
          lastDevice: deviceId,
          approved: true,
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    req.user = { uid, email, role: "superadmin", deviceId };
    next();
  } catch (err) {
    console.error("verifySuperadmin error:", err);
    res.status(401).json({ error: "Unauthorized or expired token" });
  }
};
