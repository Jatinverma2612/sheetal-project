import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | Studio By Sheetal",
  description: "Review the items in your shopping cart and proceed to checkout at Studio By Sheetal. Your exquisite selection of ethnic wear awaits.",
  keywords: "shopping cart, checkout, buy sarees online, Studio By Sheetal cart",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
