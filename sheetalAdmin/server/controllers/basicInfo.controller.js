import successResponse from "../utils/successResponse.js";
import * as basicInfoService from "../services/basicInfo.service.js";

const getSafeBasicInfoStatusCode = (result) => {
  const explicitStatus = Number(result?.statusCode);
  if (Number.isInteger(explicitStatus) && explicitStatus >= 400) {
    return explicitStatus;
  }

  const message = `${result?.message || ""}`.toLowerCase();
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("missing")
  ) {
    return 422;
  }

  if (message.includes("duplicate")) {
    return 409;
  }

  return 500;
};

const sendSafeBasicInfoError = (res, action, result) => {
  console.error(`[basic-info] ${action} failed:`, result?.message || result);

  const statusCode = getSafeBasicInfoStatusCode(result);
  const message =
    statusCode >= 500
      ? `Failed to ${action} basic info`
      : "Invalid basic info data";

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};

export const getBasicInfo = async (req, res, next) => {
  try {
    const result = await basicInfoService.getBasicInfo();
    if (!result.success) {
      return sendSafeBasicInfoError(res, "load", result);
    }
    return successResponse(res, 200, result.data, "Basic info retrieved");
  } catch (error) {
    next(error);
  }
};

export const getPublicBasicInfo = async (req, res, next) => {
  try {
    const result = await basicInfoService.getBasicInfo();
    if (!result.success) {
      return sendSafeBasicInfoError(res, "load", result);
    }

    return successResponse(res, 200, result.data, "Basic info retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateBasicInfo = async (req, res, next) => {
  try {
    const result = await basicInfoService.updateBasicInfo(
      req.body,
      req.user?._id || null,
    );
    if (!result.success) {
      return sendSafeBasicInfoError(res, "update", result);
    }
    return successResponse(res, 200, result.data, "Basic info updated");
  } catch (error) {
    next(error);
  }
};
