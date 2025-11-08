import { Schema, model } from "mongoose";

const NoticeAckSchema = new Schema({
  noticeId: { type: Schema.Types.ObjectId, ref: "Notice", index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  viewedAt: Date,
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: Date
}, { timestamps: true });

NoticeAckSchema.index({ noticeId: 1, userId: 1 }, { unique: true });

export default model("NoticeAck", NoticeAckSchema);
