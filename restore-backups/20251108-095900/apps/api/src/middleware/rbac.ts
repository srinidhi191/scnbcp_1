import { Response, NextFunction } from "express";
import { AuthedRequest } from "./auth";

export const rbac = (...roles: string[]) =>
  (req: AuthedRequest, res: Response, next: NextFunction) => {
    const userRoles: string[] = req.user?.roles || [];
    const ok = userRoles.some(r => roles.includes(r));
    if (!ok) return res.status(403).json({ error: "Forbidden" });
    next();
  };
