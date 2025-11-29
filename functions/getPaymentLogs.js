/**
 * getPaymentLogs.js — FINAL
 * Fetch complete payment logs with:
 * - Status filter
 * - Date range
 * - Search
 * - Pagination
 * - CSV export
 *
 * Region: asia-southeast1
 * Node: v20
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.getPaymentLogs = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      const q = req.method === "GET" ? req.query : req.body;

      const {
        limit = "50",
        lastDocId,
        status,
        startDate,
        endDate,
        search,
        exportCsv = "false",
      } = q;

      const limitNum = Math.min(200, parseInt(limit) || 50);

      let ref = db.collection("payments").orderBy("createdAt", "desc");

      // Status filter
      if (status && status !== "all") {
        ref = ref.where("status", "==", status);
      }

      // Date range
      if (startDate) {
        const s = new Date(startDate);
        if (!isNaN(s.getTime())) {
          ref = ref.where(
            "createdAt",
            ">=",
            admin.firestore.Timestamp.fromDate(s)
          );
        }
      }

      if (endDate) {
        const e = new Date(endDate);
        if (!isNaN(e.getTime())) {
          e.setHours(23, 59, 59, 999);
          ref = ref.where(
            "createdAt",
            "<=",
            admin.firestore.Timestamp.fromDate(e)
          );
        }
      }

      let snapshot;

      // Pagination
      if (lastDocId) {
        const snap = await db.collection("payments").doc(lastDocId).get();
        if (snap.exists) {
          snapshot = await ref.startAfter(snap).limit(limitNum).get();
        } else {
          snapshot = await ref.limit(limitNum).get();
        }
      } else {
        snapshot = await ref.limit(limitNum).get();
      }

      const payments = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        payments.push({
          id: doc.id,
          name: d.name || "",
          email: d.email || "",
          phone: d.phone || "",
          amount: d.amount || 0,
          currency: d.currency || "INR",
          status: d.status || "pending",
          plan: d.plan || "",
          transactionId: d.transactionId || "",
          paymentProof: d.paymentProof || "",
          createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
        });
      });

      // Search — client-side filter
      let filtered = payments;
      if (search) {
        const s = search.toLowerCase();
        filtered = payments.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(s)) ||
            (p.email && p.email.toLowerCase().includes(s)) ||
            (p.phone && p.phone.toLowerCase().includes(s)) ||
            (p.transactionId && p.transactionId.toLowerCase().includes(s))
        );
      }

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const nextCursor = lastVisible ? lastVisible.id : null;

      // CSV Export
      if (String(exportCsv).toLowerCase() === "true") {
        const headers = [
          "id",
          "name",
          "email",
          "phone",
          "amount",
          "currency",
          "status",
          "plan",
          "transactionId",
          "paymentProof",
          "createdAt",
        ];

        const escapeCSV = (value) => {
          if (value === undefined || value === null) return "";
          const s = String(value).replace(/"/g, '""');
          return `"${s}"`;
        };

        const rows = filtered.map((p) =>
          headers.map((h) => escapeCSV(p[h])).join(",")
        );

        const csv = [headers.join(","), ...rows].join("\r\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=payments_export.csv"
        );

        return res.status(200).send(csv);
      }

      return res.status(200).json({
        payments: filtered,
        lastDoc: nextCursor,
        count: filtered.length,
      });
    } catch (err) {
      console.error("getPaymentLogs error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
