/**
 * generateFile.js — Cloud Function Module
 * Region: asia-south1
 */

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

exports.generateFile = functions
  .region("asia-south1")
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
      }

      try {
        const { fileName, path, specification } = req.body;

        if (!fileName || !path || !specification) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const content = `// Generated for ${fileName}\n// Spec: ${specification}`;

        return res.status(200).json({
          fileName,
          path,
          region: "asia-south1",
          content,
          message: "File generated successfully ✅",
        });
      } catch (error) {
        console.error("❌ Error generating file:", error);
        return res.status(500).json({ error: error.message });
      }
    });
  });
