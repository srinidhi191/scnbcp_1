import mongoose from "mongoose";
import Notice from "../models/Notice";
import NoticeAudience from "../models/NoticeAudience";
import NoticeAck from "../models/NoticeAck";
import { getIO } from "../realtime/socket";
import User from "../models/User";
import { sendMail, noticeEmailTemplate } from "../services/mailer";

const roomsForAudience = async (noticeId: mongoose.Types.ObjectId) => {
  const rows = await NoticeAudience.find({ noticeId });
  const set = new Set<string>();
  rows.forEach((r: any) => {
    if (r.role) set.add(`role:${r.role}`);
    if (r.departmentId) set.add(`dept:${r.departmentId}`);
    if (r.programId) set.add(`prog:${r.programId}`);
    if (r.batchId) set.add(`batch:${r.batchId}`);
    if (r.userId) set.add(`user:${r.userId}`);
  });
  return Array.from(set);
};

export const createNotice = async (req: any, res: any) => {
  try {
    const { title, body, category, priority, visibility, publishAt, expireAt, audience = [], attachments = [] } = req.body;

    // validate targeted audience presence
    if (visibility === "targeted" && (!Array.isArray(audience) || audience.length === 0)) {
      return res.status(400).json({ error: "Targeted notices require at least one audience entry" });
    }

    const notice = await Notice.create({ title, body, category, priority, visibility, publishAt, expireAt, createdBy: req.user._id, attachments });
    if (visibility === "targeted" && audience.length) {
      await NoticeAudience.insertMany(audience.map((a: any) => ({ noticeId: notice._id, ...a })));
    }

    // If publishAt is not set or is in the past, auto-publish and notify immediately
    try {
      const pubAt = publishAt ? new Date(publishAt) : null;
      if (!pubAt || pubAt.getTime() <= Date.now()) {
        // mark published and send notifications (fire-and-forget)
        (async () => {
          try {
            notice.status = "published";
            notice.publishAt = pubAt || new Date();
            await notice.save();
            // emit and email
            const io = getIO();
            if (notice.visibility === "public") {
              io.emit("notice:published", { notice });
            } else {
              const rooms = await roomsForAudience(notice._id);
              rooms.forEach((r) => io.to(r).emit("notice:published", { notice }));
            }
            // reuse email sending code from publishNow (simple inline to avoid duplication)
            let emails: string[] = [];
            if (notice.visibility === "public") {
              // send to users who are active and have logged in (have lastLogin)
              emails = await User.find({ isActive: true, lastLogin: { $exists: true } }).distinct("email");
            } else {
              const rows = await NoticeAudience.find({ noticeId: notice._id });
              const or: any[] = [];
              const userIds: any[] = [];
              rows.forEach((r: any) => {
                if (r.userId) userIds.push(r.userId);
                if (r.role) or.push({ roles: r.role });
                if (r.departmentId) or.push({ departmentId: r.departmentId });
                if (r.programId) or.push({ programId: r.programId });
                if (r.batchId) or.push({ batchId: r.batchId });
              });
              const q: any = { isActive: true, lastLogin: { $exists: true } };
              const clauses: any[] = [];
              if (userIds.length) clauses.push({ _id: { $in: userIds } });
              if (or.length) clauses.push(...or);
              if (clauses.length) q.$or = clauses;
              emails = await User.find(q).distinct("email");
            }
            emails = (emails || []).filter(Boolean);
            const chunkSize = 100;
            const subject = `New notice: ${notice.title}`;
            const html = noticeEmailTemplate(String(notice.title || ""), String(notice.body || ""));
            for (let i = 0; i < emails.length; i += chunkSize) {
              const batch = emails.slice(i, i + chunkSize);
              try {
                await sendMail(batch, subject, html);
              } catch (err) {
                console.error("Failed to send notice emails to batch:", err);
              }
            }
          } catch (err) {
            console.error("auto-publish error:", err);
          }
        })();
      }
    } catch (e) {
      console.error("auto-publish check failed:", e);
    }

    return res.json({ notice });
  } catch (err: any) {
    console.error("createNotice error:", err && err.stack ? err.stack : err);
    if (err.name === "ValidationError") {
      // collect simple validation messages
      const details: any = {};
      Object.keys(err.errors || {}).forEach((k) => (details[k] = err.errors[k].message));
      return res.status(400).json({ error: "Validation failed", details });
    }
    return res.status(500).json({ error: err?.message || "Failed to create notice" });
  }
};

