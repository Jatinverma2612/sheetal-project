import SeoSettings from "../models/seosettings.model.js";
import { generateGlobalSchema } from "../utils/schemaGenerator.js";
import successResponse from "../utils/successResponse.js";
import { normalizeJsonLd } from "../utils/jsonLd.js";

// @desc    Get SEO settings
// @route   GET /api/v1/seo-settings
// @access  Public
export const getSeoSettings = async (req, res, next) => {
  try {
    let settings = await SeoSettings.findOne();
    if (!settings) {
      settings = await SeoSettings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update SEO settings
// @route   PATCH /api/v1/seo-settings
// @access  Private/Admin
export const updateSeoSettings = async (req, res, next) => {
  try {
    const { seoSchema, ...otherData } = req.body;

    let settings = await SeoSettings.findOne();
    if (!settings) {
      settings = new SeoSettings(otherData);
    } else {
      Object.assign(settings, otherData);
    }

    if (seoSchema !== undefined) {
      settings.seoSchema = normalizeJsonLd(seoSchema, "Global schema");
    }

    await settings.save();

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Global Schema
// @route   POST /api/v1/seo-settings/generate-schema
// @access  Private/Admin
export const generateSeoSchema = async (req, res, next) => {
  try {
    const settings = req.body;
    const generatedSchema = generateGlobalSchema(settings);

    res.status(200).json({
      success: true,
      schema: generatedSchema,
    });
  } catch (error) {
    next(error);
  }
};
