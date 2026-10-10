import sendEmail from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatMoney = (value = 0) => `INR ${Number(value || 0).toFixed(2)}`;

const getDisplayName = (cart) => cart?.user?.name || cart?.email || "Customer";

const buildItemsSummary = (items = []) =>
  items
    .slice(0, 3)
    .map((item) => {
      const name = item.name || item.productName || "Product";
      const price = formatMoney(
        item.discountPrice > 0 ? item.discountPrice : item.price,
      );
      return `${name} (${price})`;
    })
    .join(", ");

const buildReminderSubject = (stage, cart) => {
  const firstName = getDisplayName(cart).split(" ")[0] || "there";

  switch (stage) {
    case "first":
      return `${firstName}, you left something behind`;
    case "second":
      return `${firstName}, your cart is about to expire`;
    case "third":
      return `${firstName}, claim your cart discount`;
    case "final":
      return `${firstName}, last chance to grab your items`;
    default:
      return "Your cart reminder";
  }
};

const buildReminderHtml = ({
  stage,
  cart,
  items,
  ctaUrl,
  couponCode,
  discountPercent,
}) => {
  const heroItem = items[0] || {};
  const heroImage = heroItem.image || heroItem.variantImage || "";
  const heroName = escapeHtml(
    heroItem.name || heroItem.productName || "Product",
  );
  const heroPrice = formatMoney(
    heroItem.discountPrice > 0 ? heroItem.discountPrice : heroItem.price,
  );
  const titleByStage = {
    first: "You left something behind",
    second: "Your cart is about to expire",
    third: `Save ${discountPercent}% before checkout`,
    final: "Last chance to grab your items",
  };
  const bodyByStage = {
    first: "Complete your order before the items are gone.",
    second: "Free delivery and limited stock are still available right now.",
    third: `Use code ${escapeHtml(couponCode)} to claim ${discountPercent}% off.`,
    final: "Shop now before the offer and items disappear.",
  };

  const itemMarkup = items
    .slice(0, 3)
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${
                  item.image
                    ? `<td width="72" style="padding-right:12px;"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name || "Product")}" width="72" height="72" style="object-fit:cover;border-radius:12px;display:block;"></td>`
                    : ""
                }
                <td>
                  <div style="font-size:14px;font-weight:700;color:#111827;">${escapeHtml(item.name || "Product")}</div>
                  <div style="font-size:13px;color:#6b7280;">${formatMoney(item.discountPrice > 0 ? item.discountPrice : item.price)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 28px 18px;background:linear-gradient(135deg,#1f2937,#111827);color:#ffffff;">
                <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.75;">${stage === "final" ? "Final reminder" : "Cart reminder"}</div>
                <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(titleByStage[stage] || "Your cart is waiting")}</h1>
                <p style="margin:10px 0 0;font-size:15px;line-height:1.6;opacity:.9;">${escapeHtml(bodyByStage[stage] || "Come back and finish your order.")}</p>
              </td>
            </tr>
            ${
              heroImage
                ? `<tr><td style="padding:0 28px;"><img src="${escapeHtml(heroImage)}" alt="${heroName}" style="width:100%;max-height:320px;object-fit:cover;border-radius:18px;margin-top:24px;"></td></tr>`
                : ""
            }
            <tr>
              <td style="padding:24px 28px 8px;">
                <div style="font-size:15px;font-weight:700;color:#111827;margin-bottom:8px;">${heroName}</div>
                <div style="font-size:14px;color:#6b7280;margin-bottom:14px;">${heroPrice}</div>
                ${
                  stage === "third"
                    ? `<div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:13px;font-weight:700;margin-bottom:16px;">Code ${escapeHtml(couponCode)} for ${discountPercent}% off</div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
                  ${itemMarkup}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="${escapeHtml(ctaUrl)}" style="display:block;text-align:center;background:#111827;color:#ffffff;text-decoration:none;padding:14px 18px;border-radius:14px;font-weight:700;">${stage === "final" ? "Shop now" : "Complete checkout"}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const sendProviderWebhook = async ({ url, payload, label }) => {
  const isDryRun =
    process.env.EMAIL_DRY_RUN === "true" ||
    process.env.NOTIFICATION_DRY_RUN === "true" ||
    process.env.NODE_ENV === "test";

  if (isDryRun) {
    logger.info(
      `[Notification Mock] Dry-run webhook intercepted for ${label} to ${payload?.to} (no external network call)`,
    );
    return { success: true, mock: true, label };
  }

  if (!url) {
    return { skipped: true, reason: `${label}_provider_not_configured` };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const error = new Error(
        `${label} provider error: ${response.status} ${body}`.trim(),
      );
      if (response.status >= 500) {
        error.isAmbiguous = true;
      }
      throw error;
    }

    return { success: true, providerAccepted: true };
  } catch (err) {
    if (
      err.isAmbiguous ||
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNRESET" ||
      err.name === "AbortError"
    ) {
      err.isAmbiguous = true;
    }
    throw err;
  }
};

export const sendReminderEmail = async ({
  cart,
  items,
  ctaUrl,
  stage,
  couponCode,
  discountPercent,
}) => {
  if (!cart?.email) {
    return { skipped: true, reason: "missing_email" };
  }

  const sendResult = await sendEmail({
    email: cart.email,
    subject: buildReminderSubject(stage, cart),
    html: buildReminderHtml({
      stage,
      cart,
      items,
      ctaUrl,
      couponCode,
      discountPercent,
    }),
  });

  return {
    success: true,
    mock: Boolean(sendResult?.mock),
    provider: sendResult?.provider || (sendResult?.mock ? "mock" : "unknown"),
    providerAccepted: Boolean(sendResult?.providerAccepted),
    deliveryConfirmed: false,
    messageId: sendResult?.messageId || null,
  };
};

export const sendReminderWhatsApp = async ({
  cart,
  items,
  ctaUrl,
  stage,
  couponCode,
  discountPercent,
}) => {
  if (!cart?.phoneNumber) {
    return { skipped: true, reason: "missing_phone_number" };
  }

  const messageByStage = {
    first: `You left something behind. ${buildItemsSummary(items)}. Complete your order: ${ctaUrl}`,
    second: `Your cart is about to expire. Free delivery and limited stock may apply. Checkout now: ${ctaUrl}`,
    third: `Claim ${discountPercent}% off with code ${couponCode}. Complete checkout: ${ctaUrl}`,
    final: `Last chance to grab your items. Shop now: ${ctaUrl}`,
  };

  const mediaUrl = items[0]?.image || items[0]?.variantImage || "";
  return sendProviderWebhook({
    url: process.env.WHATSAPP_WEBHOOK_URL || process.env.WHATSAPP_API_URL || "",
    label: "whatsapp",
    payload: {
      to: cart.phoneNumber,
      message: messageByStage[stage] || messageByStage.first,
      mediaUrl: mediaUrl || undefined,
      storeName: process.env.STORE_NAME || "Store",
      cartId: cart._id?.toString?.() || undefined,
    },
  });
};

export const sendReminderSms = async ({
  cart,
  items,
  ctaUrl,
  stage,
  couponCode,
  discountPercent,
}) => {
  if (!cart?.phoneNumber) {
    return { skipped: true, reason: "missing_phone_number" };
  }

  const messageByStage = {
    third: `Save ${discountPercent}% with code ${couponCode}. Checkout here: ${ctaUrl}`,
  };

  return sendProviderWebhook({
    url: process.env.SMS_WEBHOOK_URL || process.env.SMS_API_URL || "",
    label: "sms",
    payload: {
      to: cart.phoneNumber,
      message:
        messageByStage[stage] ||
        `Reminder: complete your order here: ${ctaUrl}`,
      cartId: cart._id?.toString?.() || undefined,
    },
  });
};

export const logReminderProviderResult = (channel, result) => {
  if (result?.skipped) {
    logger.info(
      { channel, result },
      `[AbandonedCart] ${channel} reminder skipped`,
    );
    return;
  }

  logger.info(
    { channel, result },
    `[AbandonedCart] ${channel} reminder dispatched`,
  );
};

export const getReminderChannelAvailability = (stage, cart) => {
  const channels = [];

  if (stage === "final") {
    if (cart?.email) channels.push("email");
    return channels;
  }

  if (cart?.email) channels.push("email");
  if (cart?.phoneNumber) channels.push("whatsapp");
  if (stage === "third" && cart?.phoneNumber) channels.push("sms");

  return channels;
};
