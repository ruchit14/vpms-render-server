import express from "express";
import admin from "firebase-admin";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json()); // parse JSON bodies

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const firebaseCreds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(firebaseCreds),
    databaseURL: "https://vpms-smart-parking-default-rtdb.asia-southeast1.firebasedatabase.app/" // replace with your Firebase project URL
  });
}

const db = admin.database();

// Root route
app.get("/", (req, res) => {
  res.send("Render server is running! Use /event to send occupancy events.");
});

// Event route (ESP devices will POST here)
app.post("/event", async (req, res) => {
  try {
    const { complexId, change } = req.body;

    if (!complexId || typeof change !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Write event to /events/{complexId}
    await db.ref(`events/${complexId}`).push({
      change,
      timestamp: Date.now()
    });

    res.json({ status: "success", complexId, change });
  } catch (err) {
    console.error("Error writing event:", err);
    res.status(500).send("Error writing to Firebase");
  }
});

app.listen(port, () => {
  console.log(`Render server running on port ${port}`);
});