import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as C from "../controllers/uploads.controller";

const r = Router();

// Destination: apps/api/uploads
const destDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, destDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'_')}`),
});
const upload = multer({ storage });

// POST /api/uploads -> upload file
r.post("/", upload.single("file"), C.uploadFile);

// POST /api/uploads/notices/:id -> upload and attach to notice
r.post("/notices/:id", upload.single("file"), C.attachToNotice);

export default r;
