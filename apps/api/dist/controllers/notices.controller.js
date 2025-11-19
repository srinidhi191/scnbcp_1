"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAcks = exports.getAudience = exports.acknowledge = exports.markViewed = exports.archiveNotice = exports.publishNow = exports.updateNotice = exports.getNotice = exports.listNotices = exports.createNotice = void 0;
const Notice_1 = __importDefault(require("../models/Notice"));
const NoticeAudience_1 = __importDefault(require("../models/NoticeAudience"));
const NoticeAck_1 = __importDefault(require("../models/NoticeAck"));
const socket_1 = require("../realtime/socket");
const User_1 = __importDefault(require("../models/User"));
const mailer_1 = require("../services/mailer");
const roomsForAudience = async (noticeId) => {
    const rows = await NoticeAudience_1.default.find({ noticeId });
    const set = new Set();
    rows.forEach((r) => {
        if (r.role)
            set.add(`role:${r.role}`);
        if (r.departmentId)
            set.add(`dept:${r.departmentId}`);
        if (r.programId)
            set.add(`prog:${r.programId}`);
        if (r.batchId)
            set.add(`batch:${r.batchId}`);
        if (r.userId)
            set.add(`user:${r.userId}`);
    });
    return Array.from(set);
};
const createNotice = async (req, res) => {
    try {
        const { title, body, category, priority, visibility, publishAt, expireAt, audience = [], attachments = [] } = req.body;
        // sanitize audience entries (remove empty string fields) and validate presence for targeted notices
        const sanitizedAudience = Array.isArray(audience)
            ? audience
                .map((a) => {
                const out = { noticeId: undefined };
                if (a.role)
                    out.role = a.role;
                if (a.departmentId)
                    out.departmentId = a.departmentId;
                if (a.programId)
                    out.programId = a.programId;
                if (a.batchId)
                    out.batchId = a.batchId;
                if (a.userId)
                    out.userId = a.userId;
                return out;
            })
                .map((o) => {
                // ensure noticeId will be set later; remove entries that have no identifying fields
                const keys = Object.keys(o).filter((k) => k !== "noticeId");
                if (keys.length === 0)
                    return null;
                return o;
            })
                .filter(Boolean)
            : [];
        if (visibility === "targeted" && sanitizedAudience.length === 0) {
            return res.status(400).json({ error: "Targeted notices require at least one audience entry" });
        }
        const notice = await Notice_1.default.create({ title, body, category, priority, visibility, publishAt, expireAt, createdBy: req.user._id, attachments });
        if (visibility === "targeted" && sanitizedAudience.length) {
            // attach noticeId and only include non-empty fields so mongoose doesn't try to cast empty strings to ObjectId
            const rows = sanitizedAudience.map((a) => {
                const row = { noticeId: notice._id };
                if (a.role)
                    row.role = a.role;
                if (a.departmentId)
                    row.departmentId = a.departmentId;
                if (a.programId)
                    row.programId = a.programId;
                if (a.batchId)
                    row.batchId = a.batchId;
                if (a.userId)
                    row.userId = a.userId;
                return row;
            });
            await NoticeAudience_1.default.insertMany(rows);
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
                        const io = (0, socket_1.getIO)();
                        if (notice.visibility === "public") {
                            io.emit("notice:published", { notice });
                        }
                        else {
                            const rooms = await roomsForAudience(notice._id);
                            rooms.forEach((r) => io.to(r).emit("notice:published", { notice }));
                        }
                        // reuse email sending code from publishNow (simple inline to avoid duplication)
                        let emails = [];
                        if (notice.visibility === "public") {
                            // send to users who are active and have logged in (have lastLogin)
                            emails = await User_1.default.find({ isActive: true, lastLogin: { $exists: true } }).distinct("email");
                        }
                        else {
                            const rows = await NoticeAudience_1.default.find({ noticeId: notice._id });
                            const or = [];
                            const userIds = [];
                            rows.forEach((r) => {
                                if (r.userId)
                                    userIds.push(r.userId);
                                if (r.role)
                                    or.push({ roles: r.role });
                                if (r.departmentId)
                                    or.push({ departmentId: r.departmentId });
                                if (r.programId)
                                    or.push({ programId: r.programId });
                                if (r.batchId)
                                    or.push({ batchId: r.batchId });
                            });
                            const q = { isActive: true, lastLogin: { $exists: true } };
                            const clauses = [];
                            if (userIds.length)
                                clauses.push({ _id: { $in: userIds } });
                            if (or.length)
                                clauses.push(...or);
                            if (clauses.length)
                                q.$or = clauses;
                            emails = await User_1.default.find(q).distinct("email");
                        }
                        emails = (emails || []).filter(Boolean);
                        const chunkSize = 100;
                        const subject = `New notice: ${notice.title}`;
                        const html = (0, mailer_1.noticeEmailTemplate)(String(notice.title || ""), String(notice.body || ""));
                        for (let i = 0; i < emails.length; i += chunkSize) {
                            const batch = emails.slice(i, i + chunkSize);
                            try {
                                await (0, mailer_1.sendMail)(batch, subject, html);
                            }
                            catch (err) {
                                console.error("Failed to send notice emails to batch:", err);
                            }
                        }
                    }
                    catch (err) {
                        console.error("auto-publish error:", err);
                    }
                })();
            }
        }
        catch (e) {
            console.error("auto-publish check failed:", e);
        }
        return res.json({ notice });
    }
    catch (err) {
        console.error("createNotice error:", err && err.stack ? err.stack : err);
        if (err.name === "ValidationError") {
            // collect simple validation messages
            const details = {};
            Object.keys(err.errors || {}).forEach((k) => (details[k] = err.errors[k].message));
            return res.status(400).json({ error: "Validation failed", details });
        }
        return res.status(500).json({ error: err?.message || "Failed to create notice" });
    }
};
exports.createNotice = createNotice;
const listNotices = async (req, res) => {
    const { status, category, search, from, to } = req.query;
    const q = {};
    if (status)
        q.status = status;
    if (category)
        q.category = category;
    if (search)
        q.$text = { $search: String(search) };
    if (from || to) {
        q.publishAt = {};
        if (from)
            q.publishAt.$gte = new Date(String(from));
        if (to)
            q.publishAt.$lte = new Date(String(to));
    }
    const items = await Notice_1.default.find(q).sort({ publishAt: -1 }).limit(100);
    res.json({ items });
};
exports.listNotices = listNotices;
const getNotice = async (req, res) => {
    const n = await Notice_1.default.findById(req.params.id);
    if (!n)
        return res.status(404).end();
    res.json({ notice: n });
};
exports.getNotice = getNotice;
const updateNotice = async (req, res) => {
    const n = await Notice_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ notice: n });
};
exports.updateNotice = updateNotice;
const publishNow = async (req, res) => {
    const n = await Notice_1.default.findById(req.params.id);
    if (!n)
        return res.status(404).end();
    n.status = "published";
    n.publishAt = new Date();
    await n.save();
    const io = (0, socket_1.getIO)();
    if (n.visibility === "public") {
        io.emit("notice:published", { notice: n });
    }
    else {
        const rooms = await roomsForAudience(n._id);
        rooms.forEach((r) => io.to(r).emit("notice:published", { notice: n }));
    }
    // send email notifications to relevant users (fire-and-forget)
    (async () => {
        try {
            let emails = [];
            if (n.visibility === "public") {
                emails = await User_1.default.find({ isActive: true, lastLogin: { $exists: true } }).distinct("email");
            }
            else {
                const rows = await NoticeAudience_1.default.find({ noticeId: n._id });
                const or = [];
                const userIds = [];
                rows.forEach((r) => {
                    if (r.userId)
                        userIds.push(r.userId);
                    if (r.role)
                        or.push({ roles: r.role });
                    if (r.departmentId)
                        or.push({ departmentId: r.departmentId });
                    if (r.programId)
                        or.push({ programId: r.programId });
                    if (r.batchId)
                        or.push({ batchId: r.batchId });
                });
                const q = { isActive: true, lastLogin: { $exists: true } };
                const clauses = [];
                if (userIds.length)
                    clauses.push({ _id: { $in: userIds } });
                if (or.length)
                    clauses.push(...or);
                if (clauses.length)
                    q.$or = clauses;
                emails = await User_1.default.find(q).distinct("email");
            }
            emails = (emails || []).filter(Boolean);
            // send in reasonable batches to avoid SMTP limits
            const chunkSize = 100;
            const subject = `New notice: ${n.title}`;
            const html = (0, mailer_1.noticeEmailTemplate)(String(n.title || ""), String(n.body || ""));
            for (let i = 0; i < emails.length; i += chunkSize) {
                const batch = emails.slice(i, i + chunkSize);
                try {
                    await (0, mailer_1.sendMail)(batch, subject, html);
                }
                catch (err) {
                    console.error("Failed to send notice emails to batch:", err);
                }
            }
        }
        catch (err) {
            console.error("notice email send error:", err);
        }
    })();
    res.json({ notice: n });
};
exports.publishNow = publishNow;
const archiveNotice = async (req, res) => {
    const n = await Notice_1.default.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
    res.json({ notice: n });
};
exports.archiveNotice = archiveNotice;
const markViewed = async (req, res) => {
    await NoticeAck_1.default.updateOne({ noticeId: req.params.id, userId: req.user._id }, { $set: { viewedAt: new Date() } }, { upsert: true });
    res.json({ ok: true });
};
exports.markViewed = markViewed;
const acknowledge = async (req, res) => {
    await NoticeAck_1.default.updateOne({ noticeId: req.params.id, userId: req.user._id }, { $set: { acknowledged: true, acknowledgedAt: new Date() } }, { upsert: true });
    res.json({ ok: true });
};
exports.acknowledge = acknowledge;
const getAudience = async (req, res) => {
    try {
        const rows = await NoticeAudience_1.default.find({ noticeId: req.params.id });
        res.json({ audience: rows });
    }
    catch (err) {
        console.error('getAudience error', err);
        res.status(500).json({ error: 'Failed to fetch audience' });
    }
};
exports.getAudience = getAudience;
const listAcks = async (req, res) => {
    try {
        const rows = await NoticeAck_1.default.find({ userId: req.user._id });
        res.json({ acks: rows });
    }
    catch (err) {
        console.error('listAcks error', err);
        res.status(500).json({ error: 'Failed to fetch acks' });
    }
};
exports.listAcks = listAcks;
