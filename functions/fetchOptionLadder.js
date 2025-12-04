/**
 * Firebase Function: fetchOptionLadder.js
 * Computes live option ladder + stores previous data for change comparison.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { admin, db } from "./init.js";
import fetch from "node-fetch";

const db = admin.firestore();

const DHAN_API = "https://api.dhan.co/market/v2";
const RISK_FREE_RATE = 0.06; // 6%

export const fetchOptionLadder = onRequest({ region: "asia-south1" }, async (req, res) => {
  const { symbol = "NIFTY", expiry } = req.query;

  if (!expiry) {
    return res.status(400).json({ error: "Missing expiry parameter" });
  }

  try {
    // 1️⃣ Fetch DHAN data
    const [chainRes, quoteRes] = await Promise.all([
      fetch(`${DHAN_API}/option-chain?symbol=${symbol}&expiry=${expiry}`),
      fetch(`${DHAN_API}/quotes?symbol=${symbol}`),
    ]);

    const chain = await chainRes.json();
    const quote = await quoteRes.json();
    const spot = quote.last_price || 0;
    const now = Date.now();

    // Firestore cache doc path
    const cacheRef = db.collection("optionCache").doc(`${symbol}_${expiry}`);
    const cacheDoc = await cacheRef.get();
    const prevData = cacheDoc.exists ? cacheDoc.data() : {};

    // 📈 Build each strike record
    const rows = chain.data.map((item) => {
      const strike = item.strike_price;

      const ce = item.call_option || {};
      const pe = item.put_option || {};

      // 🔸 Fetch previous cached values
      const prev = prevData[strike] || {
        CE: { oi: ce.open_interest, ltp: ce.ltp },
        PE: { oi: pe.open_interest, ltp: pe.ltp },
      };

      // 🔸 Compute changes
      const ce_oi_change = ce.open_interest - (prev.CE.oi || ce.open_interest);
      const pe_oi_change = pe.open_interest - (prev.PE.oi || pe.open_interest);

      const ce_oi_pct = prev.CE.oi ? (ce_oi_change / prev.CE.oi) * 100 : 0;
      const pe_oi_pct = prev.PE.oi ? (pe_oi_change / prev.PE.oi) * 100 : 0;

      const ce_ltp_change = ce.ltp - (prev.CE.ltp || ce.ltp);
      const pe_ltp_change = pe.ltp - (prev.PE.ltp || pe.ltp);

      // 🔹 Built-Up Logic
      const builtUp = (ltpChg, oiChg) => {
        if (ltpChg > 0 && oiChg > 0) return "LB";
        if (ltpChg < 0 && oiChg > 0) return "SB";
        if (ltpChg > 0 && oiChg < 0) return "SC";
        if (ltpChg < 0 && oiChg < 0) return "LU";
        return "-";
      };

      const ceBuilt = builtUp(ce_ltp_change, ce_oi_change);
      const peBuilt = builtUp(pe_ltp_change, pe_oi_change);

      // 🔹 Greeks (simplified)
      const calcGreeks = (S, K, σ, T, r, type) => {
        if (σ <= 0 || T <= 0) return { delta: 0, gamma: 0 };

        const d1 = (Math.log(S / K) + (r + (σ ** 2) / 2) * T) / (σ * Math.sqrt(T));
        const Nd1 = 0.5 * (1 + Math.erf(d1 / Math.sqrt(2)));

        const delta = type === "CE" ? Nd1 : Nd1 - 1;
        const gamma =
          (1 / (S * σ * Math.sqrt(2 * Math.PI * T))) * Math.exp(-0.5 * d1 * d1);
        return { delta, gamma };
      };

      const expiryDate = new Date(`${expiry}T15:30:00+05:30`);
      const T = Math.max(0, (expiryDate - now) / (365 * 24 * 60 * 60 * 1000));

      const ce_iv = (ce.iv || 18) / 100;
      const pe_iv = (pe.iv || 18) / 100;

      const ceGreeks = calcGreeks(spot, strike, ce_iv, T, RISK_FREE_RATE, "CE");
      const peGreeks = calcGreeks(spot, strike, pe_iv, T, RISK_FREE_RATE, "PE");

      // 🔹 TVitm (Time Value ITM)
      const ce_tvitm = ce.ltp - Math.max(spot - strike, 0);
      const pe_tvitm = pe.ltp - Math.max(strike - spot, 0);

      const pcr =
        ce.open_interest > 0
          ? (pe.open_interest / ce.open_interest).toFixed(2)
          : "-";

      return {
        strike,
        CE: {
          ltp: ce.ltp,
          ltp_change: ce_ltp_change,
          volume: ce.volume,
          oi: ce.open_interest,
          oi_change: ce_oi_change,
          oi_change_percent: ce_oi_pct,
          builtUp: ceBuilt,
          iv: ce.iv,
          tvitm: ce_tvitm,
          delta: ceGreeks.delta,
          gamma: ceGreeks.gamma,
        },
        PE: {
          ltp: pe.ltp,
          ltp_change: pe_ltp_change,
          volume: pe.volume,
          oi: pe.open_interest,
          oi_change: pe_oi_change,
          oi_change_percent: pe_oi_pct,
          builtUp: peBuilt,
          iv: pe.iv,
          tvitm: pe_tvitm,
          delta: peGreeks.delta,
          gamma: peGreeks.gamma,
        },
        pcr,
      };
    });

    // 🔸 Store current snapshot to Firestore (for next comparison)
    const cacheToSave = {};
    rows.forEach((r) => {
      cacheToSave[r.strike] = {
        CE: { oi: r.CE.oi, ltp: r.CE.ltp },
        PE: { oi: r.PE.oi, ltp: r.PE.ltp },
      };
    });
    await cacheRef.set(cacheToSave);

    // 🔹 Summary totals
    const ceVol = rows.reduce((a, r) => a + (r.CE.volume || 0), 0);
    const peVol = rows.reduce((a, r) => a + (r.PE.volume || 0), 0);
    const totalCEoi = rows.reduce((a, r) => a + (r.CE.oi || 0), 0);
    const totalPEoi = rows.reduce((a, r) => a + (r.PE.oi || 0), 0);
    const totalPCR = totalCEoi / totalPEoi;

    const summary = {
      ceVol,
      peVol,
      totalCEoi,
      totalPEoi,
      pcr: totalPCR,
      alpha: totalPCR / 100,
      beta: (spot / 10000) * totalPCR,
      vega: spot * Math.sqrt(0.2),
    };

    logger.info(`Updated option ladder for ${symbol} ${expiry}`);
    return res.status(200).json({ spot, expiry, rows, summary });
  } catch (err) {
    logger.error("fetchOptionLadder Error:", err);
    return res.status(500).json({ error: err.message });
  }
});
