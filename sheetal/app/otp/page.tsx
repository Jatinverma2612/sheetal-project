import type { Metadata } from "next";
import { Suspense } from "react";
import Footer from "../components/Footer";
import OtpForm from "./components/OtpForm";

export const metadata: Metadata = {
  title: "Verify OTP | Studio By Sheetal",
  robots: {
    index: false,
    follow: false,
  },
};

const OtpPage = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <OtpForm />
      </Suspense>
      <Footer />
    </>
  );
};

export default OtpPage;
