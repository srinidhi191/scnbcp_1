"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// If TS says “has no default export”, switch to:  import * as jwt from "jsonwebtoken";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = __importDefault(require("../models/User"));
/**
 * POST /api/auth/login
 * body: { email, password }
 */
const login = async (req, res) => {
    try {
        const { email, password } = (req.body ?? {});
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const normalizedEmail = String(email).toLowerCase().trim();
        const u = await User_1.default.findOne({ email: normalizedEmail });
        // user not found OR legacy user without hash
        if (!u || !u.passwordHash) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const ok = await bcryptjs_1.default.compare(password, u.passwordHash);
        if (!ok)
            return res.status(401).json({ error: "Invalid credentials" });
        if (!env_1.ENV.JWT_SECRET) {
            return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
        }
        const token = jsonwebtoken_1.default.sign({
            _id: u._id,
            roles: u.roles,
            departmentId: u.departmentId,
            programId: u.programId,
            batchId: u.batchId,
        }, env_1.ENV.JWT_SECRET, { expiresIn: "2d" });
        // update lastLogin timestamp
        try {
            await User_1.default.findByIdAndUpdate(u._id, { $set: { lastLogin: new Date() } });
        }
        catch (e) {
            console.warn("Failed to update lastLogin for user", u._id, e);
        }
        return res.json({
            token,
            user: {
                _id: u._id,
                name: u.name,
                email: u.email,
                roles: u.roles,
                departmentId: u.departmentId,
                programId: u.programId,
                batchId: u.batchId,
            },
        });
    }
    catch (err) {
        console.error("login error:", err);
        return res.status(500).json({ error: "Failed to login" });
    }
};
exports.login = login;
/**
 * POST /api/auth/register
 * body: { name, email, password, role? }
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role = "student" } = (req.body ?? {});
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" });
        }
        const normalizedEmail = String(email).toLowerCase().trim();
        const exists = await User_1.default.findOne({ email: normalizedEmail });
        if (exists)
            return res.status(400).json({ error: "Email already registered" });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({
            name,
            email: normalizedEmail,
            passwordHash,
            roles: [role],
        });
        if (!env_1.ENV.JWT_SECRET) {
            return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, roles: user.roles }, env_1.ENV.JWT_SECRET, { expiresIn: "2d" });
        return res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, roles: user.roles },
        });
    }
    catch (err) {
        console.error("register error:", err);
        return res.status(500).json({ error: "Failed to register" });
    }
};
exports.register = register;
