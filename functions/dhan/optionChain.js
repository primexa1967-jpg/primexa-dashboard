import { onValueWritten } from "firebase-functions/v2/database";
import * as logger from "firebase-functions/logger";
import admin from "../admin.js";

const db = admin.database();

// RTDB TRIGGERS SUPPORTED ONLY IN us-central1
export const processOptionChain = onValueWritten(
  {
    ref: "/market_data/raw",
    region: "asia-southeast1",
  },
  async (event) => {
    try {
      const data = event.data.after.val();
      if (!data) return;

      const {
        symbol,
        strikePrice,
        optionType,
        lastPrice,
        openInterest,
        volume,
        underlyingValue,
      } = data;

      if (!symbol || !strikePrice || !optionType) {
        logger.warn("Missing fields in raw tick");
        return;
      }

      const instr = symbol.replace(/\./g, "_");
      const strike = String(strikePrice);
      const side = optionType === "CE" ? "CE" : "PE";

      const writePath = `market_data/${instr}/strikes/${strike}/${side}`;

      const payload = {
        lastPrice: Number(lastPrice || 0),
        oi: Number(openInterest || 0),
        vol: Number(volume || 0),
        underlyingValue: Number(underlyingValue || 0),
        updated: Date.now(),
      };

      await db.ref(writePath).set(payload);

      await db.ref("market_data/current").update({
        lastSymbol: instr,
        lastUpdated: Date.now(),
        underlyingValue: Number(underlyingValue || 0),
      });

      return { ok: true };
    } catch (err) {
      logger.error("processOptionChain error:", err);
      return { ok: false, error: err.message };
    }
  }
);
