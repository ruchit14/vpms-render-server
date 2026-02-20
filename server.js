const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Firebase Init
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

// Health Check
app.get("/", (req, res) => {
  res.send("VPMS Render Server Running");
});

// EVENT API
app.post("/event", async (req, res) => {
  try {
    const { complexId, change } = req.body;

    if (!complexId || change === undefined) {
      return res.status(400).send("Invalid data");
    }

    const eventRef = db.ref(`events/${complexId}`).push();

    await eventRef.set({
      change: change,
      timestamp: Date.now()
    });

    res.send({ status: "ok" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running"));