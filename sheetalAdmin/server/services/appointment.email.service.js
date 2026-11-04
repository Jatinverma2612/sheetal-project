import sendEmail from "../utils/sendEmail.js";
import Settings from "../models/settings.model.js";
import logger from "../utils/logger.js";

export const sendAppointmentConfirmationEmail = async (appointment) => {
  try {
    const settings = await Settings.findOne();
    let template = settings?.appointmentEmailTemplate || "";

    const bannerUrl = process.env.STORE_BANNER_URL || process.env.STORE_LOGO_URL || "";
    const bannerMarkup = bannerUrl
      ? `<img src="${bannerUrl}" alt="Studio By Sheetal" width="600" style="height:auto;display:block;border:0;">`
      : `<p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Studio By Sheetal</p>`;

    // If template is empty (shouldn't happen with default), use a basic fallback
    if (!template) {
        template = `
            <h2>Appointment Confirmed</h2>
            <p>Dear {{name}},</p>
            <p>Your appointment has been confirmed for <strong>{{date}}</strong> at <strong>{{time}}</strong>.</p>
            <p>Location: {{address}}, {{city}} - {{pincode}}</p>
            <p>Thank you for choosing Studio By Sheetal!</p>
        `;
    }

    const replacements = {
      "{{id}}": appointment._id.toString().slice(-6).toUpperCase(),
      "{{name}}": appointment.name,
      "{{date}}": new Date(appointment.appointmentDate).toLocaleDateString("en-IN"),
      "{{time}}": appointment.appointmentTime,
      "{{address}}": appointment.address,
      "{{city}}": appointment.city,
      "{{pincode}}": appointment.pincode,
      "{{contact}}": appointment.contact,
      "{{requirements}}": appointment.requirements || "None",
      "{{bannerMarkup}}": bannerMarkup,
      "{{year}}": new Date().getFullYear(),
    };

    Object.keys(replacements).forEach((key) => {
      template = template.replace(new RegExp(key, "g"), replacements[key]);
    });

    await sendEmail({
      email: appointment.email,
      subject: "Your Appointment is Confirmed - Studio By Sheetal",
      html: template,
    });

    return { success: true };
  } catch (error) {
    logger.error("Error sending appointment confirmation email:", { error: error.message, stack: error.stack });
    return { success: false, error: error.message };
  }
};

