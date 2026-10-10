import Return from "../models/return.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ErrorResponse from "../utils/ErrorResponse.js";

// --- 1. REQUEST RETURN (User) ---
export const requestReturnService = async (data, userId, files) => {
  const { orderId, productId, type, reason, details } = data;

  // Check karo order exist karta hai aur Delivered hai
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new ErrorResponse("Order nahi mila", 404);
  if (order.orderStatus !== "Delivered") {
    throw new ErrorResponse("Sirf Delivered orders return ho sakte hain", 400);
  }

  // Image paths array
  const images = files ? files.map((file) => ({ url: file.path })) : [];

  const returnRequest = await Return.create({
    order: orderId,
    user: userId,
    product: productId,
    type,
    reason,
    details,
    images,
  });

  // Order status ko bhi update kar sakte hain
  order.orderStatus = "Return Requested";
  await order.save();

  return returnRequest;
};

// --- 2. UPDATE RETURN STATUS (Admin) ---
export const updateReturnStatusService = async (
  returnId,
  status,
  adminComment,
) => {
  const returnReq = await Return.findById(returnId).populate("product");
  if (!returnReq) throw new ErrorResponse("Return request nahi mili", 404);

  returnReq.status = status;
  if (adminComment) returnReq.adminComment = adminComment;

  // AGAR APPROVED HAI TOH STOCK WAPAS ADD KARO
  if (status === "Completed") {
    const product = await Product.findById(returnReq.product);
    if (product) {
      product.stock += 1; // Assuming 1 quantity return
      await product.save();
    }
    returnReq.refundStatus = "Processed";
  }

  if (status === "Rejected") {
    returnReq.refundStatus = "Not Applicable";
  }

  await returnReq.save();
  return returnReq;
};
