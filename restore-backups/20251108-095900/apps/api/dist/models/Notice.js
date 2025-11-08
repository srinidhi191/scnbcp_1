"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NoticeSchema = new mongoose_1.Schema({
    title: String,
    body: String,
    category: { type: String, enum: ["Academics", "Events", "Exams", "Circulars", "General"], default: "Academics", index: true },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    status: { type: String, enum: ["draft", "scheduled", "published", "archived"], default: "draft", index: true },
    visibility: { type: String, enum: ["public", "targeted"], default: "targeted" },
    publishAt: { type: Date, default: Date.now, index: true },
    expireAt: Date,
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", index: true },
    attachments: [{ fileName: String, fileUrl: String, mimeType: String, sizeBytes: Number }]
}, { timestamps: true });
NoticeSchema.index({ title: "text", body: "text" });
exports.default = (0, mongoose_1.model)("Notice", NoticeSchema);
