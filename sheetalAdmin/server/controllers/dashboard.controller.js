import { getAdminStatsService } from "../services/dashboard.service.js";
import successResponse from "../utils/successResponse.js";

export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const result = await getAdminStatsService();

    return successResponse(
      res,
      200,
      result,
      "Admin dashboard data fetched successfully",
    );
  } catch (error) {
    next(error);
  }
};
