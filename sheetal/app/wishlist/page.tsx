import { Metadata } from "next";
import Footer from "../components/Footer";
import WishlistPageClient from "./WishlistPageClient";

export const metadata: Metadata = {
  title: "My Wishlist | Studio By Sheetal",
  description: "View and manage your favorite items in your wishlist at Studio By Sheetal. Save the sarees and ethnic wear you love for later.",
  keywords: "wishlist, favorite sarees, save for later, Studio By Sheetal wishlist",
};

const WishlistPage = () => {
  return (
    <>
      <WishlistPageClient />
      <Footer />
    </>
  );
};

export default WishlistPage;
