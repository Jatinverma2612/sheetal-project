import * as returnService from "../services/return.service.js";
import successResponse from "../utils/successResponse.js";

export const createReturnRequest = async (req, res, next) => {
  try {
    const data = await returnService.requestReturnService(
      req.body,
      req.user._id,
      req.files,
    );
    return successResponse(
      res,
      201,
      data,
      "Return request submitted successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const adminUpdateReturn = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;
    const data = await returnService.updateReturnStatusService(
      req.params.id,
      status,
      adminComment,
    );
    return successResponse(
      res,
      200,
      data,
      `Return status updated to ${status}`,
    );
  } catch (error) {
    next(error);
  }
};

export const getAllReturns = async (req, res, next) => {
  try {
    const returns = await Return.find()
      .populate("user", "name")
      .populate("product", "name");
    return successResponse(res, 200, returns, "All return requests fetched");
  } catch (error) {
    next(error);
  }
};
