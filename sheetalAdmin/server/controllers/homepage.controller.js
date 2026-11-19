import Homepage from "../models/homepage.model.js";
import Product from "../models/product.model.js";
import * as productService from "../services/product.service.js";
import Category from "../models/category.model.js";
import SeoSettings from "../models/seosettings.model.js";
import { generateHomepageSchema } from "../utils/schemaGenerator.js";
import successResponse from "../utils/successResponse.js";
import { normalizeJsonLd } from "../utils/jsonLd.js";

const applyNoStoreHeaders = (res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
  });
};

const defaultTopInfoConfig = {
  mode: "coupon",
  customText: "",
  customCtaLabel: "Shop Now",
  customCtaHref: "/product-list",
};

const initializeHomepageIfEmpty = async (homepage) => {
  let updated = false;

  // Initialize Hidden Beauty categories only if undefined or null (respects admin configuration)
  if (homepage.hiddenBeauty?.categories === undefined || homepage.hiddenBeauty?.categories === null) {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .limit(10);
    homepage.hiddenBeauty = {
      ...(homepage.hiddenBeauty?.toObject?.() || homepage.hiddenBeauty),
      categories: categories.map((c) => c._id),
    };
    updated = true;
  }

  // Initialize Instagram Diaries products with active in-stock products if not yet configured by admin
  if (
    !homepage.instagramDiaries?.isConfigured &&
    (!Array.isArray(homepage.instagramDiaries?.products) ||
      homepage.instagramDiaries.products.length === 0)
  ) {
    const candidateProducts = await Product.find({ status: "Active" })
      .sort({ createdAt: -1 })
      .limit(15);
    const validProducts = candidateProducts
      .filter((p) => {
        if (!p || p.status !== "Active") return false;
        const hasVariantSizes = p.variants?.some(
          (v) => Array.isArray(v.sizes) && v.sizes.length > 0,
        );
        if (hasVariantSizes) {
          const hasVariantStock = p.variants.some((v) =>
            v.sizes?.some((s) => Number(s.stock || 0) > 0),
          );
          const hasOverallStock = p.stock === undefined || Number(p.stock) > 0;
          return hasVariantStock && hasOverallStock;
        }
        return (p.stock ?? 0) > 0;
      })
      .slice(0, 5);

    if (validProducts.length > 0) {
      homepage.instagramDiaries = {
        ...(homepage.instagramDiaries?.toObject?.() || homepage.instagramDiaries),
        products: validProducts.map((p) => p._id),
      };
      updated = true;
    }
  }

  // NOTE: Do not forcefully seed random products into collections, trendingThisWeek, or newArrivals!
  // Products in these sections must only be products the admin explicitly pushed via the
  // "Push for Collection", "Push for Trending", or "Push for New Arrivals" switches.

  if (updated) {
    await homepage.save();
  }
};

