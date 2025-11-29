import { onSchedule } from "firebase-functions/v2/scheduler";
import admin from "../init.js";

const db = admin.database();
const REGION = "asia-south1";

// --- Black�Scholes helper functions ---
function normPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
function normCdf(x) {
  return (1.0 + erf(x / Math.sqrt(2))) / 2.0;
}
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
  return sign * y;
}

// ------------------------------------------------------------
// The main worker
// ------------------------------------------------------------
export const optionMetricsWorker = onSchedule(
  {
    region: REGION,
    schedule: "every 1 minutes",
  },
  async () => {
    const rootSnap = await db.ref("market_data").once("value");
    const data = rootSnap.val() || {};

    for (let instrument in data) {
      if (instrument === "raw" || instrument === "current") continue;

      const strikes = data[instrument]?.strikes || {};
      const computedRef = db.ref(`market_data/${instrument}/computed`);
      const summaryRef = db.ref(`market_data/${instrument}/summary`);

      let totalCEVol = 0,
        totalPEVol = 0,
        totalCEOI = 0,
        totalPEOI = 0;

      const underlying =
        data[instrument]?.summary?.underlyingValue ||
        data.current?.underlyingValue ||
        0;

      // for each strike
      for (let strike in strikes) {
        const row = strikes[strike];

        let CE = row.CE || {};
        let PE = row.PE || {};

        // compute Greeks
        const t = 1 / 365; // 1-day expiry; adjust as needed
        const r = 0.07; // risk-free; from your config later
        const S = underlying;
        const K = Number(strike);

        let ceGreeks = {};
        let peGreeks = {};

        if (CE.ltp) {
          const iv = 0.2; // placeholder (your full IV solver can be added later)
          const d1 =
            (Math.log(S / K) + (r + (iv * iv) / 2) * t) /
            (iv * Math.sqrt(t));
          const d2 = d1 - iv * Math.sqrt(t);

          ceGreeks = {
            delta: normCdf(d1),
            gamma: normPdf(d1) / (S * iv * Math.sqrt(t)),
            theta:
              (-S * normPdf(d1) * iv) / (2 * Math.sqrt(t)) -
              r * K * Math.exp(-r * t) * normCdf(d2),
            vega: S * normPdf(d1) * Math.sqrt(t),
            tv_itm: Math.max(CE.ltp - Math.max(S - K, 0), 0),
          };
        }

        if (PE.ltp) {
          const iv = 0.2;
          const d1 =
            (Math.log(S / K) + (r + (iv * iv) / 2) * t) /
            (iv * Math.sqrt(t));
          const d2 = d1 - iv * Math.sqrt(t);

          peGreeks = {
            delta: normCdf(d1) - 1,
            gamma: normPdf(d1) / (S * iv * Math.sqrt(t)),
            theta:
              (-S * normPdf(d1) * iv) / (2 * Math.sqrt(t)) +
              r * K * Math.exp(-r * t) * normCdf(-d2),
            vega: S * normPdf(d1) * Math.sqrt(t),
            tv_itm: Math.max(PE.ltp - Math.max(K - S, 0), 0),
          };
        }

        // accumulate totals
        totalCEVol += CE.vol || 0;
        totalPEVol += PE.vol || 0;
        totalCEOI += CE.oi || 0;
        totalPEOI += PE.oi || 0;

        // write computed per-strike
        await computedRef.child(strike).set({
          CE: { ...CE, ...ceGreeks },
          PE: { ...PE, ...peGreeks },
        });
      }

      // summary
      const pcr = totalPEOI === 0 ? 0 : totalCEOI / totalPEOI;

      await summaryRef.set({
        totalCEVol,
        totalPEVol,
        totalCEOI,
        totalPEOI,
        pcr,
        underlying,
        updated: Date.now(),
      });
    }

    return null;
  }
);
