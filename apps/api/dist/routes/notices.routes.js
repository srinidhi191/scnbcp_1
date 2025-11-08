"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const C = __importStar(require("../controllers/notices.controller"));
const r = (0, express_1.Router)();
r.post("/", auth_1.auth, (0, rbac_1.rbac)("admin", "faculty"), C.createNotice);
r.get("/", auth_1.auth, C.listNotices);
r.get("/:id", auth_1.auth, C.getNotice);
r.patch("/:id", auth_1.auth, (0, rbac_1.rbac)("admin", "faculty"), C.updateNotice);
r.post("/:id/publish", auth_1.auth, (0, rbac_1.rbac)("admin", "faculty"), C.publishNow);
r.post("/:id/archive", auth_1.auth, (0, rbac_1.rbac)("admin", "faculty"), C.archiveNotice);
r.post("/:id/view", auth_1.auth, C.markViewed);
r.post("/:id/ack", auth_1.auth, C.acknowledge);
exports.default = r;