// @desc    Get homepage settings
// @route   GET /api/v1/homepage/sections
// @access  Public
export const getSections = async (req, res, next) => {
  try {
    applyNoStoreHeaders(res);
    let homepage = await Homepage.findOne();

    // Create default if doesn't exist
    if (!homepage) {
      homepage = await Homepage.create({});
    }

    await initializeHomepageIfEmpty(homepage);

    homepage = await Homepage.findOne()
      .populate({
        path: "hiddenBeauty.categories",
        select: "name slug mainImage",
      })
      .populate({
        path: "collections.products",
        select: "name slug mainImage hoverImage variants price stock status category averageRating isCollection sortOrder createdAt",
      })
      .populate({
        path: "trendingThisWeek.products",
        select: "name slug mainImage hoverImage variants price stock status category averageRating isTrending sortOrder createdAt",
      })
      .populate({
        path: "newArrivals.products",
        select: "name slug mainImage hoverImage variants price stock status category averageRating isNewArrival sortOrder createdAt",
      })
      .populate({
        path: "instagramDiaries.products",
        select: "name slug mainImage hoverImage variants price stock status category averageRating sortOrder createdAt",
      });

    const isProductInStock = (p) => {
      if (!p) return false;
      const hasVariantSizes = p.variants?.some(
        (v) => Array.isArray(v.sizes) && v.sizes.length > 0,
      );
      if (hasVariantSizes) {
        const hasVariantStock = p.variants.some((v) =>
          v.sizes?.some((s) => Number(s.stock || 0) > 0),
        );
        const hasOverallStock = p.stock === undefined || Number(p.stock) > 0;
        return hasVariantStock && hasOverallStock;
      }
      return Number(p.stock || 0) > 0;
    };

    const isAvailableProductForPublic = (p) => {
      if (!p || !p._id || !p.slug || !p.name) return false;
      if (p.status !== "Active" || p.isActive === false) return false;
      return isProductInStock(p);
    };

    const collectionsObj =
      homepage.collections?.toObject?.() || homepage.collections || {};
    const trendingObj =
      homepage.trendingThisWeek?.toObject?.() ||
      homepage.trendingThisWeek ||
      {};
    const newArrivalsObj =
      homepage.newArrivals?.toObject?.() || homepage.newArrivals || {};

    // Get all products from DB currently flagged for each section to ensure 100% accurate sync
    const [flaggedTrending, flaggedNewArrivals, flaggedCollections] = await Promise.all([
      Product.find({ isTrending: true, status: "Active" })
        .select("name slug mainImage hoverImage variants price stock status category averageRating isTrending sortOrder createdAt")
        .populate("category", "name slug")
        .lean(),
      Product.find({ isNewArrival: true, status: "Active" })
        .select("name slug mainImage hoverImage variants price stock status category averageRating isNewArrival sortOrder createdAt")
        .populate("category", "name slug")
        .lean(),
      Product.find({ isCollection: true, status: "Active" })
        .select("name slug mainImage hoverImage variants price stock status category averageRating isCollection sortOrder createdAt")
        .populate("category", "name slug")
        .lean(),
    ]);

    // Build section list: prioritize explicitly curated products from Homepage CMS
    const buildSectionProducts = (curatedProducts, flaggedList) => {
      if (Array.isArray(curatedProducts) && curatedProducts.length > 0) {
        return curatedProducts.filter(isAvailableProductForPublic);
      }
      return (flaggedList || []).filter(isAvailableProductForPublic);
    };

    const filteredTrending = {
      ...trendingObj,
      products: buildSectionProducts(trendingObj.products, flaggedTrending),
    };

    const filteredNewArrivals = {
      ...newArrivalsObj,
      products: buildSectionProducts(newArrivalsObj.products, flaggedNewArrivals),
    };

    const filteredCollections = {
      ...collectionsObj,
      products: buildSectionProducts(collectionsObj.products, flaggedCollections),
    };

    const instagramDiariesObj =
      homepage.instagramDiaries?.toObject?.() ||
      homepage.instagramDiaries ||
      {};

    const rawProductLinks = instagramDiariesObj.productLinks;
    const productLinksMap =
      rawProductLinks instanceof Map
        ? Object.fromEntries(rawProductLinks)
        : typeof rawProductLinks === "object" && rawProductLinks !== null
          ? rawProductLinks
          : {};

    const filteredInstagramDiaries = {
      ...instagramDiariesObj,
      products: (Array.isArray(instagramDiariesObj.products)
        ? instagramDiariesObj.products.filter(isAvailableProductForPublic)
        : []
      ).map((p) => {
        const pObj = p?.toObject
          ? p.toObject()
          : typeof p === "object" && p !== null
            ? { ...p }
            : { _id: p };
        const pid = pObj._id?.toString?.() || String(pObj._id || "");
        return {
          ...pObj,
          instagramUrl: productLinksMap[pid] || "",
        };
      }),
    };

    res.status(200).json({
      success: true,
      sections: homepage.sections,
      topInfoConfig: {
        ...defaultTopInfoConfig,
        ...(homepage.topInfoConfig?.toObject?.() ||
          homepage.topInfoConfig ||
          {}),
      },
      aboutSBS: homepage.aboutSBS,
      hiddenBeauty: homepage.hiddenBeauty,
      collections: filteredCollections,
      trendingThisWeek: filteredTrending,
      newArrivals: filteredNewArrivals,
      instagramDiaries: filteredInstagramDiaries,
      testimonials: homepage.testimonials,
      blogs: homepage.blogs,
      metaTitle: homepage.metaTitle || "",
      metaDescription: homepage.metaDescription || "",
      metaKeywords: homepage.metaKeywords || "",
      canonicalUrl: homepage.canonicalUrl || "",
      ogImage: homepage.ogImage || "",
      seoSchema: homepage.seoSchema || "",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update homepage settings
// @route   PATCH /api/v1/homepage/sections
// @access  Private/Admin
export const updateSections = async (req, res, next) => {
  try {
    applyNoStoreHeaders(res);
    const {
      sections,
      topInfoConfig,
      aboutSBS,
      hiddenBeauty,
      collections,
      trendingThisWeek,
      newArrivals,
      instagramDiaries,
      testimonials,
      blogs,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
      schema,
    } = req.body;

    let homepage = await Homepage.findOne();

    if (!homepage) {
      homepage = await Homepage.create({
        sections,
        topInfoConfig,
        aboutSBS,
        hiddenBeauty,
        collections,
        trendingThisWeek,
        newArrivals,
        instagramDiaries,
        testimonials,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogImage,
        schema: normalizeJsonLd(schema),
      });
    } else {
      if (sections) {
        homepage.sections = {
          ...homepage.sections.toObject(),
          ...sections,
        };
      }
      if (topInfoConfig) {
        homepage.topInfoConfig = {
          ...defaultTopInfoConfig,
          ...(homepage.topInfoConfig?.toObject?.() || homepage.topInfoConfig),
          ...topInfoConfig,
        };
      }
      if (aboutSBS) {
        homepage.aboutSBS = {
          ...(homepage.aboutSBS?.toObject?.() || homepage.aboutSBS),
          ...aboutSBS,
        };
        homepage.markModified("aboutSBS");
      }
      if (hiddenBeauty) {
        homepage.hiddenBeauty = {
          ...(homepage.hiddenBeauty?.toObject?.() || homepage.hiddenBeauty),
          ...hiddenBeauty,
        };
        if (Array.isArray(hiddenBeauty.categories)) {
          homepage.hiddenBeauty.categories = hiddenBeauty.categories;
        }
        homepage.markModified("hiddenBeauty");
      }
      if (collections) {
        homepage.collections = {
          ...(homepage.collections?.toObject?.() || homepage.collections),
          ...collections,
        };
        if (Array.isArray(collections.products)) {
          homepage.collections.products = collections.products;
        }
        homepage.markModified("collections");
      }
      if (trendingThisWeek) {
        homepage.trendingThisWeek = {
          ...(homepage.trendingThisWeek?.toObject?.() || homepage.trendingThisWeek),
          ...trendingThisWeek,
        };
        if (Array.isArray(trendingThisWeek.products)) {
          homepage.trendingThisWeek.products = trendingThisWeek.products;
        }
        homepage.markModified("trendingThisWeek");
      }
      if (newArrivals) {
        homepage.newArrivals = {
          ...(homepage.newArrivals?.toObject?.() || homepage.newArrivals),
          ...newArrivals,
        };
        if (Array.isArray(newArrivals.products)) {
          homepage.newArrivals.products = newArrivals.products;
        }
        homepage.markModified("newArrivals");
      }
      if (instagramDiaries) {
        homepage.instagramDiaries = {
          ...(homepage.instagramDiaries?.toObject?.() || homepage.instagramDiaries),
          ...instagramDiaries,
          isConfigured: true,
        };
        if (Array.isArray(instagramDiaries.products)) {
          homepage.instagramDiaries.products = instagramDiaries.products;
        }
        if (instagramDiaries.productLinks !== undefined) {
          if (instagramDiaries.productLinks instanceof Map) {
            homepage.instagramDiaries.productLinks = instagramDiaries.productLinks;
          } else if (
            typeof instagramDiaries.productLinks === "object" &&
            instagramDiaries.productLinks !== null
          ) {
            homepage.instagramDiaries.productLinks = new Map(
              Object.entries(instagramDiaries.productLinks),
            );
          }
        }
        homepage.markModified("instagramDiaries");
      }
      if (testimonials)
        homepage.testimonials = { ...homepage.testimonials, ...testimonials };
      if (blogs)
        homepage.blogs = { ...homepage.blogs, ...blogs };
      if (metaTitle !== undefined) homepage.metaTitle = metaTitle;
      if (metaDescription !== undefined)
        homepage.metaDescription = metaDescription;
      if (metaKeywords !== undefined) homepage.metaKeywords = metaKeywords;
      if (canonicalUrl !== undefined) homepage.canonicalUrl = canonicalUrl;
      if (ogImage !== undefined) homepage.ogImage = ogImage;
      if (schema !== undefined) homepage.schema = normalizeJsonLd(schema);

      await homepage.save();
    }

    res.status(200).json({
      success: true,
      sections: homepage.sections,
      topInfoConfig: homepage.topInfoConfig,
      aboutSBS: homepage.aboutSBS,
      hiddenBeauty: homepage.hiddenBeauty,
      collections: homepage.collections,
      trendingThisWeek: homepage.trendingThisWeek,
      newArrivals: homepage.newArrivals,
      instagramDiaries: homepage.instagramDiaries,
      testimonials: homepage.testimonials,
      blogs: homepage.blogs,
      metaTitle: homepage.metaTitle || "",
      metaDescription: homepage.metaDescription || "",
      metaKeywords: homepage.metaKeywords || "",
      canonicalUrl: homepage.canonicalUrl || "",
      ogImage: homepage.ogImage || "",
      seoSchema: homepage.seoSchema || "",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific section content
// @route   GET /api/v1/homepage/section/:sectionName
// @access  Public
export const getSectionContent = async (req, res, next) => {
  try {
    const { sectionName } = req.params;
    let homepage = await Homepage.findOne();

    if (!homepage) {
      homepage = await Homepage.create({});
    }

    await initializeHomepageIfEmpty(homepage);

    let query = Homepage.findOne();
    if (["hiddenBeauty"].includes(sectionName)) {
      query = query.populate({
        path: `${sectionName}.categories`,
        select: "name slug mainImage",
      });
    } else if (
      ["trendingThisWeek", "newArrivals", "collections", "instagramDiaries"].includes(sectionName)
    ) {
      query = query.populate({
        path: `${sectionName}.products`,
        select: "name slug mainImage variants price stock status",
      });
    }

    homepage = await query;

    let sectionData = homepage[sectionName];
    if (
      ["trendingThisWeek", "newArrivals", "collections", "instagramDiaries"].includes(sectionName) &&
      sectionData?.products
    ) {
      const isProductInStock = (p) => {
        if (!p) return false;
        const hasVariantSizes = p.variants?.some(
          (v) => Array.isArray(v.sizes) && v.sizes.length > 0,
        );
        if (hasVariantSizes) {
          const hasVariantStock = p.variants.some((v) =>
            v.sizes?.some((s) => Number(s.stock || 0) > 0),
          );
          const hasOverallStock = p.stock === undefined || Number(p.stock) > 0;
          return hasVariantStock && hasOverallStock;
        }
        return Number(p.stock || 0) > 0;
      };
      const rawObj = sectionData.toObject ? sectionData.toObject() : sectionData;
      rawObj.products = (rawObj.products || []).filter(
        (p) => p && p.status === "Active" && p.isActive !== false && isProductInStock(p)
      );

      if (sectionName === "instagramDiaries") {
        const rawProductLinks = rawObj.productLinks;
        const productLinksMap =
          rawProductLinks instanceof Map
            ? Object.fromEntries(rawProductLinks)
            : typeof rawProductLinks === "object" && rawProductLinks !== null
              ? rawProductLinks
              : {};

        rawObj.products = rawObj.products.map((p) => {
          const pObj = p?.toObject
            ? p.toObject()
            : typeof p === "object" && p !== null
              ? { ...p }
              : { _id: p };
          const pid = pObj._id?.toString?.() || String(pObj._id || "");
          return {
            ...pObj,
            instagramUrl: productLinksMap[pid] || "",
          };
        });
      }

      sectionData = rawObj;
    }

    res.status(200).json({
      success: true,
      data: sectionData,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSchema = async (req, res, next) => {
  try {
    const homepage = req.body;
    const settings = await SeoSettings.findOne();
    const generatedSchema = generateHomepageSchema(homepage, settings);

    res.status(200).json({
      success: true,
      schema: generatedSchema,
    });
  } catch (error) {
    next(error);
  }
};
