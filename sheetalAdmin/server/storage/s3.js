import multerS3 from "multer-s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import s3 from "../config/s3.js";
import { config } from "../config/config.js";
import logger from "../utils/logger.js";

/**
 * Creates a MulterS3 storage engine for a specific folder
 */
export const createS3MulterStorage = (folderName) => {
  return multerS3({
    s3: s3,
    bucket: config.aws.bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileName = `${folderName}/${folderName}-${uniqueSuffix}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  });
};

/**
 * Uploads a local file to AWS S3
 */
export const uploadS3File = async (filePath, folderName) => {
  try {
    const fileContent = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const key = `${folderName}/${uniqueSuffix}-${fileName}`;

    let contentType = "application/octet-stream";
    if (fileName.match(/\.(jpg|jpeg)$/i)) contentType = "image/jpeg";
    else if (fileName.match(/\.png$/i)) contentType = "image/png";
    else if (fileName.match(/\.webp$/i)) contentType = "image/webp";
    else if (fileName.match(/\.mp4$/i)) contentType = "video/mp4";

    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3.send(command);

    const url = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;

    return {
      url,
      location: url,
      key,
      public_id: key,
    };
  } catch (error) {
    logger.error(`S3 Upload failed for ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes an object from AWS S3 using its key
 */
export const deleteFromS3 = async (key) => {
  if (!key) return;

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
    });
    await s3.send(command);
    logger.info(`S3 Object successfully deleted: ${key}`);
  } catch (err) {
    logger.error(`S3 Object delete error: ${err.message}`);
  }
};
