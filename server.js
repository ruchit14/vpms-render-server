import express from "express";
import admin from "firebase-admin";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json()); // parse JSON body

// Initialize Firebase Admin
if (!admin.apps.length) {
  const firebaseCreds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(firebaseCreds),
    databaseURL: "https://vpms-smart-parking-default-rtdb.asia-southeast1.firebasedatabase.app/"
  });
}

const db = admin.database();

// Root route
app.get("/", (req, res) => {
  res.send("Render server is running! Use /event to send occupancy events.");
});

// Event route (Arduino will POST here)
app.post("/event", async (req, res) => {
  try {
    const { complexId, change } = req.body;

    // Write to Firebase Realtime Database
    await db.ref(`complexes/${complexId}/events`).push({
      change,
      timestamp: Date.now()
    });

    res.json({ status: "success", complexId, change });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error writing to Firebase");
  }
});

app.listen(port, () => {
  console.log(`Render server running on port ${port}`);
});