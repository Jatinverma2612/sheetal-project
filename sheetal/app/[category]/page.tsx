// app/[category]/page.tsx
import React from "react";
import ProductList from "../product-list/ProductListClient";
import Footer from "../components/Footer";
import { Metadata } from "next";
import { fetchCategoryBySlugServer } from "../services/categoryService";
import { notFound } from "next/navigation";
import { getSeoSettings } from "../services/seoSettingsService";
import JsonLd from "../components/JsonLd";
import { buildCategorySchema, parseSchemaString } from "../utils/schema";
import { fetchStaticPageBySlug } from "../services/staticPageService";
import StaticPage from "../components/StaticPage";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const safeDecodeParam = (param?: string): string => {
  if (!param) return "";
  try {
    return decodeURIComponent(param).trim();
  } catch {
    return String(param).trim();
  }
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const category = safeDecodeParam(resolvedParams?.category);

    if (!category) {
      return {
        title: "Page Not Found | Studio By Sheetal",
      };
    }

    const [cat, seoSettings] = await Promise.all([
      fetchCategoryBySlugServer(category).catch(() => null),
      getSeoSettings().catch(() => ({} as any)),
    ]);

    if (!cat) {
      const page = await fetchStaticPageBySlug(category).catch(() => null);
      if (page) {
        const title =
          page.metaTitle ||
          (page.title
            ? `${page.title} | ${seoSettings?.websiteName || "Studio By Sheetal"}`
            : (seoSettings?.websiteName || "Studio By Sheetal"));
        const description =
          page.metaDescription || seoSettings?.organizationDescription || "";
        const canonical =
          page.canonicalUrl ||
          `${seoSettings?.websiteUrl || "https://studiobysheetal.com"}/${encodeURIComponent(page.slug)}`;
        const ogTitle = page.ogTitle || title;
        const ogDescription = page.ogDescription || description;

        return {
          title,
          description,
          keywords: page.metaKeywords || "",
          alternates: {
            canonical,
          },
          openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: canonical,
            siteName: seoSettings?.websiteName || "Studio By Sheetal",
            images: page.ogImage
              ? [{ url: page.ogImage, width: 1200, height: 630, alt: ogTitle }]
              : [],
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description: ogDescription,
            images: page.ogImage ? [page.ogImage] : [],
          },
        };
      }

      return {
        title: "Page Not Found | Studio By Sheetal",
      };
    }

    const title =
      cat.metaTitle ||
      `${cat.name} | ${seoSettings?.websiteName || "Studio By Sheetal"}`;
    const description =
      cat.metaDescription ||
      cat.description ||
      seoSettings?.organizationDescription ||
      `Shop ${cat.name} at ${seoSettings?.websiteName || "Studio By Sheetal"}`;
    const ogImageUrl = cat.ogImage || cat.mainImage?.url || "";
    const canonical =
      cat.canonicalUrl ||
      `${seoSettings?.websiteUrl || "https://studiobysheetal.com"}/${encodeURIComponent(category)}`;

    return {
      title,
      description,
      keywords: cat.metaKeywords || "",
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: seoSettings?.websiteName || "Studio By Sheetal",
        images: ogImageUrl
          ? [{ url: ogImageUrl, width: 1200, height: 630, alt: cat.name }]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImageUrl ? [ogImageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating category metadata:", error);
    return {
      title: "Category | Studio By Sheetal",
      description: "Shop our latest collections",
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  let category = "";
  try {
    const resolvedParams = await params;
    category = safeDecodeParam(resolvedParams?.category);
  } catch (err) {
    console.error("Error resolving category params:", err);
    notFound();
  }

  if (!category) {
    notFound();
  }

  let cat = null;
  let seoSettings: any = {};
  try {
    const results = await Promise.all([
      fetchCategoryBySlugServer(category),
      getSeoSettings(),
    ]);
    cat = results[0];
    seoSettings = results[1] || {};
  } catch (error) {
    console.error("Error loading category data on server:", error);
  }

  if (!cat) {
    let page = null;
    try {
      page = await fetchStaticPageBySlug(category);
    } catch (pageError) {
      console.error("Error loading static page fallback:", pageError);
    }
    if (page) return <StaticPage page={page} />;
    notFound();
  }

  const schema =
    parseSchemaString(cat.schema) || buildCategorySchema(cat, seoSettings);

  return (
    <>
      <JsonLd data={schema} />
      <ProductList categorySlug={category} initialCategoryId={cat?._id} />
      <Footer />
    </>
  );
}
