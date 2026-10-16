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

  // 4. Inlined project service account fallback (ensures Render / serverless deployments initialize Firebase Admin)
  return {
    type: "service_account",
    project_id: "sheetalstudio-9f4a6",
    private_key_id: "042e43344de226f6ed27815a4078c1587e7b8d41",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCHDgYsNHFEczbs\nYCPBaBAQdAe8qXP11zMzrPIpjyyB8VB3cXPI4Bgpgm9DW/DeN10cwZ9BlP79hRtD\nAz91OyJfYISewdME09A04cBr7wCN1YUkTSnEttr/VM8gNJmx3lgd9N+nHotPbpC3\nWRxiNC9ZmkhJGBM47luDFK512W84ICF2N+ikxqHWmdgEVuxg5LVmDmMa6n9WeF5C\n5AV8ARGZEOtxoSa+41dkDLqaz+VA692kn/QPjab/RNACq/VqZ17pehqqdqND3Q50\nbI7ZLNoQ2tfeIq1sQrV4xk6x+knPKaFyW/PoKieA8Qddzs9VoQaTxn64TG8q2MOm\nmYwVIZthAgMBAAECggEAIhDsh6v2wjBZs0gQ3NE19CCAbxtDL8jHlopSTx9ZN7G5\n/Vb1wL6d+aJ4FEKVwEewyfchB7bgluxDUyT3lceDxREggrcbVkVjaGNlWRRhTGWG\nfwCjv4XsOamX0WTTO+V8zpmc7Jesxi16fXURzsehBfX/s8hJ2Ptuw+KsmvdssXgz\nigc3r0DZ8U50Bkmi3ERTTlblZa5SJFi38gdK5PFAwsABwwGUVuwvrLa1KUSMsTMF\ntS7HxmSbXPNEf33dWw8GGpMT6t685AQAR1kCOB1uv8Rh0d80v/gQ736ZzYjWsSxa\nEAWzIoE4DJU+jI2lFlEcJFoTrE11HMsUU9jEtSICjQKBgQC7N0j3w9kzyF1V5DQo\nwCQts59TLvOqZaqU6J3U/9C2z8YO8VeOw072X1hVoVdAo9Is4z9letieAr/6p4I6\nKYSI3DXd8YjbhnKM8gqq1MAQrNyHWyOz/9kFaVlx/FzUbAgulQhoeNBzGZinK+cj\nIpQtN8/TDfh/5wzITYKiuHw+HwKBgQC4rK/S/6yqB9mX/vBeyMPhtQhJCnXpwlEe\nh6UG9p6O2bIdS2ms6X/N4wwr3L/FZsuQknpTj5NLdZwt8KjnwvaMIKry1tZ2QY9r\ni2/xeQZdL7nXcBJWdgRdK5ISDoqjtLHuENolpFaVW3KHmDflX+EYBi7Sl2biFRKI\n0HRcgJP2fwKBgCA6ijMs4e1KJtcsa9ZADXpYm6rkQEorKkxsJw+N4k42QnA8F8iZ\n0rQTAc/r8GtOSFY14KoFldjNvGLYB1Ef6JLu5c8JT3gLExk0aaWy7kVwnJ4okGLi\nPmfyFNXMjeZ7moT6XvItKiVGWMMeibHAuCV4oCxDEW5jRg4NWdnNTIYdAoGAbWO8\n8lsIR99GgMY+U6bQgM3fDoTnu4Oi0Va/5hQHb857tuaIvifB0I8BEqo73g453nUl\niIGvWi9cR8oaAs51hCOFnzqq5nmHHskFkh+CKYivqHF2K0jU5Ot+Jrv+W2IZU08g\nKNPjha0ZdkAwO+pDRxvCeHO+OYUJ6YiwpGp1OrkCgYBHvCBjlb+DULPWRoBb/Cid\nbJ1waIjRqxd4MDADIn7znuumHci8Ia3/cM3nR363gkhHuXkfcpuWYNWSfDGp8g0j\nvDw41/OIAZB6tncqNJybMPKFitVQPT3ROtd3ttCeb6+Xe4q6SC7OEk8lAH24MNZ1\ngnL7v6yC5Q+J1EnhI+czzg==\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-fbsvc@sheetalstudio-9f4a6.iam.gserviceaccount.com",
    client_id: "111451040082595660033",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:
      "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sheetalstudio-9f4a6.iam.gserviceaccount.com",
  };
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
