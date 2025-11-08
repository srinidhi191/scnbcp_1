import { Schema, model } from "mongoose";

export const Department = model("Department", new Schema({ code: String, name: String }));
export const Program = model("Program", new Schema({ code: String, name: String, departmentId: { type: Schema.Types.ObjectId, ref: "Department" } }));
export const Batch = model("Batch", new Schema({ year: String, section: String, programId: { type: Schema.Types.ObjectId, ref: "Program" } }));
