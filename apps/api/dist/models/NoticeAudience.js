"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NoticeAudienceSchema = new mongoose_1.Schema({
    noticeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Notice", index: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department", sparse: true },
    programId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Program", sparse: true },
    batchId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Batch", sparse: true },
    role: { type: String, enum: ["admin", "faculty", "student"], sparse: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", sparse: true }
});
exports.default = (0, mongoose_1.model)("NoticeAudience", NoticeAudienceSchema);
