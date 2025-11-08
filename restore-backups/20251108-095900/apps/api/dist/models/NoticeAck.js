"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NoticeAckSchema = new mongoose_1.Schema({
    noticeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Notice", index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", index: true },
    viewedAt: Date,
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: Date
}, { timestamps: true });
NoticeAckSchema.index({ noticeId: 1, userId: 1 }, { unique: true });
exports.default = (0, mongoose_1.model)("NoticeAck", NoticeAckSchema);
