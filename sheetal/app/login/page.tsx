import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "../components/Footer";
import LoginForm from "./components/LoginForm";
import { getSettings, getLoginImageUrl, getLogoUrl } from "../services/settingsService";

export const metadata: Metadata = {
  title: "Login | Studio By Sheetal",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const LoginPage = async () => {
  let initialLoginImage = "/assets/updated-login-left.jpg";
  let initialLogoUrl = "/assets/335014072.png";
  let initialSettings: any = null;

  try {
    initialSettings = await getSettings();
    initialLoginImage = getLoginImageUrl(initialSettings);
    initialLogoUrl = getLogoUrl(initialSettings);
  } catch {
    // Keep fallback
  }

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[#f6f6f4]" />}>
        <LoginForm
          initialLoginImage={initialLoginImage}
          initialLogoUrl={initialLogoUrl}
          initialSettings={initialSettings}
        />
      </Suspense>
      <Footer />
    </>
  );
};

export default LoginPage;
