const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.getUsers = functions
  .region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const page = parseInt(req.query.page || 1);
      const perPage = parseInt(req.query.perPage || 20);

      const users = [];

      // pending users
      const pendingSnap = await db.collection("pendingUsers").get();
      pendingSnap.forEach((doc) =>
        users.push({
          uid: doc.id,
          ...doc.data(),
          status: "pending",
        })
      );

      // paid users
      const paidSnap = await db.collection("paidUsers").get();
      paidSnap.forEach((doc) =>
        users.push({
          uid: doc.id,
          ...doc.data(),
          status: "paid",
        })
      );

      // active users
      const activeSnap = await db.collection("activeUsers").get();
      activeSnap.forEach((doc) =>
        users.push({
          uid: doc.id,
          ...doc.data(),
          status: "active",
        })
      );

      // paginate
      const startIndex = (page - 1) * perPage;
      const paginated = users.slice(startIndex, startIndex + perPage);

      res.json({ success: true, users: paginated });
    } catch (err) {
      console.error("getUsers error:", err);
      res.status(500).json({ success: false });
    }
  });
