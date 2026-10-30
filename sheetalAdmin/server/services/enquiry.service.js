import { config } from "../config/config.js";
import sendEmail from "../utils/sendEmail.js";
import Settings from "../models/settings.model.js";

const STORE_NAME = (process.env.STORE_NAME || "Studio By Sheetal").trim();
const STORE_URL =
  (process.env.STORE_URL || "").trim() || config.frontendDomain || "#";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendAvailabilityEmail({
  name,
  email,
  productName,
  size,
  productImage,
  productUrl,
  reply,
}) {
  const settings = await Settings.findOne();
  let template = settings?.notifyBackInStockEmailTemplate;
  const isCustomReply = Boolean(reply && reply.trim());
  const trimmedReply = reply ? reply.trim() : "";

  const replyBoxHtml = isCustomReply
    ? `
      <div style="margin: 20px 0; padding: 18px 20px; background-color: #faf7f2; border-left: 4px solid #c9a96e; border-radius: 8px;">
        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8c734b;">Response From Our Team:</p>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1a1208; white-space: pre-wrap;">${escapeHtml(trimmedReply)}</p>
      </div>
    `
    : "";

  const subject = isCustomReply
    ? `Update regarding your enquiry for ${productName}`
    : `Great news - ${productName} in size ${size} is available!`;

  if (template) {
    const replacements = {
      "{{name}}": escapeHtml(name),
      "{{productName}}": escapeHtml(productName),
      "{{size}}": escapeHtml(size),
      "{{productImage}}": productImage || "",
      "{{productUrl}}": productUrl || STORE_URL,
      "{{reply}}": isCustomReply ? replyBoxHtml : "",
      "{{year}}": new Date().getFullYear().toString(),
    };

    if (template.includes("{{reply}}")) {
      Object.keys(replacements).forEach((key) => {
        template = template.replaceAll(key, replacements[key]);
      });
    } else {
      Object.keys(replacements).forEach((key) => {
        template = template.replaceAll(key, replacements[key]);
      });

      if (isCustomReply) {
        if (template.includes("<!-- PRODUCT DETAILS -->")) {
          template = template.replace(
            "<!-- PRODUCT DETAILS -->",
            `<tr><td style="padding: 0 36px;">${replyBoxHtml}</td></tr><!-- PRODUCT DETAILS -->`,
          );
        } else if (template.includes("</body>")) {
          template = template.replace(
            "</body>",
            `<tr><td style="padding: 16px 24px;">${replyBoxHtml}</td></tr></body>`,
          );
        }
      }
    }
  } else {
    template = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1208; background-color: #ffffff;">
        <h2 style="color: #683e14; margin-bottom: 16px;">Hello ${escapeHtml(name)},</h2>
        ${isCustomReply ? replyBoxHtml : `<p>The <strong>${escapeHtml(productName)}</strong> in size <strong>${escapeHtml(size)}</strong> is now available.</p>`}
        <p style="margin-top: 24px;">
          <a href="${escapeHtml(productUrl || STORE_URL)}" style="display: inline-block; background-color: #683e14; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Product</a>
        </p>
        <p style="margin-top: 32px; font-size: 13px; color: #888888;">
          Warm regards,<br/>${STORE_NAME} Team
        </p>
      </div>
    `;
  }

  return await sendEmail({
    email,
    subject,
    html: template,
  });
}
