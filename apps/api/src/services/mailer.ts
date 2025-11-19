// src/services/mailer.ts
import nodemailer from "nodemailer";
import { ENV } from "../config/env";

// Use SMTP sub-object from ENV
const transporter = nodemailer.createTransport({
  host: ENV.SMTP.HOST || "smtp.gmail.com",
  port: Number(ENV.SMTP.PORT || 587),
  secure: false, // TLS on 587
  auth:
    ENV.SMTP.USER && ENV.SMTP.PASS
      ? {
          user: ENV.SMTP.USER,
          pass: ENV.SMTP.PASS,
        }
      : undefined,
  // Allow self-signed certs on dev/testing hosts like Ethereal or when not in production
  tls: {
    rejectUnauthorized: !(ENV.SMTP.HOST && /ethereal|localhost|127\.0\.0\.1/.test(ENV.SMTP.HOST)) && process.env.NODE_ENV === 'production'
  }
});

export async function sendMail(to: string | string[], subject: string, html: string) {
  if (!ENV.SMTP.USER || !ENV.SMTP.PASS) {
    console.warn("SMTP not configured, skipping email.");
    return;
  }
  const info = await transporter.sendMail({
    from: `"SCNBCP" <${ENV.SMTP.USER}>`,
    to,
    subject,
    html,
  });
  try {
    console.log('Email sent:', info.messageId);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Ethereal preview URL:', preview);
  } catch (e) {
    // ignore logging errors
  }
}

export function noticeEmailTemplate(title: string, body: string) {
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
    <h2>📣 ${escapeHtml(title)}</h2>
    <p>${escapeHtml(body)}</p>
    <hr/>
    <p style="font-size:12px;color:#666">
      You received this because you're registered on SCNBCP.
    </p>
  </div>
  `;
}

// basic HTML escape
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
