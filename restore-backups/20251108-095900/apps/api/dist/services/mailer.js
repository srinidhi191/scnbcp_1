"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
exports.noticeEmailTemplate = noticeEmailTemplate;
// src/services/mailer.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
// Use SMTP sub-object from ENV
const transporter = nodemailer_1.default.createTransport({
    host: env_1.ENV.SMTP.HOST || "smtp.gmail.com",
    port: Number(env_1.ENV.SMTP.PORT || 587),
    secure: false, // TLS on 587
    auth: env_1.ENV.SMTP.USER && env_1.ENV.SMTP.PASS
        ? {
            user: env_1.ENV.SMTP.USER,
            pass: env_1.ENV.SMTP.PASS,
        }
        : undefined,
});
async function sendMail(to, subject, html) {
    if (!env_1.ENV.SMTP.USER || !env_1.ENV.SMTP.PASS) {
        console.warn("SMTP not configured, skipping email.");
        return;
    }
    const info = await transporter.sendMail({
        from: `"SCNBCP" <${env_1.ENV.SMTP.USER}>`,
        to,
        subject,
        html,
    });
    try {
        console.log('Email sent:', info.messageId);
        const preview = nodemailer_1.default.getTestMessageUrl(info);
        if (preview)
            console.log('Ethereal preview URL:', preview);
    }
    catch (e) {
        // ignore logging errors
    }
}
function noticeEmailTemplate(title, body) {
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
function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
