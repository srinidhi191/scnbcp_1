"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachToNotice = exports.uploadFile = void 0;
const Notice_1 = __importDefault(require("../models/Notice"));
const uploadFile = async (req, res) => {
    try {
        const f = req.file;
        if (!f)
            return res.status(400).json({ error: "No file uploaded" });
        const fileUrl = `/uploads/${f.filename}`;
        return res.json({ file: { fileName: f.originalname, fileUrl, mimeType: f.mimetype, sizeBytes: f.size } });
    }
    catch (err) {
        console.error("uploadFile error:", err);
        res.status(500).json({ error: "Failed to upload file" });
    }
};
exports.uploadFile = uploadFile;
const attachToNotice = async (req, res) => {
    try {
        const f = req.file;
        if (!f)
            return res.status(400).json({ error: "No file uploaded" });
        const noticeId = req.params.id;
        const notice = await Notice_1.default.findById(noticeId);
        if (!notice)
            return res.status(404).json({ error: "Notice not found" });
        const attachment = { fileName: f.originalname, fileUrl: `/uploads/${f.filename}`, mimeType: f.mimetype, sizeBytes: f.size };
        notice.attachments = notice.attachments || [];
        notice.attachments.push(attachment);
        await notice.save();
        return res.json({ attachment });
    }
    catch (err) {
        console.error("attachToNotice error:", err);
        res.status(500).json({ error: "Failed to attach file to notice" });
    }
};
exports.attachToNotice = attachToNotice;
