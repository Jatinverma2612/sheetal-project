import * as settingsService from "../services/settings.service.js";
import successResponse from "../utils/successResponse.js";

export const getSettings = async (req, res, next) => {
  try {
    const result = await settingsService.getSettings();
    if (!result.success) return res.status(500).json(result);
    return successResponse(res, 200, result.data, "Settings retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateSettings(req.body);
    if (!result.success) return res.status(500).json(result);
    return successResponse(res, 200, result.data, "Settings updated");
  } catch (error) {
    next(error);
  }
};

export const updateLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo file uploaded" });
    }

    const logoData = {
      url: req.file.location, // S3 location from multer-s3
      dimensions: {
        width: req.body.width ? parseInt(req.body.width) : undefined,
        height: req.body.height ? parseInt(req.body.height) : undefined,
      },
    };

    const result = await settingsService.updateLogo(logoData);
    if (!result.success) return res.status(500).json(result);
    return successResponse(res, 200, result.data, "Logo updated successfully");
  } catch (error) {
    next(error);
  }
};

export const restoreLogo = async (req, res, next) => {
  try {
    const { historyId } = req.params;
    const result = await settingsService.restoreLogo(historyId);
    if (!result.success) return res.status(500).json(result);
    return successResponse(res, 200, result.data, "Logo restored successfully");
  } catch (error) {
    next(error);
  }
};

export const updateFavicon = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No favicon file uploaded" });
    }

    const result = await settingsService.updateSettings({ favicon: req.file.location });
    if (!result.success) return res.status(500).json(result);
    return successResponse(res, 200, result.data, "Favicon updated successfully");
  } catch (error) {
    next(error);
  }
};
