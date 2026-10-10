import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

console.log("Before import - SMTP_MAIL:", process.env.SMTP_MAIL);

const { default: sendEmail } = await import('../utils/sendEmail.js');

try {
  console.log("Attempting to send email via sendEmail function...");
  await sendEmail({
    email: 'codeifyitservices@gmail.com',
    subject: 'Test Email from Sheetal Admin',
    message: '<h1>If you receive this, the email function works perfectly!</h1>',
  });
  console.log("Email sent successfully!");
} catch (error) {
  console.error("sendEmail function failed:", error);
}
