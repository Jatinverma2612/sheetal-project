export const orderConfirmationTemplate = (data: {
  userName: string;
  submittedOn: string;
  orderId: string;
  orderDate: string;
  orderStatus: string;
  items: { name: string; qty: number; price: string; total: string }[];
  subtotal: string;
  shipping: string;
  total: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string;
  shippingLine3: string;
  bannerUrl?: string;
}): string => {
  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="border:1px solid #ddd;font-size:14px;">${item.name}</td>
          <td style="border:1px solid #ddd;font-size:14px;">${item.qty}</td>
          <td style="border:1px solid #ddd;font-size:14px;">${item.price}</td>
          <td style="border:1px solid #ddd;font-size:14px;">${item.total}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Order Confirmation — Studio By Sheetal</title>
    <style>
      table, td, div, h1, h2, h3, p { font-family: Montserrat, "Helvetica Neue", Helvetica, sans-serif; }
    </style>
  </head>
  <body style="margin:20px;padding:0;background:#ffffff;">

    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tbody>
        <tr>
          <td align="center" style="padding:0;">
            <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #16690094;border-spacing:0;text-align:left;">
              <tbody>

                <tr>
                  <td align="center" style="padding:0;">
                    <img src="${data.bannerUrl ?? ""}" alt="Studio By Sheetal" width="600" style="height:auto;display:block;">
                  </td>
                </tr>

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

                            <p style="margin:0 0 12px 0;font-size:20px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              Dear ${data.userName},
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              Thank you for your order! Your order has been placed successfully. Here are the details:
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <strong>Order Details</strong><br>
                              Submitted on: ${data.submittedOn}
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <strong>Your Message/Details:</strong>
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <strong>Order ID:</strong> ${data.orderId}
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <strong>Order Date:</strong> ${data.orderDate}
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <strong>Status:</strong> ${data.orderStatus}
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
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
                                ${itemRows}
                                <tr>
                                  <td colspan="4" style="padding:10px;">
                                    <h3 style="margin:8px 0;font-size:18px;">Order Summary</h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="border:1px solid #ddd;font-size:14px;">Subtotal:</td>
                                  <td colspan="3" style="border:1px solid #ddd;font-size:14px;text-align:right;">${data.subtotal}</td>
                                </tr>
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

                            <p style="margin:20px 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <strong>Shipping Address:</strong>
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              ${data.shippingName}
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              ${data.shippingLine1}<br>
                              ${data.shippingLine2}<br>
                              ${data.shippingLine3}
                            </p>

                            <p style="margin:20px 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <hr style="border:none;border-top:1px solid #ccc;">
                            </p>

                            <p style="margin:20px 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              We will process your order once the payment is confirmed. You will receive updates on your order status.
                            </p>

                            <p style="margin:20px 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              If you have any questions, please contact us.
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              Thank you for your patience.
                            </p>

                            <p style="margin:0 0 12px 0;font-size:15px;line-height:24px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;">
                              <strong>Best regards,</strong><br>
                              Studio By Sheetal Team
                            </p>

                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px;background:#166900;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                      <tbody>
                        <tr>
                          <td style="padding:0;width:50%;" align="center">
                            <p style="margin:0;font-size:14px;line-height:16px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;color:#ffffff;">
                              &copy; 2026. <a href="https://www.studiobysheetal.com" style="color:#ffffff;text-decoration:underline;">Studio By Sheetal</a>
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:30px;background:#ffffff;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                      <tbody>
                        <tr>
                          <td style="padding:0;width:50%;" align="center">
                            <p style="margin:0;font-size:14px;line-height:25px;font-family:Montserrat,'Helvetica Neue',Helvetica,sans-serif;color:#9b9b9b;">
                              This is an automated email. Please do not reply to this message.<br>
                              If you have any urgent queries, please contact us directly.
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
