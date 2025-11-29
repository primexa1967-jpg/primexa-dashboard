import { onCall } from "firebase-functions/v2/https";
import admin from "../init.js";
import axios from "axios";

const db = admin.database();
const REGION = "asia-south1";

export const dhanAPIProxy = onCall(
  { region: REGION },
  async (req, ctx) => {
    const token = await db.ref("settings/dhan/accessToken").once("value").then(s => s.val());

    if (!token) return { ok: false, error: "NO_TOKEN" };

    const { endpoint, method = "GET", body = {} } = req.data;

    const url = `https://api.dhan.co/${endpoint}`;

    const response = await axios({
      url,
      method,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { ok: true, data: response.data };
  }
);
