import FAQ from "../models/faq.model.js";
import SeoSettings from "../models/seosettings.model.js";
import { generateFaqSchema } from "../utils/schemaGenerator.js";
import { normalizeJsonLd } from "../utils/jsonLd.js";

// @desc    Get FAQ Page Data
// @route   GET /api/v1/faq
// @access  Public
export const getFaqPage = async (req, res, next) => {
  try {
    let faqPage = await FAQ.findOne();

    if (!faqPage) {
      // Create default if not exists
      faqPage = await FAQ.create({
        pageTitle: "Frequently Asked Questions",
        faqs: [],
      });
    }

    res.status(200).json({
      success: true,
      page: faqPage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update FAQ Page
// @route   POST /api/v1/faq
// @access  Private/Admin
export const updateFaqPage = async (req, res, next) => {
  try {
    let faqPage = await FAQ.findOne();

    if (!faqPage) {
      faqPage = new FAQ({});
    }

    const {
      pageTitle,
      ctaText,
      ctaButtonText,
      ctaButtonLink,
      faqs,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
      seoSchema,
    } = req.body;

    if (pageTitle !== undefined) faqPage.pageTitle = pageTitle;
    if (ctaText !== undefined) faqPage.ctaText = ctaText;
    if (ctaButtonText !== undefined) faqPage.ctaButtonText = ctaButtonText;
    if (ctaButtonLink !== undefined) faqPage.ctaButtonLink = ctaButtonLink;
    if (faqs !== undefined) faqPage.faqs = faqs;
    if (metaTitle !== undefined) faqPage.metaTitle = metaTitle;
    if (metaDescription !== undefined) faqPage.metaDescription = metaDescription;
    if (metaKeywords !== undefined) faqPage.metaKeywords = metaKeywords;
    if (canonicalUrl !== undefined) faqPage.canonicalUrl = canonicalUrl;
    if (ogImage !== undefined) faqPage.ogImage = ogImage;
    if (seoSchema !== undefined) {
      faqPage.seoSchema = normalizeJsonLd(seoSchema);
    }

    if (req.user) {
      faqPage.updatedBy = req.user._id;
    }

    await faqPage.save();

    res.status(200).json({
      success: true,
      message: "FAQ page updated successfully",
      page: faqPage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate FAQ Schema
// @route   POST /api/v1/faq/generate-schema
// @access  Private/Admin
export const generateFaqSchemaAction = async (req, res, next) => {
  try {
    const faqPage = req.body;
    const settings = await SeoSettings.findOne();
    const generatedSchema = generateFaqSchema(faqPage, settings);

    res.status(200).json({
      success: true,
      schema: generatedSchema,
    });
  } catch (error) {
    next(error);
  }
};
