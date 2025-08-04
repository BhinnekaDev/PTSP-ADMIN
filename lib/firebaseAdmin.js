import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const base64 = process.env.FIREBASE_ADMIN_BASE64;

    if (!base64) throw new Error("FIREBASE_ADMIN_BASE64 is not set");

    const serviceAccount = JSON.parse(
      Buffer.from(base64, "base64").toString("utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin init error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
