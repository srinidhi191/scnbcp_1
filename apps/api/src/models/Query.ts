import { Schema, model } from "mongoose";

const QuerySchema = new Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  from: { type: Schema.Types.ObjectId, ref: "User" },
  email: String,
  role: String,
  status: { type: String, enum: ["open", "closed"], default: "open" },
}, { timestamps: true });

export default model("Query", QuerySchema);
