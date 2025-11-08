"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbac = void 0;
const rbac = (...roles) => (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const ok = userRoles.some(r => roles.includes(r));
    if (!ok)
        return res.status(403).json({ error: "Forbidden" });
    next();
};
exports.rbac = rbac;
