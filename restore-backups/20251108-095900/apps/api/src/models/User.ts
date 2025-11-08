// src/models/User.ts
import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  roles: { type: [String], enum: ["admin", "faculty", "student"], default: ["student"] },
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  programId: { type: Schema.Types.ObjectId, ref: "Program" },
  batchId: { type: Schema.Types.ObjectId, ref: "Batch" },
  isActive: { type: Boolean, default: true },
  // track when the user last successfully logged in
  lastLogin: { type: Date }
}, { timestamps: true });

export default model("User", UserSchema);
