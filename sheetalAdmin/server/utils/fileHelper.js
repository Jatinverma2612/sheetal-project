import fs from "fs/promises";
import path from "path";
import logger from "./logger.js";
import { deleteStorageAsset, uploadFileToActiveStorage } from "../storage/index.js";

export const deleteFile = async (filePath) => {
  if (!filePath) return;

  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    await fs.unlink(fullPath);
    logger.info(`File successfully delete hui: ${filePath}`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      logger.error(`File delete karne mein error: ${err.message}`);
    }
  }
};

/**
 * Provider-aware asset deletion function (retains legacy deleteS3File name for backwards compatibility)
 */
export const deleteS3File = async (key, url = "") => {
  if (!key && !url) return;
  await deleteStorageAsset(key, url);
};

/**
 * Provider-aware asset upload function (retains legacy uploadS3File name for backwards compatibility)
 */
export const uploadS3File = async (filePath, folderName) => {
  return await uploadFileToActiveStorage(filePath, folderName);
};

