import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "../init.js";           // ✅ FIXED — correct import
import { startFeed, stopFeed } from "./dhanConnector.js";

const REGION = "asia-south1";
const SUPERADMIN_EMAIL = "primexa1967@gmail.com";

export const startDhanFeed = onCall(
  { region: REGION },
  async (req, ctx) => {
    if (ctx.auth.token.email !== SUPERADMIN_EMAIL)
      return { ok: false, error: "NOT_SUPERADMIN" };

    logger.log("Starting Dhan Feed...");
    await startFeed();
    return { ok: true };
  }
);

export const stopDhanFeed = onCall(
  { region: REGION },
  async (req, ctx) => {
    if (ctx.auth.token.email !== SUPERADMIN_EMAIL)
      return { ok: false, error: "NOT_SUPERADMIN" };

    logger.log("Stopping Dhan Feed...");
    await stopFeed();
    return { ok: true };
  }
);
