import { Request, Response } from "express";
import Notice from "../models/Notice";

export const uploadFile = async (req: any, res: Response) => {
  try {
    const f = req.file;
    if (!f) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${f.filename}`;
    return res.json({ file: { fileName: f.originalname, fileUrl, mimeType: f.mimetype, sizeBytes: f.size } });
  } catch (err: any) {
    console.error("uploadFile error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const attachToNotice = async (req: any, res: Response) => {
  try {
    const f = req.file;
    if (!f) return res.status(400).json({ error: "No file uploaded" });
    const noticeId = req.params.id;
    const notice = await Notice.findById(noticeId);
    if (!notice) return res.status(404).json({ error: "Notice not found" });
    const attachment = { fileName: f.originalname, fileUrl: `/uploads/${f.filename}`, mimeType: f.mimetype, sizeBytes: f.size };
    notice.attachments = notice.attachments || [];
    notice.attachments.push(attachment as any);
    await notice.save();
    return res.json({ attachment });
  } catch (err: any) {
    console.error("attachToNotice error:", err);
    res.status(500).json({ error: "Failed to attach file to notice" });
  }
};
