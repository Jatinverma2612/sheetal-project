import { Providers } from "@/store/Providers";
import "./globals.css";
import ClientOnlyFeatures from "./ClientOnlyFeatures";
import AuthInitializer from "@/components/AuthInitializer";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${montserrat.variable} antialiased`}>
        <Providers>
          <AuthInitializer>{children}</AuthInitializer>
          <ClientOnlyFeatures />
        </Providers>
      </body>
    </html>
  );
}
