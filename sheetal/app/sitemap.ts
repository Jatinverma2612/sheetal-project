import type { MetadataRoute } from "next";
import { fetchAllCategories } from "./services/categoryService";
import { fetchProducts } from "./services/productService";
import { getBlogs } from "./services/blogService";
import { buildProductHref } from "./utils/productRoutes";

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://studiobysheetal.com";

  // Real verified static storefront routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about-us",
    "/contact-us",
    "/privacy-policy",
    "/terms-and-conditions",
    "/shipping-policy",
    "/return-exchange-policy",
    "/faq",
    "/product-list",
    "/blog",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  try {
    const [categoriesResult, productsResult, blogsResult] =
      await Promise.allSettled([
        fetchAllCategories(),
        fetchProducts({ limit: 1000 }),
        getBlogs({ limit: 100 }),
      ]);

    const categoryEntries: MetadataRoute.Sitemap =
      categoriesResult.status === "fulfilled" &&
      Array.isArray(categoriesResult.value)
        ? categoriesResult.value
            .filter((c) => c?.slug && c?.isActive !== false && c?.status !== "Inactive")
            .map((c) => ({
              url: `${siteUrl}/${encodeURIComponent(c.slug)}`,
              lastModified: new Date(),
              changeFrequency: "daily" as const,
              priority: 0.8,
            }))
        : [];

    const productEntries: MetadataRoute.Sitemap =
      productsResult.status === "fulfilled" &&
      productsResult.value?.success &&
      Array.isArray(productsResult.value.products)
        ? productsResult.value.products
            .filter((p) => p?.slug && p?.status === "Active" && p?.isActive !== false)
            .map((p) => ({
              url: `${siteUrl}${buildProductHref(p)}`,
              lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
              changeFrequency: "daily" as const,
              priority: 0.9,
            }))
        : [];

    const blogEntries: MetadataRoute.Sitemap =
      blogsResult.status === "fulfilled" &&
      blogsResult.value?.success &&
      Array.isArray(blogsResult.value.blogs)
        ? blogsResult.value.blogs
            .filter((b) => b?.slug && b?.status === "Active" && b?.isPublished !== false)
            .map((b) => ({
              url: `${siteUrl}/blog/${encodeURIComponent(b.slug)}`,
              lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.7,
            }))
        : [];

    return [...staticRoutes, ...categoryEntries, ...productEntries, ...blogEntries];
  } catch (error) {
    console.error("Sitemap generation fallback (returning static routes):", error);
    return staticRoutes;
  }
}

