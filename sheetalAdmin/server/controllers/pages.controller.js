import About from "../models/about.model.js";
import Page from "../models/page.model.js";
import SeoSettings from "../models/seosettings.model.js";
import { generatePageSchema } from "../utils/schemaGenerator.js";
import { normalizeJsonLd } from "../utils/jsonLd.js";
import {
  createPage,
  deletePage,
  getFooterPages,
  getPageById,
  getPublishedPageBySlug,
  LEGACY_PAGE_SLUGS,
  listPages,
  normalizePageSlug,
  updatePage,
} from "../services/page.service.js";

const legacyPageDefaults = {
  "terms-and-conditions": {
    title: "Terms and Conditions",
    content: `
      <h1>Terms and Conditions</h1>
      <p>Welcome to Studio By Sheetal. These terms and conditions outline the rules and regulations for the use of our website and services.</p>
      <h2>1. Introduction</h2>
      <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use Studio By Sheetal if you do not agree to take all of the terms and conditions stated on this page.</p>
      <h2>2. Intellectual Property Rights</h2>
      <p>Other than the content you own, under these Terms, Studio By Sheetal and/or its licensors own all the intellectual property rights and materials contained in this Website.</p>
      <h2>3. Restrictions</h2>
      <p>You are specifically restricted from publishing, selling, sublicensing, or otherwise commercializing any Website material without permission.</p>
      <h2>4. Governing Law</h2>
      <p>These Terms will be governed by and interpreted in accordance with applicable laws.</p>
    `.trim(),
  },
  "privacy-policy": {
    title: "Privacy Policy",
    content: `
      <h1>Privacy Policy</h1>
      <p>Your privacy is important to us. Studio By Sheetal respects your privacy regarding information we may collect from you across our website.</p>
      <h2>1. Information We Collect</h2>
      <p>We collect personal information when needed to provide our services, process orders, and improve your shopping experience.</p>
      <h2>2. Use of Information</h2>
      <p>We use your personal data to process orders, communicate updates, and improve our services.</p>
      <h2>3. Data Protection</h2>
      <p>We retain collected information only as long as necessary and protect it through commercially acceptable means.</p>
      <h2>4. Cookies</h2>
      <p>We use cookies to understand site usage and improve our offerings.</p>
    `.trim(),
  },
  "shipping-policy": {
    title: "Shipping Policy",
    content: `
      <h1>Shipping Policy</h1>
      <p>Thank you for shopping with Studio By Sheetal. This shipping policy explains how we process, dispatch, and deliver orders.</p>
      <h2>1. Order Processing</h2>
      <p>Orders are typically processed within 1-3 business days after payment confirmation.</p>
      <h2>2. Shipping Timelines</h2>
      <p>Estimated delivery timelines depend on your shipping location and courier availability.</p>
      <h2>3. Shipping Charges</h2>
      <p>Applicable shipping charges, if any, are displayed during checkout.</p>
      <h2>4. Delivery Delays</h2>
      <p>We are not liable for delays caused by courier partners, weather, public holidays, or circumstances beyond our control.</p>
    `.trim(),
  },
  "return-exchange-policy": {
    title: "Return & Exchange Policy",
    content: `
      <h1>Return & Exchange Policy</h1>
      <p>We want you to have a smooth shopping experience. This policy explains the conditions under which returns and exchanges may be accepted.</p>
      <h2>1. Eligibility</h2>
      <p>Items may be eligible only if unused, unwashed, and returned in original condition with tags and packaging intact.</p>
      <h2>2. Request Window</h2>
      <p>Return or exchange requests must be raised within the communicated timeline from delivery.</p>
      <h2>3. Non-Returnable Items</h2>
      <p>Certain made-to-order, customized, discounted, intimate, or hygiene-sensitive items may not be eligible.</p>
      <h2>4. Refunds and Exchanges</h2>
      <p>After inspection, refunds or exchanges are processed according to the applicable payment method and timelines.</p>
    `.trim(),
  },
};

