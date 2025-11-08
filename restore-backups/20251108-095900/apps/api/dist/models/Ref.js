"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = exports.Program = exports.Department = void 0;
const mongoose_1 = require("mongoose");
exports.Department = (0, mongoose_1.model)("Department", new mongoose_1.Schema({ code: String, name: String }));
exports.Program = (0, mongoose_1.model)("Program", new mongoose_1.Schema({ code: String, name: String, departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Department" } }));
exports.Batch = (0, mongoose_1.model)("Batch", new mongoose_1.Schema({ year: String, section: String, programId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Program" } }));
