"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuerySchema = new mongoose_1.Schema({
    subject: { type: String, required: true },
    message: { type: String, required: true },
    from: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    email: String,
    role: String,
    status: { type: String, enum: ["open", "closed"], default: "open" },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Query", QuerySchema);
