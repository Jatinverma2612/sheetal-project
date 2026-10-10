import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const getServiceAccount = () => {
  // 1. Explicit path from environment variable (e.g., outside public_html on cPanel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const configuredPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(configuredPath)) {
      try {
        const fileContent = fs.readFileSync(configuredPath, "utf-8");
        return JSON.parse(fileContent);
      } catch (err) {
        console.error(`Error reading Firebase service account from ${configuredPath}:`, err.message);
      }
    } else {
      console.warn(`Firebase service account file not found at: ${configuredPath}`);
    }
  }

  // 2. Default local file locations (useful for local development)
  const localCandidates = [
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "config", "serviceAccountKey.json"),
  ];

  for (const candidatePath of localCandidates) {
    if (fs.existsSync(candidatePath)) {
      try {
        const fileContent = fs.readFileSync(candidatePath, "utf-8");
        return JSON.parse(fileContent);
      } catch (err) {
        console.error(`Error reading Firebase service account from ${candidatePath}:`, err.message);
      }
    }
  }

  // 3. Fallback to individual environment variables if provided
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    return {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };
  }

  return null;
};

const initializeFirebase = () => {
  // Check if Firebase has already been initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const serviceAccount = getServiceAccount();

    if (!serviceAccount) {
      console.warn(
        "Firebase Admin SDK not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_PATH or individual Firebase environment variables.",
      );
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully.");
    return admin.app();
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
};

export default initializeFirebase;
