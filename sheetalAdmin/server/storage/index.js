import fs from "fs/promises";
import path from "path";
import { config } from "../config/config.js";
import logger from "../utils/logger.js";
import {
  CloudinaryStorageEngine,
  uploadCloudinaryFile,
  deleteFromCloudinary,
} from "./cloudinary.js";
import {
  createS3MulterStorage,
  uploadS3File,
  deleteFromS3,
} from "./s3.js";

/**
 * Gets the configured active storage provider ('cloudinary' | 's3')
 */
export const getActiveStorageProvider = () => {
  return String(config.storageProvider || "cloudinary").toLowerCase().trim();
};

/**
 * Returns the appropriate Multer storage engine based on IMAGE_STORAGE_PROVIDER
 */
export const getMulterStorageEngine = (folderName) => {
  const provider = getActiveStorageProvider();

  if (provider === "s3") {
    return createS3MulterStorage(folderName);
  }

  return new CloudinaryStorageEngine({ folderName });
};


/**
 * Standalone file upload dispatcher for active storage provider
 */
export const uploadFileToActiveStorage = async (filePath, folderName) => {
  const provider = getActiveStorageProvider();

  if (provider === "s3") {
    return await uploadS3File(filePath, folderName);
  }

  return await uploadCloudinaryFile(filePath, folderName);
};

/**
 * Provider-aware asset deletion. Determines whether an asset belongs to
 * Cloudinary, AWS S3, or local disk, and invokes the matching deletion API.
 */
export const deleteStorageAsset = async (identifier, url = "") => {
  if (!identifier && !url) return;

  const targetStr = `${identifier || ""} ${url || ""}`.toLowerCase();

  // Check 1: Explicit Cloudinary URL or public_id starting with sheetal/
  const isCloudinary =
    targetStr.includes("cloudinary.com") ||
    targetStr.includes("res.cloudinary") ||
    String(identifier || "").startsWith("sheetal/");

  // Check 2: Explicit S3 URL or S3 hostname
  const isS3 =
    targetStr.includes("amazonaws.com") ||
    targetStr.includes(".s3.");

  if (isCloudinary) {
    logger.info(`[StorageDelete] Routing to Cloudinary destroy: ${identifier}`);
    await deleteFromCloudinary(identifier);
    return;
  }

  if (isS3) {
    logger.info(`[StorageDelete] Routing to AWS S3 DeleteObjectCommand: ${identifier}`);
    await deleteFromS3(identifier);
    return;
  }

  // Fallback check based on active provider if URL context wasn't stored
  const activeProvider = getActiveStorageProvider();
  if (activeProvider === "cloudinary" && identifier) {
    logger.info(`[StorageDelete] Active provider fallback -> Cloudinary: ${identifier}`);
    await deleteFromCloudinary(identifier);
  } else if (activeProvider === "s3" && identifier) {
    logger.info(`[StorageDelete] Active provider fallback -> S3: ${identifier}`);
    await deleteFromS3(identifier);
  } else if (url && !url.startsWith("http")) {
    // Local file path
    try {
      const fullPath = path.resolve(process.cwd(), url);
      await fs.unlink(fullPath);
      logger.info(`[StorageDelete] Local file deleted: ${url}`);
    } catch (err) {
      if (err.code !== "ENOENT") {
        logger.error(`[StorageDelete] Local file delete error: ${err.message}`);
      }
    }
  }
};
