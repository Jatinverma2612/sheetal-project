import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { config } from "../config/config.js";
import logger from "../utils/logger.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Maps incoming folder names to target Cloudinary folder paths under sheetal/
 */
export const resolveCloudinaryFolder = (folderName = "") => {
  const normalized = String(folderName).trim().toLowerCase();

  if (normalized.startsWith("sheetal/")) {
    return folderName;
  }

  switch (normalized) {
    case "banner":
    case "banners":
      return "sheetal/banners";
    case "blog":
    case "blogs":
      return "sheetal/blogs";
    case "brand":
    case "brands":
      return "sheetal/brands";
    case "category":
    case "categories":
      return "sheetal/categories";
    case "instacard":
    case "instacards":
    case "instagram":
      return "sheetal/instacards";
    case "lookbook":
    case "lookbooks":
      return "sheetal/lookbooks";
    case "page":
    case "pages":
    case "about":
    case "settings":
      return "sheetal/pages";
    case "product":
    case "products":
      return "sheetal/products";
    case "sizechart":
    case "sizecharts":
      return "sheetal/sizeChart";
    case "testimonial":
    case "testimonials":
      return "sheetal/testimonials";
    case "user":
    case "users":
      return "sheetal/users";
    default:
      return folderName ? `sheetal/${folderName}` : "sheetal";
  }
};

/**
 * Custom Multer storage engine for Cloudinary stream uploads
 */
export class CloudinaryStorageEngine {
  constructor(options = {}) {
    this.folderName = options.folderName || "general";
  }

  _handleFile(req, file, cb) {
    const folder = resolveCloudinaryFolder(this.folderName);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const folderPrefix = this.folderName.replace(/\//g, "-");
    const publicId = `${folderPrefix}-${uniqueSuffix}`;

    const isVideo =
      file.fieldname === "video" ||
      file.fieldname === "variantVideo" ||
      file.fieldname === "variantVideos" ||
      file.mimetype?.startsWith("video/");

    let isDone = false;
    const safeCallback = (err, info) => {
      if (isDone) return;
      isDone = true;
      cb(err, info);
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: isVideo ? "video" : "auto",
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary stream upload failed: ${error.message}`);
          return safeCallback(error);
        }

        safeCallback(null, {
          location: result.secure_url,
          url: result.secure_url,
          path: result.secure_url,
          key: result.public_id,
          public_id: result.public_id,
          filename: result.public_id,
          size: result.bytes,
          format: result.format,
          resource_type: result.resource_type,
        });
      },
    );

    uploadStream.on("error", (err) => {
      logger.error(`Cloudinary uploadStream error: ${err.message}`);
      safeCallback(err);
    });

    if (file.stream) {
      file.stream.on("error", (err) => {
        logger.error(`Multer file.stream error: ${err.message}`);
        uploadStream.destroy();
        safeCallback(err);
      });
      file.stream.pipe(uploadStream);
    } else {
      safeCallback(new Error("File stream is missing"));
    }
  }

  _removeFile(req, file, cb) {
    const publicId = file.public_id || file.key;
    if (!publicId) return cb(null);

    deleteFromCloudinary(publicId, file.resource_type || "image")
      .then(() => cb(null))
      .catch((err) => cb(err));
  }
}

/**
 * Uploads a local file (e.g. temp excel import asset) to Cloudinary
 */
export const uploadCloudinaryFile = async (filePath, folderName) => {
  try {
    const folder = resolveCloudinaryFolder(folderName);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(filePath).toLowerCase();
    const isVideo = [".mp4", ".webm", ".mov", ".mkv"].includes(ext);

    const folderPrefix = String(folderName || "file").replace(/\//g, "-");
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: `${folderPrefix}-${uniqueSuffix}`,
      resource_type: isVideo ? "video" : "auto",
    });

    return {
      url: result.secure_url,
      location: result.secure_url,
      public_id: result.public_id,
      key: result.public_id,
    };
  } catch (error) {
    logger.error(`Cloudinary upload failed for ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes an asset from Cloudinary using its public_id
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  try {
    // Strip file extension if present in publicId (e.g., sheetal/products/abc.jpg -> sheetal/products/abc)
    const cleanedPublicId = publicId.replace(/\.[^/.]+$/, "");
    let res = await cloudinary.uploader.destroy(cleanedPublicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (res.result !== "ok" && resourceType === "image") {
      // Retry with "video" if "image" destruction returned "not found"
      res = await cloudinary.uploader.destroy(cleanedPublicId, {
        resource_type: "video",
        invalidate: true,
      });
    }

    logger.info(
      `Cloudinary asset deletion attempted: ${cleanedPublicId} (result: ${res.result})`,
    );
  } catch (err) {
    logger.error(`Cloudinary asset delete error: ${err.message}`);
  }
};

export default cloudinary;
