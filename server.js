import express from "express";
import { Storage } from "@google-cloud/storage";

const app = express();
const port = process.env.PORT || 8080;

// Initialize Google Cloud Storage client
// If using environment variable JSON
let storage;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  storage = new Storage({
    projectId: credentials.project_id,
    credentials,
  });
} else {
  // If GOOGLE_APPLICATION_CREDENTIALS points to a file path
  storage = new Storage();
}

// Example route: list buckets
app.get("/buckets", async (req, res) => {
  try {
    const [buckets] = await storage.getBuckets();
    res.json(buckets.map(b => b.name));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error listing buckets");
  }
});

app.listen(port, () => {
  console.log(`Render server running on port ${port}`);
});