export const listNotices = async (req: any, res: any) => {
  const { status, category, search, from, to } = req.query;
  const q: any = {};
  if (status) q.status = status;
  if (category) q.category = category;
  if (search) q.$text = { $search: String(search) };
  if (from || to) {
    q.publishAt = {};
    if (from) q.publishAt.$gte = new Date(String(from));
    if (to) q.publishAt.$lte = new Date(String(to));
  }
  const items = await Notice.find(q).sort({ publishAt: -1 }).limit(100);
  res.json({ items });
};

export const getNotice = async (req: any, res: any) => {
  const n = await Notice.findById(req.params.id);
  if (!n) return res.status(404).end();
  res.json({ notice: n });
};

export const updateNotice = async (req: any, res: any) => {
  const n = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ notice: n });
};

export const publishNow = async (req: any, res: any) => {
  const n = await Notice.findById(req.params.id);
  if (!n) return res.status(404).end();
  n.status = "published";
  n.publishAt = new Date();
  await n.save();

  const io = getIO();
  if (n.visibility === "public") {
    io.emit("notice:published", { notice: n });
  } else {
    const rooms = await roomsForAudience(n._id);
    rooms.forEach((r) => io.to(r).emit("notice:published", { notice: n }));
  }
  // send email notifications to relevant users (fire-and-forget)
  (async () => {
    try {
      let emails: string[] = [];
      if (n.visibility === "public") {
        emails = await User.find({ isActive: true, lastLogin: { $exists: true } }).distinct("email");
      } else {
        const rows = await NoticeAudience.find({ noticeId: n._id });
        const or: any[] = [];
        const userIds: any[] = [];
        rows.forEach((r: any) => {
          if (r.userId) userIds.push(r.userId);
          if (r.role) or.push({ roles: r.role });
          if (r.departmentId) or.push({ departmentId: r.departmentId });
          if (r.programId) or.push({ programId: r.programId });
          if (r.batchId) or.push({ batchId: r.batchId });
        });
        const q: any = { isActive: true, lastLogin: { $exists: true } };
        const clauses: any[] = [];
        if (userIds.length) clauses.push({ _id: { $in: userIds } });
        if (or.length) clauses.push(...or);
        if (clauses.length) q.$or = clauses;
        emails = await User.find(q).distinct("email");
      }

      emails = (emails || []).filter(Boolean);
      // send in reasonable batches to avoid SMTP limits
      const chunkSize = 100;
      const subject = `New notice: ${n.title}`;
  const html = noticeEmailTemplate(String(n.title || ""), String(n.body || ""));
      for (let i = 0; i < emails.length; i += chunkSize) {
        const batch = emails.slice(i, i + chunkSize);
        try {
          await sendMail(batch, subject, html);
        } catch (err) {
          console.error("Failed to send notice emails to batch:", err);
        }
      }
    } catch (err) {
      console.error("notice email send error:", err);
    }
  })();
  res.json({ notice: n });
};

export const archiveNotice = async (req: any, res: any) => {
  const n = await Notice.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
  res.json({ notice: n });
};

export const markViewed = async (req: any, res: any) => {
  await NoticeAck.updateOne(
    { noticeId: req.params.id, userId: req.user._id },
    { $set: { viewedAt: new Date() } },
    { upsert: true }
  );
  res.json({ ok: true });
};

export const acknowledge = async (req: any, res: any) => {
  await NoticeAck.updateOne(
    { noticeId: req.params.id, userId: req.user._id },
    { $set: { acknowledged: true, acknowledgedAt: new Date() } },
    { upsert: true }
  );
  res.json({ ok: true });
};
