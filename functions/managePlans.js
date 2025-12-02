import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

// ✅ Ensure Firebase Admin is initialized
if (!admin.apps.length) {
  admin.initializeApp();
  logger.info("✅ Firebase Admin initialized (managePlans.js)");
}
const db = admin.firestore();

/**
 * 🔹 Cloud Function: managePlans
 * - Only Superadmin can Add / Update / Delete Plans
 * - Request body must include `action` (add / update / delete)
 */
export const managePlans = onRequest({ region: "asia-south1" }, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }

    try {
      const { action, email, planId, name, durationDays, price, active } =
        req.body;

      if (!action || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // ✅ Allow only Superadmin
      if (email !== "primexa1967@gmail.com") {
        return res.status(403).json({
          error: "Access denied. Only Superadmin can manage plans.",
        });
      }

      const plansRef = db.collection("plans");

      if (action === "add") {
        if (!name || !durationDays || !price) {
          return res.status(400).json({ error: "Missing plan details" });
        }

        const newPlan = {
          name,
          durationDays: Number(durationDays),
          price: Number(price),
          active: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: email,
        };

        const docRef = await plansRef.add(newPlan);
        logger.info(`✅ Plan added: ${name} (${docRef.id})`);
        return res.status(200).json({ ok: true, id: docRef.id, ...newPlan });
      }

      if (action === "update") {
        if (!planId) {
          return res.status(400).json({ error: "Missing planId for update" });
        }

        await plansRef.doc(planId).update({
          name,
          durationDays: Number(durationDays),
          price: Number(price),
          active,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: email,
        });

        logger.info(`🟡 Plan updated: ${planId}`);
        return res.status(200).json({ ok: true, message: "Plan updated" });
      }

      if (action === "delete") {
        if (!planId) {
          return res.status(400).json({ error: "Missing planId for delete" });
        }

        await plansRef.doc(planId).delete();
        logger.info(`❌ Plan deleted: ${planId}`);
        return res.status(200).json({ ok: true, message: "Plan deleted" });
      }

      return res.status(400).json({ error: "Invalid action type" });
    } catch (err) {
      logger.error("❌ managePlans Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
});
