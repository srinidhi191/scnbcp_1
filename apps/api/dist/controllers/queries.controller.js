"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQueries = exports.createQuery = void 0;
const Query_1 = __importDefault(require("../models/Query"));
const createQuery = async (req, res) => {
    try {
        const { subject, message, noticeId } = req.body;
        if (!subject || !message)
            return res.status(400).json({ error: "Subject and message are required" });
        const payload = {
            subject,
            message,
            from: req.user?._id,
            email: req.user?.email || req.body.email,
            role: req.user?.roles?.[0] || req.body.role,
        };
        if (noticeId)
            payload.noticeId = noticeId;
        const q = await Query_1.default.create(payload);
        return res.json({ query: q });
    }
    catch (err) {
        console.error("createQuery error:", err && err.stack ? err.stack : err);
        return res.status(500).json({ error: err?.message || "Failed to create query" });
    }
};
exports.createQuery = createQuery;
const listQueries = async (req, res) => {
    try {
        const items = await Query_1.default.find({}).sort({ createdAt: -1 }).limit(500).populate("from", "name email roles");
        res.json({ items });
    }
    catch (err) {
        console.error("listQueries error:", err);
        res.status(500).json({ error: "Failed to list queries" });
    }
};
exports.listQueries = listQueries;
