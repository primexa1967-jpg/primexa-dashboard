const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Busboy = require("busboy");
const { v4: uuid } = require("uuid");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

exports.paymentUpload = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const busboy = new Busboy({ headers: req.headers });
      let plan = "";
      let screenshotFile;
      let mobile = "";

      busboy.on("field", (fieldname, val) => {
        if (fieldname === "plan") plan = val;
        if (fieldname === "mobile") mobile = val;
      });

      busboy.on("file", (fieldname, file, filename) => {
        const extension = filename.split(".").pop();
        const newFileName = `payments/${mobile}_${uuid()}.${extension}`;

        screenshotFile = { file, newFileName };
      });

      busboy.on("finish", async () => {
        try {
          if (!screenshotFile || !mobile) {
            return res
              .status(400)
              .json({ success: false, message: "Missing screenshot or mobile" });
          }

          const upload = storage.file(screenshotFile.newFileName);
          const writeStream = upload.createWriteStream({
            metadata: { contentType: "image/jpeg" },
          });

          screenshotFile.file.pipe(writeStream);

          writeStream.on("finish", async () => {
            const paymentURL = `https://storage.googleapis.com/${storage.name}/${screenshotFile.newFileName}`;

            await db.collection("paidUsers").doc(mobile).set(
              {
                mobile,
                plan,
                paymentProof: paymentURL,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            res.json({ success: true, paymentURL });
          });

          writeStream.on("error", (err) => {
            console.error(err);
            res.status(500).json({ success: false });
          });
        } catch (err) {
          console.error("paymentUpload error:", err);
          res.status(500).json({ success: false });
        }
      });

      req.pipe(busboy);
    } catch (err) {
      console.error("upload init error:", err);
      res.status(500).json({ success: false });
    }
  });
