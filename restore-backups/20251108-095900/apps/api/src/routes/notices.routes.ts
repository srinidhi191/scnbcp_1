import { Router } from "express";
import { auth } from "../middleware/auth";
import { rbac } from "../middleware/rbac";
import * as C from "../controllers/notices.controller";

const r = Router();

r.post("/", auth, rbac("admin", "faculty"), C.createNotice);
r.get("/", auth, C.listNotices);
r.get("/:id", auth, C.getNotice);
r.patch("/:id", auth, rbac("admin", "faculty"), C.updateNotice);
r.post("/:id/publish", auth, rbac("admin", "faculty"), C.publishNow);
r.post("/:id/archive", auth, rbac("admin", "faculty"), C.archiveNotice);
r.post("/:id/view", auth, C.markViewed);
r.post("/:id/ack", auth, C.acknowledge);

export default r;
