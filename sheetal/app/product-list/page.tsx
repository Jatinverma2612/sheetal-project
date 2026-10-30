import { Metadata } from "next";
import Footer from "../components/Footer";
import ProductListClient from "./ProductListClient";
import { getPageData } from "../components/PolicyPage";
import { getSeoSettings } from "../services/seoSettingsService";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [pageData, seoSettings] = await Promise.all([
    getPageData("product-list"),
    getSeoSettings(),
  ]);

  const websiteName = seoSettings?.websiteName || "Studio By Sheetal";
  const title =
    pageData?.metaTitle ||
    (pageData?.title ? `${pageData.title} | ${websiteName}` : `All Products | ${websiteName}`);
  const description =
    pageData?.metaDescription ||
    seoSettings?.organizationDescription ||
    "Browse our complete collection of exquisite sarees, ethnic wear, and designer ensembles at Studio By Sheetal.";
  const keywords =
    pageData?.metaKeywords ||
    "saree collection, designer ethnic wear, luxury sarees, bridal collection, Studio By Sheetal products";
  const canonical =
    pageData?.canonicalUrl ||
    `${seoSettings?.websiteUrl || "https://studiobysheetal.com"}/product-list`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: websiteName,
      images: pageData?.ogImage ? [{ url: pageData.ogImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: pageData?.ogImage ? [pageData.ogImage] : [],
    },
  };
}

const ProductListPage = () => {
  return (
    <>
      <ProductListClient />
      <Footer />
    </>
  );
};

export default ProductListPage;
