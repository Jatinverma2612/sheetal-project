"use client";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

export default function ClientOnlyFeatures() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Only register service worker in production on non-localhost domains
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local");

    if (process.env.NODE_ENV === "production" && !isLocalhost) {
      const registerSW = () => {
        try {
          navigator.serviceWorker
            .register("/service-worker.js")
            .catch(() => {
              // Silently ignore to avoid showing dev overlay errors
            });
        } catch {
          // Guard against synchronous InvalidStateError
        }
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    } else {
      // In local development, unregister any existing service worker to prevent
      // caching stale Webpack chunks or throwing InvalidStateError on HMR reloads
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  return <Toaster position="top-right" toastOptions={{ duration: 3000 }} />;
}
