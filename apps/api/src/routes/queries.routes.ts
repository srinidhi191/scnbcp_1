import { Router } from "express";
import { auth } from "../middleware/auth";
import { rbac } from "../middleware/rbac";
import * as C from "../controllers/queries.controller";

const r = Router();

// create a query (any authenticated user)
r.post("/", auth, C.createQuery);

// list queries (only admin/faculty)
r.get("/", auth, rbac("admin", "faculty"), C.listQueries);

export default r;
