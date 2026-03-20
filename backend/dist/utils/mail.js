"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configure Brevo SMTP transporter
const transporter = nodemailer_1.default.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT) || 587,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});
const sendOTPEmail = async (email, otp, name) => {
    try {
        const mailOptions = {
            from: `"${process.env.BREVO_FROM_NAME || 'Ethio-Digital Academy'}" <${process.env.BREVO_FROM_EMAIL}>`,
            to: email,
            subject: 'Verify your Ethio-Digital-Academy Account',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <h2 style="color: #059669;">Welcome to Ethio-Digital-Academy!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please use the following code to verify your account:</p>
          <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">&copy; 2026 Ethio-Digital-Academy. All rights reserved.</p>
        </div>
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`[MAIL SUCCESS] OTP sent via Brevo to ${email}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    }
    catch (err) {
        console.error('[MAIL CRITICAL ERROR] Unexpected error in sendOTPEmail:', err);
        return { success: false, error: err };
    }
};
exports.sendOTPEmail = sendOTPEmail;
