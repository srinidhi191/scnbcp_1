"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mailer_1 = require("../services/mailer");
const r = (0, express_1.Router)();
// POST /api/notify/test  { "to":["you@gmail.com"], "title":"Hello", "body":"This is a test" }
r.post("/test", async (req, res) => {
    const { to = [], title = "Test Mail", body = "Hello from SCNBCP" } = req.body || {};
    try {
        await (0, mailer_1.sendMail)(to, title, (0, mailer_1.noticeEmailTemplate)(title, body));
        res.json({ ok: true });
    }
    catch (e) {
        console.error("notify/test error:", e);
        res.status(500).json({ error: "Failed to send email" });
    }
});
exports.default = r;
