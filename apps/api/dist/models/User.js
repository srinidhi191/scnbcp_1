"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/User.ts
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: String,
    email: { type: String, unique: true, index: true },
    passwordHash: String,
    roles: { type: [String], enum: ["admin", "faculty", "student"], default: ["student"] },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department" },
    programId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Program" },
    batchId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Batch" },
    isActive: { type: Boolean, default: true },
    // track when the user last successfully logged in
    lastLogin: { type: Date }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", UserSchema);
