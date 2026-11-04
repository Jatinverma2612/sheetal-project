import sendEmail from "../utils/sendEmail.js";

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const buildAddressLines = (address = {}) => {
  const line1 = address.addressLine1 || "";
  const line2 = [address.city, address.state].filter(Boolean).join(", ");
  const line3 = [address.postalCode, address.country || "India"]
    .filter(Boolean)
    .join(" ");

  return [line1, line2, line3].filter(Boolean);
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildItemRows = (items = []) =>
  items
    .map((item) => {
      const safeName = escapeHtml(item.name || "Product");
      const safeQty = escapeHtml(item.qty ?? "");
      const safePrice = escapeHtml(item.price ?? "");
      const safeTotal = escapeHtml(item.total ?? "");

      return `
        <tr>
          <td style="border:1px solid #ddd;font-size:14px;">${safeName}</td>
          <td style="border:1px solid #ddd;font-size:14px;">${safeQty}</td>
          <td style="border:1px solid #ddd;font-size:14px;">${safePrice}</td>
          <td style="border:1px solid #ddd;font-size:14px;">${safeTotal}</td>
        </tr>`;
    })
    .join("");

export const orderConfirmationTemplate = (data) => {
  const bannerMarkup = data.bannerUrl
    ? `<tr><td align="center" style="padding:0;"><img src="${data.bannerUrl}" alt="Studio By Sheetal" width="600" style="height:auto;display:block;border:0;"></td></tr>`
    : `<tr><td align="center" style="padding:28px 20px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Studio By Sheetal</p></td></tr>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Order Confirmation - Studio By Sheetal</title>
    <style>
      table, td, div, h1, h2, h3, p { font-family: Arial, sans-serif; }
    </style>
  </head>
  <body style="margin:20px;padding:0;background:#ffffff;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tbody>
        <tr>
          <td align="center" style="padding:0;">
            <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #16690094;border-spacing:0;text-align:left;">
              <tbody>
                ${bannerMarkup}
                <tr>
                  <td style="padding:36px 30px 42px 30px;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                      <tbody>
                        <tr>
                          <td style="text-align:center;color:#9e5900;border-bottom:1px solid #9e5900;">
                            <h2 style="margin:12px 0;font-size:24px;">Order Confirmed</h2>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align:center;color:#9e5900;padding:8px 0;">&nbsp;</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 36px 0;color:#153643;">
                            <p style="margin:0 0 12px 0;font-size:20px;line-height:24px;">
                              Dear ${data.userName},
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              Thank you for your order. Here are your order details:
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              <strong>Submitted on:</strong> ${data.submittedOn}
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              <strong>Order ID:</strong> ${data.orderId}
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              <strong>Order Date:</strong> ${data.orderDate}
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              <strong>Status:</strong> ${data.orderStatus}
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              <h3 style="margin:8px 0;font-size:18px;">Products</h3>
                            </p>
                            <table cellpadding="10" cellspacing="0" style="border-collapse:collapse;width:100%;">
                              <thead style="background:#f2f2f2;">
                                <tr>
                                  <th style="border:1px solid #ddd;font-size:14px;text-align:left;">Product</th>
                                  <th style="border:1px solid #ddd;font-size:14px;text-align:left;">QTY.</th>
                                  <th style="border:1px solid #ddd;font-size:14px;text-align:left;">Price</th>
                                  <th style="border:1px solid #ddd;font-size:14px;text-align:left;">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${buildItemRows(data.items)}
                                <tr>
                                  <td colspan="4" style="padding:10px;">
                                    <h3 style="margin:8px 0;font-size:18px;">Order Summary</h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="border:1px solid #ddd;font-size:14px;">Subtotal:</td>
                                  <td colspan="3" style="border:1px solid #ddd;font-size:14px;text-align:right;">${data.subtotal}</td>
                                </tr>
                                ${
                                  data.discount
                                    ? `<tr>
                                  <td style="border:1px solid #ddd;font-size:14px;color:#16a34a;">Discount${data.couponCode ? ` (${escapeHtml(data.couponCode)})` : ""}:</td>
                                  <td colspan="3" style="border:1px solid #ddd;font-size:14px;text-align:right;color:#16a34a;">-${data.discount}</td>
                                </tr>`
                                    : ""
                                }
                                <tr>
                                  <td style="border:1px solid #ddd;font-size:14px;">Shipping:</td>
                                  <td colspan="3" style="border:1px solid #ddd;font-size:14px;text-align:right;">${data.shipping}</td>
                                </tr>
                                <tr>
                                  <td style="border:1px solid #ddd;font-size:14px;"><strong>Total:</strong></td>
                                  <td colspan="3" style="border:1px solid #ddd;font-size:14px;text-align:right;"><strong>${data.total}</strong></td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="margin:20px 0 12px 0;font-size:15px;line-height:24px;">
                              <strong>Shipping Address:</strong>
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              <strong>${data.shippingName}</strong><br>
                              ${data.shippingLine1}<br>
                              ${data.shippingLine2}<br>
                              ${data.shippingLine3}
                            </p>
                            <p style="margin:20px 0 12px 0;font-size:15px;line-height:24px;">
                              We will process your order once payment is confirmed. You will receive updates on your order status.
                            </p>
                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;">
                              <strong>Best regards,</strong><br>
                              Studio By Sheetal Team
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
};

export const sendOrderConfirmationEmail = async ({ order, user }) => {
  if (!user?.email) return { success: false, skipped: true };

  const items = (order.orderItems || []).map((item) => ({
    name: item.name || "Product",
    qty: item.quantity || 1,
    price: formatCurrency(item.price || 0),
    total: formatCurrency((item.price || 0) * (item.quantity || 1)),
  }));

  const shippingLines = buildAddressLines(order.shippingAddress);
  const bannerUrl =
    process.env.STORE_BANNER_URL || process.env.STORE_LOGO_URL || "";

  await sendEmail({
    email: user.email,
    subject: `Your order ${order._id} is confirmed`,
    html: orderConfirmationTemplate({
      userName: user.name || order.shippingAddress?.fullName || "Customer",
      submittedOn: new Date(order.createdAt || Date.now()).toLocaleString(
        "en-IN",
      ),
      orderId: order._id,
      orderDate: new Date(order.createdAt || Date.now()).toLocaleString(
        "en-IN",
      ),
      orderStatus: order.orderStatus || "Processing",
      items,
      subtotal: formatCurrency(order.itemsPrice || 0),
      discount:
        order.discountPrice > 0 ? formatCurrency(order.discountPrice) : null,
      couponCode: order.couponCode || "",
      shipping:
        order.shippingPrice > 0 ? formatCurrency(order.shippingPrice) : "FREE",
      total: formatCurrency(order.totalPrice || 0),
      shippingName: order.shippingAddress?.fullName || user.name || "Customer",
      shippingLine1: shippingLines[0] || "",
      shippingLine2: shippingLines[1] || "",
      shippingLine3: shippingLines[2] || "",
      bannerUrl: bannerUrl || undefined,
    }),
  });

  return { success: true };
};

const buildCancelledItemRows = (items = []) =>
  items
    .map((item) => {
      const safeName = escapeHtml(item.name || "Product");
      const safeQty = escapeHtml(item.qty ?? "");
      const safePrice = escapeHtml(item.price ?? "");

      return `
        <tr style="background:#fff1f2;">
          <td style="border:1px solid #fecdd3;padding:8px 10px;font-size:14px;color:#991b1b;">${safeName}</td>
          <td style="border:1px solid #fecdd3;padding:8px 10px;font-size:14px;color:#991b1b;text-align:center;">${safeQty}</td>
          <td style="border:1px solid #fecdd3;padding:8px 10px;font-size:14px;color:#991b1b;text-align:right;">${safePrice}</td>
          <td style="border:1px solid #fecdd3;padding:8px 10px;font-size:14px;color:#dc2626;font-weight:700;text-align:center;">Cancelled</td>
        </tr>`;
    })
    .join("");

export const orderStatusUpdateTemplate = (data) => {
  const bannerMarkup = data.bannerUrl
    ? `<tr><td align="center" style="padding:0;"><img src="${data.bannerUrl}" alt="Studio By Sheetal" width="600" style="height:auto;display:block;border:0;"></td></tr>`
    : `<tr><td align="center" style="padding:28px 20px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;"><p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Studio By Sheetal</p></td></tr>`;

  let headerColor = "#9e5900";
  let titleText = `Order Status: ${data.orderStatus}`;

  if (data.updatedItem && data.updatedItem.status === "Cancelled") {
    headerColor = "#dc2626";
    titleText = "Item Cancelled in Your Order";
  } else if (data.orderStatus === "Cancelled") {
    headerColor = "#dc2626";
    titleText = "Order Cancelled";
  } else if (data.orderStatus === "Shipped") {
    headerColor = "#2563eb";
    titleText = "Order Shipped";
  } else if (data.orderStatus === "Delivered") {
    headerColor = "#16a34a";
    titleText = "Order Delivered";
  }

  const trackingBox =
    data.orderStatus === "Shipped" && (data.carrier || data.trackingId)
      ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0 0 8px 0;font-size:15px;color:#1e40af;font-weight:700;">Shipping & Tracking Details</p>
          ${data.carrier ? `<p style="margin:0 0 4px 0;font-size:14px;color:#1e3a8a;"><strong>Courier Partner:</strong> ${escapeHtml(data.carrier)}</p>` : ""}
          ${data.trackingId ? `<p style="margin:0 0 4px 0;font-size:14px;color:#1e3a8a;"><strong>Tracking / AWB Number:</strong> ${escapeHtml(data.trackingId)}</p>` : ""}
          ${data.estimatedDelivery ? `<p style="margin:0;font-size:14px;color:#1e3a8a;"><strong>Estimated Delivery:</strong> ${escapeHtml(data.estimatedDelivery)}</p>` : ""}
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${titleText} - Studio By Sheetal</title>
    <style>
      table, td, div, h1, h2, h3, p { font-family: Arial, sans-serif; }
    </style>
  </head>
  <body style="margin:20px;padding:0;background:#ffffff;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tbody>
        <tr>
          <td align="center" style="padding:0;">
            <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #e5e7eb;border-spacing:0;text-align:left;">
              <tbody>
                ${bannerMarkup}
                <tr>
                  <td style="padding:36px 30px 42px 30px;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                      <tbody>
                        <tr>
                          <td style="text-align:center;color:${headerColor};border-bottom:2px solid ${headerColor};padding-bottom:12px;">
                            <h2 style="margin:8px 0;font-size:24px;">${titleText}</h2>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:24px 0 0 0;color:#153643;">
                            <p style="margin:0 0 12px 0;font-size:18px;line-height:24px;">
                              Dear ${data.userName},
                            </p>
                            <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#4b5563;">
                              ${
                                data.orderStatus === "Cancelled"
                                  ? "Your order has been cancelled. If any payment was made online, a refund will be processed back to your original payment method."
                                  : data.updatedItem && data.updatedItem.status === "Cancelled"
                                    ? "Please note that an item in your order has been cancelled. Below is your updated order status and remaining order details:"
                                    : "Here is the latest update regarding your order:"
                              }
                            </p>
                            <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;">
                              <strong>Order ID:</strong> ${data.orderId}
                            </p>
                            <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;">
                              <strong>Order Date:</strong> ${data.orderDate}
                            </p>
                            <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;">
                              <strong>Overall Status:</strong> <span style="font-weight:700;color:${headerColor};">${data.orderStatus}</span>
                            </p>

                            ${trackingBox}

                            ${
                              data.activeItems && data.activeItems.length > 0
                                ? `<h3 style="margin:20px 0 8px 0;font-size:16px;color:#111827;">Active Products in Order</h3>
                                   <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:16px;">
                                     <thead style="background:#f3f4f6;">
                                       <tr>
                                         <th style="border:1px solid #e5e7eb;font-size:13px;text-align:left;padding:8px 10px;">Product</th>
                                         <th style="border:1px solid #e5e7eb;font-size:13px;text-align:center;padding:8px 10px;">QTY</th>
                                         <th style="border:1px solid #e5e7eb;font-size:13px;text-align:right;padding:8px 10px;">Price</th>
                                         <th style="border:1px solid #e5e7eb;font-size:13px;text-align:right;padding:8px 10px;">Total</th>
                                       </tr>
                                     </thead>
                                     <tbody>
                                       ${buildItemRows(data.activeItems)}
                                     </tbody>
                                   </table>`
                                : ""
                            }

                            ${
                              data.cancelledItems && data.cancelledItems.length > 0
                                ? `<h3 style="margin:20px 0 8px 0;font-size:16px;color:#dc2626;">Cancelled Item(s)</h3>
                                   <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin-bottom:16px;">
                                     <thead style="background:#fee2e2;">
                                       <tr>
                                         <th style="border:1px solid #fecdd3;font-size:13px;text-align:left;padding:8px 10px;color:#991b1b;">Product</th>
                                         <th style="border:1px solid #fecdd3;font-size:13px;text-align:center;padding:8px 10px;color:#991b1b;">QTY</th>
                                         <th style="border:1px solid #fecdd3;font-size:13px;text-align:right;padding:8px 10px;color:#991b1b;">Price</th>
                                         <th style="border:1px solid #fecdd3;font-size:13px;text-align:center;padding:8px 10px;color:#991b1b;">Status</th>
                                       </tr>
                                     </thead>
                                     <tbody>
                                       ${buildCancelledItemRows(data.cancelledItems)}
                                     </tbody>
                                   </table>`
                                : ""
                            }

                            <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;margin-top:16px;background:#fafafa;border:1px solid #e5e7eb;">
                              <tbody>
                                <tr>
                                  <td style="padding:10px 14px;font-size:14px;color:#4b5563;">Active Items Subtotal:</td>
                                  <td style="padding:10px 14px;font-size:14px;text-align:right;color:#111827;font-weight:600;">${data.subtotal}</td>
                                </tr>
                                ${
                                  data.discount
                                    ? `<tr>
                                  <td style="padding:10px 14px;font-size:14px;color:#16a34a;">Discount${data.couponCode ? ` (${escapeHtml(data.couponCode)})` : ""}:</td>
                                  <td style="padding:10px 14px;font-size:14px;text-align:right;color:#16a34a;font-weight:600;">-${data.discount}</td>
                                </tr>`
                                    : ""
                                }
                                <tr>
                                  <td style="padding:10px 14px;font-size:14px;color:#4b5563;">Shipping:</td>
                                  <td style="padding:10px 14px;font-size:14px;text-align:right;color:#111827;font-weight:600;">${data.shipping}</td>
                                </tr>
                                <tr style="border-top:2px solid #e5e7eb;background:#f3f4f6;">
                                  <td style="padding:12px 14px;font-size:15px;color:#111827;font-weight:700;">Total Active Amount:</td>
                                  <td style="padding:12px 14px;font-size:16px;text-align:right;color:#111827;font-weight:700;">${data.total}</td>
                                </tr>
                              </tbody>
                            </table>

                            <p style="margin:24px 0 8px 0;font-size:14px;line-height:22px;">
                              <strong>Delivery Address:</strong>
                            </p>
                            <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#4b5563;">
                              <strong>${data.shippingName}</strong><br>
                              ${data.shippingLine1}<br>
                              ${data.shippingLine2}<br>
                              ${data.shippingLine3}
                            </p>

                            <p style="margin:24px 0 8px 0;font-size:14px;line-height:22px;color:#4b5563;">
                              If you have any questions about this update, feel free to reply to this email or reach out to our support team.
                            </p>
                            <p style="margin:16px 0 0 0;font-size:14px;line-height:22px;">
                              <strong>Best regards,</strong><br>
                              Studio By Sheetal Team
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
};

export const sendOrderStatusUpdateEmail = async ({
  order,
  user,
  updatedItem,
  updatedStatus,
  trackingInfo = {},
}) => {
  if (!order) return { success: false, skipped: true };

  let userEmail = user?.email || order.shippingAddress?.email;
  let userName = user?.name || order.shippingAddress?.fullName || "Customer";

  if (!userEmail && order.user) {
    if (typeof order.user === "object" && order.user.email) {
      userEmail = order.user.email;
      userName = order.user.name || userName;
    } else {
      try {
        const User = (await import("../models/user.model.js")).default;
        const u = await User.findById(order.user).select("name email");
        if (u) {
          userEmail = u.email;
          userName = u.name || userName;
        }
      } catch {
        // ignore
      }
    }
  }

  if (!userEmail) return { success: false, skipped: true };

  const allItems = order.orderItems || [];
  const activeItems = allItems.filter((i) => i.itemStatus !== "Cancelled");
  const cancelledItems = allItems.filter((i) => i.itemStatus === "Cancelled");

  const formattedActiveItems = activeItems.map((item) => ({
    name: item.name || "Product",
    qty: item.quantity || 1,
    price: formatCurrency(item.price || 0),
    total: formatCurrency((item.price || 0) * (item.quantity || 1)),
  }));

  const formattedCancelledItems = cancelledItems.map((item) => ({
    name: item.name || "Product",
    qty: item.quantity || 1,
    price: formatCurrency(item.price || 0),
    status: "Cancelled",
  }));

  const activeSubtotal = activeItems.reduce(
    (acc, i) => acc + (i.price || 0) * (i.quantity || 1),
    0,
  );

  const finalTotal =
    activeItems.length === 0
      ? 0
      : Math.max(
          0,
          activeSubtotal +
            (order.shippingPrice || 0) +
            (order.taxPrice || 0) -
            (order.discountPrice || 0),
        );

  const statusToDisplay = updatedStatus || order.orderStatus || "Processing";
  const shippingLines = buildAddressLines(order.shippingAddress);
  const bannerUrl =
    process.env.STORE_BANNER_URL || process.env.STORE_LOGO_URL || "";

  const shortId = order._id ? order._id.toString().slice(-6).toUpperCase() : "";
  let subject = `Order Update: #${shortId} - ${statusToDisplay}`;
  if (updatedItem && updatedItem.status === "Cancelled") {
    subject = `Item Cancelled in Order #${shortId} - Studio By Sheetal`;
  } else if (statusToDisplay === "Cancelled") {
    subject = `Order Cancelled: #${shortId} - Studio By Sheetal`;
  } else if (statusToDisplay === "Shipped") {
    subject = `Your Order #${shortId} Has Been Shipped!`;
  } else if (statusToDisplay === "Delivered") {
    subject = `Your Order #${shortId} Has Been Delivered!`;
  }

  const carrier =
    trackingInfo.carrier ||
    trackingInfo.courierPartner ||
    order.courierPartner ||
    order.shippingInfo?.carrier ||
    "";
  const trackingId =
    trackingInfo.trackingId ||
    order.trackingId ||
    order.shippingInfo?.trackingId ||
    order.awbCode ||
    "";
  const estimatedDelivery =
    trackingInfo.estimatedDelivery ||
    order.shippingInfo?.estimatedDelivery ||
    "";

  await sendEmail({
    email: userEmail,
    subject,
    html: orderStatusUpdateTemplate({
      userName,
      orderId: order._id,
      orderDate: new Date(order.createdAt || Date.now()).toLocaleString("en-IN"),
      orderStatus: statusToDisplay,
      activeItems: formattedActiveItems,
      cancelledItems: formattedCancelledItems,
      subtotal: formatCurrency(activeSubtotal),
      discount:
        order.discountPrice > 0 ? formatCurrency(order.discountPrice) : null,
      couponCode: order.couponCode || "",
      shipping:
        activeItems.length === 0
          ? "₹0.00"
          : order.shippingPrice > 0
            ? formatCurrency(order.shippingPrice)
            : "FREE",
      total: formatCurrency(finalTotal),
      shippingName: order.shippingAddress?.fullName || userName,
      shippingLine1: shippingLines[0] || "",
      shippingLine2: shippingLines[1] || "",
      shippingLine3: shippingLines[2] || "",
      bannerUrl: bannerUrl || undefined,
      carrier,
      trackingId,
      estimatedDelivery,
      updatedItem,
    }),
  });

  return { success: true };
};
