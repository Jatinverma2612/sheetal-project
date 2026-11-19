import { Metadata } from "next";
import { permanentRedirect, redirect } from "next/navigation";
import Footer from "../../components/Footer";
import ProductDetailClient from "../components/ProductDetailClient";
import { fetchProductBySlug } from "../../services/productService";
import { getApiImageUrl } from "../../services/api";
import { buildProductHref, getProductCategorySlug } from "../../utils/productRoutes";
import JsonLd from "../../components/JsonLd";
import { getSeoSettings } from "../../services/seoSettingsService";
import { buildProductSchema, parseSchemaString } from "../../utils/schema";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const [res, seoSettings] = await Promise.all([
      fetchProductBySlug(id),
      getSeoSettings(),
    ]);

    if (!res.success || !res.data) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    const product = res.data;
    const canonicalPath = buildProductHref(product);
    const canonicalUrl =
      product.canonicalUrl ||
      `${seoSettings.websiteUrl || "https://studiobysheetal.com"}${canonicalPath}`;

    const title =
      product.metaTitle ||
      `${product.name} | ${seoSettings.websiteName || "Studio By Sheetal"}`;
    const description =
      product.metaDescription ||
      product.shortDescription ||
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at ${seoSettings.websiteName || "Studio By Sheetal"}`;

    const ogImage = product.mainImage
      ? getApiImageUrl(product.mainImage, "/assets/default-image.png")
      : "/assets/default-image.png";

    return {
      title,
      description,
      keywords: product.tags || [],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: seoSettings.websiteName || "Studio By Sheetal",
        images: ogImage
          ? [{ url: ogImage, width: 800, height: 1067, alt: product.name }]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Product | Studio By Sheetal",
      description: "Shop our latest products",
    };
  }
}

export default async function LegacyProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  let product = null;
  let redirectSlug: string | null = null;
  try {
    const res = await fetchProductBySlug(id);
    if (res?.success && res?.data) {
      product = res.data;
      redirectSlug = res.redirectSlug || null;
    }
  } catch (error) {
    console.error("Error fetching product on /product/[id]:", error);
  }

  // If the product has a category, redirect to the canonical category URL (e.g. /dresses/kharakapas)
  if (product) {
    const categorySlug = getProductCategorySlug(product);
    if (categorySlug && categorySlug !== "product") {
      permanentRedirect(
        `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(product.slug || id)}`,
      );
    }
  }

  // If redirectSlug exists and is different from id, redirect
  if (redirectSlug && redirectSlug !== id) {
    permanentRedirect(buildProductHref(product));
  }

  // If product has no category or category is "product", render it directly here
  const seoSettings = await getSeoSettings();
  const structuredData = product
    ? parseSchemaString(product.schema) ||
      buildProductSchema(product, seoSettings)
    : null;

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <ProductDetailClient slug={id} />
      <Footer />
    </>
  );
}
