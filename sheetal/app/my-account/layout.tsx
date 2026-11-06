import type { Metadata } from "next";
import Footer from "../components/Footer";
import MyAccountLayoutClient from "./MyAccountLayoutClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const MyAccountLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <MyAccountLayoutClient>{children}</MyAccountLayoutClient>
      <Footer />
    </>
  );
};

export default MyAccountLayout;

