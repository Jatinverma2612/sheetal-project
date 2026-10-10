"use client";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

export default function ClientOnlyFeatures() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.error("SW failed:", err));
    }
  }, []);

  return <Toaster position="top-right" toastOptions={{ duration: 3000 }} />;
}
