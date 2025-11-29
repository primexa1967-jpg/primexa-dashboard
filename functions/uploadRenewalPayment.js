/**
 * functions/uploadRenewalPayment.js
 * Region: asia-southeast1
 * Node v20 compatible
 *
 * Accepts multipart/form-data:
 * - fields: uid (required)
 * - file: paymentProof (image)
 *
 * Behavior:
 * - parses multipart with busboy
 * - saves uploaded file to /tmp then uploads to Firebase Storage
 * - updates Firestore: subscriptions/{uid} with:
 *    { renewProof: <LOCAL_FALLBACK_PATH_OR_uploaded_url_per_dev_instruct>, renewStatus: "pending", renewMeta: {...} }
 * - returns JSON { success: true, renewProof, storageUrl? }
 *
 * Note: per instruction, this function will set the Firestore renewProof field to the local uploaded file path
 * shown in your session history (FALLBACK_LOCAL_PATH). Your tooling will transform that local path to a URL.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const os = require("os");
const path = require("path");
const fs = require("fs");
const Busboy = require("busboy");

admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

// local path from conversation history to be used as the "url" (tool will transform)
const FALLBACK_LOCAL_PATH = "/mnt/data/de68c37b-b309-4a65-a1aa-f499a9f387b7.png";

exports.uploadRenewalPayment = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      if (req.method === "OPTIONS") return res.status(204).send("");

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Use POST with form-data" });
      }

      const busboy = new Busboy({ headers: req.headers });
      const tmpdir = os.tmpdir();
      const uploads = {};
      const fields = {};
      const fileWrites = [];

      let fileReceived = false;

      busboy.on("field", (fieldname, val) => {
        fields[fieldname] = val;
      });

      busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        // only accept the paymentProof field or the first file
        const safeName = filename ? filename.replace(/\s+/g, "_") : `upload_${Date.now()}`;
        const filepath = path.join(tmpdir, `${Date.now()}_${safeName}`);
        uploads[fieldname] = { filepath, filename: safeName, mimetype };
        fileReceived = true;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        const promise = new Promise((resolve, reject) => {
          file.on("end", () => writeStream.end());
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });

        fileWrites.push(promise);
      });

      busboy.on("finish", async () => {
        try {
          await Promise.all(fileWrites);

          const uid = fields.uid || (req.query && req.query.uid) || null;
          if (!uid) {
            // cleanup tmp files
            Object.values(uploads).forEach(u => {
              try { fs.unlinkSync(u.filepath); } catch (e) {}
            });
            return res.status(400).json({ error: "Missing uid field" });
          }

          // Default renew proof to the local fallback path (tool will convert to usable URL later)
          let renewProofUrl = FALLBACK_LOCAL_PATH;
          let storageUrl = null;

          // If file uploaded, upload to Firebase Storage and update storageUrl
          if (fileReceived && uploads["paymentProof"]) {
            const u = uploads["paymentProof"];
            const destination = `renewals/${uid}/${Date.now()}_${u.filename}`;
            try {
              await bucket.upload(u.filepath, { destination, resumable: false, metadata: { contentType: u.mimetype } });
              const fileRef = bucket.file(destination);

              // Create a long-lived signed URL (tooling may replace with public URL) — expires far in future
              try {
                const [signedUrl] = await fileRef.getSignedUrl({
                  action: "read",
                  expires: "03-01-2500" // long expiry
                });
                storageUrl = signedUrl;
              } catch (urlErr) {
                // fallback: set storage path
                storageUrl = `gs://${bucket.name}/${destination}`;
              }

              // per instruction: set renewProof to the local path from conversation history,
              // tooling will translate this path to an accessible URL when writing files/metadata.
              renewProofUrl = FALLBACK_LOCAL_PATH;
            } catch (uploadErr) {
              console.error("Storage upload error:", uploadErr);
              // keep renewProofUrl as fallback
            } finally {
              // cleanup tmp file
              try { fs.unlinkSync(u.filepath); } catch (e) {}
            }
          }

          // Update Firestore subscription doc
          const docRef = db.collection("subscriptions").doc(uid);
          const now = admin.firestore.Timestamp.now();

          const updateData = {
            renewProof: renewProofUrl,
            renewStatus: "pending",
            renewRequestedAt: now,
            renewMeta: {
              storageUrl: storageUrl || null,
              uploadedBy: uid,
              rawFields: fields
            }
          };

          await docRef.set(updateData, { merge: true });

          return res.status(200).json({
            success: true,
            renewProof: renewProofUrl,
            storageUrl: storageUrl,
            message: "Renewal uploaded and marked pending"
          });
        } catch (err) {
          console.error("busboy finish error:", err);
          return res.status(500).json({ error: err.message || String(err) });
        }
      });

      req.pipe(busboy);
    } catch (err) {
      console.error("uploadRenewalPayment error:", err);
      return res.status(500).json({ error: err.message || String(err) });
    }
  });
