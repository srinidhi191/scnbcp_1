import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
  if (!uri) throw new Error("MONGO_URI missing");
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
};