export const sendAppointmentPendingEmail = async (appointment) => {
  try {
    const bannerUrl =
      process.env.STORE_BANNER_URL || process.env.STORE_LOGO_URL || "";
    const bannerMarkup = bannerUrl
      ? `<img src="${bannerUrl}" alt="Studio By Sheetal" width="600" style="height:auto;display:block;border:0;">`
      : `<p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Studio By Sheetal</p>`;

    const formattedDate = appointment.appointmentDate
      ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN")
      : "To be scheduled by our team";
    const formattedTime = appointment.appointmentTime || "To be scheduled";
    const shortId = appointment._id
      ? appointment._id.toString().slice(-6).toUpperCase()
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Request Received - Studio By Sheetal</title>
</head>
<body style="margin:0;padding:20px;background-color:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;border-collapse:collapse;width:100%;">
    <tbody>
      <tr>
        <td align="center" style="padding:0;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          ${bannerMarkup}
        </td>
      </tr>
      <tr>
        <td style="padding:32px 28px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="display:inline-block;padding:6px 14px;background:#fef3c7;color:#b45309;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
              Request Pending Review
            </span>
            <h2 style="margin:16px 0 6px 0;font-size:24px;color:#1e293b;">Appointment Request Received</h2>
            <p style="margin:0;font-size:14px;color:#64748b;">Request ID: #${shortId}</p>
          </div>

          <p style="font-size:15px;line-height:24px;color:#334155;margin:0 0 16px 0;">
            Dear <strong>${appointment.name}</strong>,
          </p>
          <p style="font-size:15px;line-height:24px;color:#334155;margin:0 0 20px 0;">
            Thank you for booking an appointment with Studio By Sheetal. We have received your request and our styling team is reviewing your requested schedule. You will receive a confirmation email once your appointment time is finalized.
          </p>

          <table role="presentation" style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:24px;">
            <tbody>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#64748b;border-bottom:1px solid #e2e8f0;width:35%;">Date:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;font-weight:600;border-bottom:1px solid #e2e8f0;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#64748b;border-bottom:1px solid #e2e8f0;">Time:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;font-weight:600;border-bottom:1px solid #e2e8f0;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#64748b;border-bottom:1px solid #e2e8f0;">Contact:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">${appointment.contact}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#64748b;border-bottom:1px solid #e2e8f0;">Address:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #e2e8f0;">${appointment.address}, ${appointment.city} - ${appointment.pincode}</td>
              </tr>
              ${appointment.requirements ? `<tr>
                <td style="padding:12px 16px;font-size:14px;color:#64748b;">Requirements:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${appointment.requirements}</td>
              </tr>` : ""}
            </tbody>
          </table>

          <p style="font-size:14px;line-height:22px;color:#64748b;margin:0 0 20px 0;">
            If you need to make changes or have questions, feel free to reply directly to this email or call our team.
          </p>

          <p style="font-size:14px;line-height:22px;color:#1e293b;margin:0;">
            Warm regards,<br>
            <strong>Studio By Sheetal Team</strong>
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

    await sendEmail({
      email: appointment.email,
      subject: "Appointment Request Received (Pending) - Studio By Sheetal",
      html,
    });

    return { success: true };
  } catch (error) {
    logger.error("Error sending appointment pending email:", {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
};

export const sendAppointmentCancelledEmail = async (appointment) => {
  try {
    const bannerUrl =
      process.env.STORE_BANNER_URL || process.env.STORE_LOGO_URL || "";
    const bannerMarkup = bannerUrl
      ? `<img src="${bannerUrl}" alt="Studio By Sheetal" width="600" style="height:auto;display:block;border:0;">`
      : `<p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Studio By Sheetal</p>`;

    const formattedDate = appointment.appointmentDate
      ? new Date(appointment.appointmentDate).toLocaleDateString("en-IN")
      : "N/A";
    const formattedTime = appointment.appointmentTime || "N/A";
    const shortId = appointment._id
      ? appointment._id.toString().slice(-6).toUpperCase()
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Cancelled - Studio By Sheetal</title>
</head>
<body style="margin:0;padding:20px;background-color:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #fee2e2;border-collapse:collapse;width:100%;">
    <tbody>
      <tr>
        <td align="center" style="padding:0;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          ${bannerMarkup}
        </td>
      </tr>
      <tr>
        <td style="padding:32px 28px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="display:inline-block;padding:6px 14px;background:#fee2e2;color:#dc2626;border-radius:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
              Cancelled
            </span>
            <h2 style="margin:16px 0 6px 0;font-size:24px;color:#991b1b;">Appointment Cancelled</h2>
            <p style="margin:0;font-size:14px;color:#64748b;">Request ID: #${shortId}</p>
          </div>

          <p style="font-size:15px;line-height:24px;color:#334155;margin:0 0 16px 0;">
            Dear <strong>${appointment.name}</strong>,
          </p>
          <p style="font-size:15px;line-height:24px;color:#334155;margin:0 0 20px 0;">
            Please be advised that your appointment with Studio By Sheetal has been cancelled.
          </p>

          <table role="presentation" style="width:100%;border-collapse:collapse;background:#fef2f2;border-radius:12px;border:1px solid #fecdd3;margin-bottom:24px;">
            <tbody>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#991b1b;border-bottom:1px solid #fecdd3;width:35%;">Date:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;font-weight:600;border-bottom:1px solid #fecdd3;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#991b1b;border-bottom:1px solid #fecdd3;">Time:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;font-weight:600;border-bottom:1px solid #fecdd3;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:14px;color:#991b1b;">Location:</td>
                <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${appointment.address}, ${appointment.city}</td>
              </tr>
            </tbody>
          </table>

          <p style="font-size:14px;line-height:22px;color:#64748b;margin:0 0 20px 0;">
            If you would like to reschedule or book a new appointment, you can do so anytime on our website or by contacting our team.
          </p>

          <p style="font-size:14px;line-height:22px;color:#1e293b;margin:0;">
            Warm regards,<br>
            <strong>Studio By Sheetal Team</strong>
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

    await sendEmail({
      email: appointment.email,
      subject: "Your Appointment Has Been Cancelled - Studio By Sheetal",
      html,
    });

    return { success: true };
  } catch (error) {
    logger.error("Error sending appointment cancellation email:", {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, error: error.message };
  }
};
