import { Schema, model } from "mongoose";

const NoticeAudienceSchema = new Schema({
  noticeId: { type: Schema.Types.ObjectId, ref: "Notice", index: true },
  departmentId: { type: Schema.Types.ObjectId, ref: "Department", sparse: true },
  programId: { type: Schema.Types.ObjectId, ref: "Program", sparse: true },
  batchId: { type: Schema.Types.ObjectId, ref: "Batch", sparse: true },
  role: { type: String, enum: ["admin","faculty","student"], sparse: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true }
});

export default model("NoticeAudience", NoticeAudienceSchema);
