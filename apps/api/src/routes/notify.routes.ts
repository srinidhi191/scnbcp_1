import { Router } from "express";
import { sendMail, noticeEmailTemplate } from "../services/mailer";

const r = Router();

// POST /api/notify/test  { "to":["you@gmail.com"], "title":"Hello", "body":"This is a test" }
r.post("/test", async (req, res) => {
  const { to = [], title = "Test Mail", body = "Hello from SCNBCP" } = req.body || {};
  try {
    await sendMail(to, title, noticeEmailTemplate(title, body));
    res.json({ ok: true });
  } catch (e) {
    console.error("notify/test error:", e);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default r;
