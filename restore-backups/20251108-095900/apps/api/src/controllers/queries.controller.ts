import { Request, Response } from "express";
import Query from "../models/Query";

export const createQuery = async (req: any, res: Response) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: "Subject and message are required" });

    const q = await Query.create({
      subject,
      message,
      from: req.user?._id,
      email: req.user?.email || req.body.email,
      role: req.user?.roles?.[0] || req.body.role,
    });

    return res.json({ query: q });
  } catch (err: any) {
    console.error("createQuery error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ error: err?.message || "Failed to create query" });
  }
};

export const listQueries = async (req: any, res: Response) => {
  try {
    const items = await Query.find({}).sort({ createdAt: -1 }).limit(500).populate("from", "name email roles");
    res.json({ items });
  } catch (err: any) {
    console.error("listQueries error:", err);
    res.status(500).json({ error: "Failed to list queries" });
  }
};