// @desc    Get About Page Data
// @route   GET /api/v1/pages/about
// @access  Public
export const getAboutPage = async (req, res, next) => {
  try {
    const about = await About.findOne();

    res.status(200).json({
      success: true,
      page: about || {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update About Page
// @route   POST /api/v1/pages/about
// @access  Private/Admin
export const updateAboutPage = async (req, res, next) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = new About({});
    }

    const handleFile = (section, fieldName) => {
      if (req.files && req.files[fieldName]) {
        if (!about[section]) about[section] = {};
        about[section].image = req.files[fieldName][0].location;
      }
    };

    if (req.body.bannerTitle) {
      if (!about.banner) about.banner = {};
      about.banner.title = req.body.bannerTitle;
    }
    handleFile("banner", "bannerImage");

    if (req.body.journeyTitle) {
      if (!about.journey) about.journey = {};
      about.journey.title = req.body.journeyTitle;
      about.journey.description = req.body.journeyDescription;
    }
    handleFile("journey", "founderImage");

    if (req.body.missionTitle) {
      if (!about.mission) about.mission = {};
      about.mission.title = req.body.missionTitle;
      about.mission.description = req.body.missionDescription;
    }
    handleFile("mission", "missionImage");

    if (req.body.craftTitle) {
      if (!about.craft) about.craft = {};
      about.craft.title = req.body.craftTitle;
      about.craft.description = req.body.craftDescription;
    }
    handleFile("craft", "craftImage");

    if (req.body.metaTitle !== undefined) about.metaTitle = req.body.metaTitle;
    if (req.body.metaDescription !== undefined) {
      about.metaDescription = req.body.metaDescription;
    }
    if (req.body.metaKeywords !== undefined) {
      about.metaKeywords = req.body.metaKeywords;
    }
    if (req.body.canonicalUrl !== undefined) {
      about.canonicalUrl = req.body.canonicalUrl;
    }
    if (req.body.ogImage !== undefined) about.ogImage = req.body.ogImage;
    if (req.body.schema !== undefined) {
      about.seoSchema = normalizeJsonLd(req.body.schema);
    }

    if (req.user) {
      about.updatedBy = req.user._id;
    }

    await about.save();

    res.status(200).json({
      success: true,
      message: "About page updated successfully",
      page: about,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get published page content by slug
// @route   GET /api/v1/pages/slug/:slug
// @access  Public
export const getPageBySlug = async (req, res, next) => {
  try {
    const slug = normalizePageSlug(req.params.slug);
    let page;

    if (LEGACY_PAGE_SLUGS.includes(slug)) {
      page = await Page.findOne({ slug });
      if (!page) {
        page = await Page.create({
          slug,
          ...legacyPageDefaults[slug],
        });
      }
    } else {
      page = await getPublishedPageBySlug(slug);
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List static pages for admin
// @route   GET /api/v1/pages/admin
// @access  Private/Admin
export const getAdminPages = async (req, res, next) => {
  try {
    const pages = await listPages({ search: req.query.search });

    res.status(200).json({
      success: true,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get static page for admin
// @route   GET /api/v1/pages/admin/:id
// @access  Private/Admin
export const getAdminPage = async (req, res, next) => {
  try {
    const page = await getPageById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      page,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create static page
// @route   POST /api/v1/pages/admin
// @access  Private/Admin
export const createAdminPage = async (req, res, next) => {
  try {
    const page = await createPage(
      {
        ...req.body,
        seoSchema:
          req.body.schema !== undefined
            ? normalizeJsonLd(req.body.schema)
            : req.body.seoSchema,
      },
      req.user?._id,
    );

    res.status(201).json({
      success: true,
      message: "Page created successfully",
      page,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.message = "A page with this slug already exists";
      error.statusCode = 409;
    }
    next(error);
  }
};

// @desc    Update static page
// @route   PUT /api/v1/pages/admin/:id
// @access  Private/Admin
export const updateAdminPage = async (req, res, next) => {
  try {
    const page = await updatePage(
      req.params.id,
      {
        ...req.body,
        seoSchema:
          req.body.schema !== undefined
            ? normalizeJsonLd(req.body.schema)
            : req.body.seoSchema,
      },
      req.user?._id,
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Page updated successfully",
      page,
    });
  } catch (error) {
    if (error.code === 11000) {
      error.message = "A page with this slug already exists";
      error.statusCode = 409;
    }
    next(error);
  }
};

// @desc    Delete static page
// @route   DELETE /api/v1/pages/admin/:id
// @access  Private/Admin
export const deleteAdminPage = async (req, res, next) => {
  try {
    const page = await deletePage(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get published footer pages
// @route   GET /api/v1/pages/public/footer
// @access  Public
export const getPublishedFooterPages = async (req, res, next) => {
  try {
    const pages = await getFooterPages();

    res.status(200).json({
      success: true,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Page Content by Slug
// @route   POST /api/v1/pages/slug/:slug
// @access  Private/Admin
export const updatePageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const normalizedSlug = normalizePageSlug(slug);
    const {
      title,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      status,
      footerPlacement,
      schema,
    } = req.body;

    let page = await Page.findOne({ slug: normalizedSlug });

    if (!page) {
      page = new Page({ slug: normalizedSlug });
    }

    if (title !== undefined) page.title = title;
    if (content !== undefined) page.content = content;
    if (metaTitle !== undefined) page.metaTitle = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (metaKeywords !== undefined) page.metaKeywords = metaKeywords;
    if (canonicalUrl !== undefined) page.canonicalUrl = canonicalUrl;
    if (ogTitle !== undefined) page.ogTitle = ogTitle;
    if (ogDescription !== undefined) page.ogDescription = ogDescription;
    if (ogImage !== undefined) page.ogImage = ogImage;
    if (status !== undefined) page.status = status;
    if (footerPlacement !== undefined) page.footerPlacement = footerPlacement;
    if (schema !== undefined) {
      page.seoSchema = normalizeJsonLd(schema);
    }

    if (req.user) {
      page.updatedBy = req.user._id;
    }

    await page.save();

    res.status(200).json({
      success: true,
      message: `${page.title} updated successfully`,
      page,
    });
  } catch (error) {
    next(error);
  }
};

export const generateSchema = async (req, res, next) => {
  try {
    const page = req.body;
    const settings = await SeoSettings.findOne();
    const generatedSchema = generatePageSchema(page, settings);

    res.status(200).json({
      success: true,
      schema: generatedSchema,
    });
  } catch (error) {
    next(error);
  }
};
