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

  // Initialize Hidden Beauty categories if empty
  if (!homepage.hiddenBeauty?.categories?.length) {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .limit(10);
    homepage.hiddenBeauty = {
      ...homepage.hiddenBeauty,
      categories: categories.map((c) => c._id),
    };
    updated = true;
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
      });

    const isAvailableProductForPublic = (p) => {
      if (!p || !p._id || !p.slug || !p.name) return false;
      if (p.status !== "Active" || p.isActive === false) return false;
      return true;
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

    // Build section list: only include products that currently have the flag = true
    const buildSectionProducts = (curatedProducts, flaggedList) => {
      const flaggedMap = new Map(flaggedList.map((p) => [p._id.toString(), p]));
      const result = [];
      const seenIds = new Set();

      // First add curated products that still have the flag = true and are in stock/active
      (curatedProducts || []).forEach((p) => {
        if (!p) return;
        const pId = (p._id || p).toString();
        const flaggedItem = flaggedMap.get(pId);
        if (flaggedItem && isAvailableProductForPublic(flaggedItem)) {
          result.push(flaggedItem);
          seenIds.add(pId);
        }
      });

      // Then add any newly flagged products not yet in curated list
      flaggedList.forEach((p) => {
        const pId = p._id.toString();
        if (!seenIds.has(pId) && isAvailableProductForPublic(p)) {
          result.push(p);
          seenIds.add(pId);
        }
      });

      return result;
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
      if (aboutSBS) homepage.aboutSBS = { ...homepage.aboutSBS, ...aboutSBS };
      if (hiddenBeauty)
        homepage.hiddenBeauty = { ...homepage.hiddenBeauty, ...hiddenBeauty };
      if (collections)
        homepage.collections = { ...homepage.collections, ...collections };
      if (trendingThisWeek)
        homepage.trendingThisWeek = {
          ...homepage.trendingThisWeek,
          ...trendingThisWeek,
        };
      if (newArrivals)
        homepage.newArrivals = { ...homepage.newArrivals, ...newArrivals };
      if (instagramDiaries)
        homepage.instagramDiaries = {
          ...homepage.instagramDiaries,
          ...instagramDiaries,
        };
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
      ["trendingThisWeek", "newArrivals", "collections"].includes(sectionName)
    ) {
      query = query.populate({
        path: `${sectionName}.products`,
        select: "name slug mainImage variants price stock status",
      });
    }

    homepage = await query;

    res.status(200).json({
      success: true,
      data: homepage[sectionName],
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
