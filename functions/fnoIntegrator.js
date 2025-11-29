import * as functions from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "./init.js";

const db = admin.database();

// ------------------------- RANGE MODEL -------------------------
function vixRange(close, vixPercent, days) {
  const v = Number(vixPercent) / 100;
  const t = Math.sqrt(days / 365);
  const R = close * v * t;
  return {
    lower: close - R,
    upper: close + R,
  };
}

// ------------------------- BUILT-UP MODEL -------------------------
function classifyBuiltUp(prevOi, currOi, prevVol, currVol) {
  if (!prevOi) return "NA";

  const oiChg = ((currOi - prevOi) / prevOi) * 100;
  const volChg = ((currVol - prevVol) / Math.max(prevVol, 1)) * 100;

  if (oiChg > 5 && volChg > 10) return "LB";
  if (oiChg < -5 && volChg > 10) return "SC";
  if (oiChg < -5 && volChg < 10) return "LU";
  if (oiChg > 5 && volChg < 10) return "SB";

  return "NEU";
}

// ------------------------- MAIN FUNCTION -------------------------
export const fnoIntegrator = functions.onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Only POST allowed");
      }

      const body = req.body;
      const symbol = body.symbol;
      const meta = body.meta || {};
      const strikes = body.strikes || [];

      if (!symbol) {
        return res.status(400).send("symbol required");
      }

      const updates = {};

      for (const s of strikes) {
        const strikeKey = `${s.side}_${s.strike}`;
        const prev = s.prev || {};

        const row = {
          symbol,
          strike: s.strike,
          side: s.side,
          ltp: Number(s.ltp || 0),
          changePct: Number(s.changePct || 0),
          open: Number(s.open || 0),
          high: Number(s.high || 0),
          low: Number(s.low || 0),
          volume: Number(s.volume || 0),
          oi: Number(s.oi || 0),
          oiChg: prev.oi ? (((s.oi - prev.oi) / prev.oi) * 100).toFixed(2) : "0",
          iv: Number(s.iv || 0).toFixed(2),
          ivChg: Number(s.ivChange || 0).toFixed(2),
          pcr: Number(s.pcr || 0).toFixed(2),
          premium: Number(s.premium || 0).toFixed(2),
          decay: Number(s.decay || 0).toFixed(2),
          trend: "Sideways",

          builtUp: classifyBuiltUp(
            prev.oi,
            s.oi,
            prev.volume || 0,
            s.volume || 0
          ),

          rangeBreak: {
            daily: vixRange(meta.close || 0, meta.vix || 12, 1),
            weekly: vixRange(meta.close || 0, meta.vix || 12, 5),
            monthly: vixRange(meta.close || 0, meta.vix || 12, 30),
          },

          signal: s.signal || "WAIT",

          meta: {
            vix: meta.vix || 12,
            close: meta.close || 0,
            updatedAt: Date.now(),
          },
        };

        updates[`/dashboard/fnoData/${symbol}/${strikeKey}`] = row;
      }

      await db.ref().update(updates);

      return res.status(200).send({ ok: true, count: strikes.length });
    } catch (err) {
      logger.error("fnoIntegrator error:", err);
      return res.status(500).send({ ok: false, error: err.message });
    }
  }
);
