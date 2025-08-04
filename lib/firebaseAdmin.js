import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca file JSON secara manual untuk memastikan format asli
const serviceAccountPath = path.join(__dirname, "../firebase-admin-key.json");
const rawFile = readFileSync(serviceAccountPath, "utf8");

// Parse manual dan validasi
let serviceAccount;
try {
  serviceAccount = JSON.parse(rawFile);

  // Validasi ekstra ketat
  if (
    !serviceAccount.private_key ||
    !serviceAccount.private_key.includes("-----BEGIN PRIVATE KEY-----") ||
    !serviceAccount.private_key.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error("Invalid private key format in JSON file");
  }
} catch (error) {
  console.error("❌ Error parsing service account:", error);
  throw error;
}

// Format key dengan replace khusus
const privateKey = serviceAccount.private_key
  .replace(/\\n/g, "\n") // Handle escaped newlines
  .replace(/\r/g, "") // Remove carriage returns
  .trim(); // Remove whitespace

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: privateKey,
      }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin init error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Debug tambahan
    console.log(
      "Private key sample:",
      privateKey.substring(0, 50),
      "...",
      privateKey.slice(-50)
    );
    throw error;
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
