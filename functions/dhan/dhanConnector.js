import WebSocket from "ws";
import admin from "../admin.js";

const db = admin.database();
let ws = null;
let reconnectTimeout = null;

const REGION = "asia-south1";

export async function startFeed() {
  const tokenSnap = await db.ref("settings/dhan/accessToken").once("value");
  const token = tokenSnap.val();

  if (!token) {
    console.log("? No Dhan access token found");
    return;
  }

  if (ws) {
    try { ws.close(); } catch {}
  }

  ws = new WebSocket("wss://api-feed.dhan.co", {
    headers: { Authorization: `Bearer ${token}` },
  });

  ws.on("open", () => {
    console.log("?? Dhan WS Connected");
  });

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      await db.ref("market_data/raw").set({
        ...data,
        ts: Date.now(),
      });
    } catch {}
  });

  ws.on("close", () => {
    console.log("?? Dhan WS Disconnected — reconnecting…");
    reconnectTimeout = setTimeout(startFeed, 5000);
  });

  ws.on("error", (err) => {
    console.log("?? WS Error:", err);
  });
}

export function stopFeed() {
  try {
    if (ws) ws.close();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
  } catch {}
}
