import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
// If TS says “has no default export”, switch to:  import * as jwt from "jsonwebtoken";
import jwt from "jsonwebtoken";

import { ENV } from "../config/env";
import User from "../models/User";

/**
 * POST /api/auth/login
 * body: { email, password }
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const u = await User.findOne({ email: normalizedEmail });

    // user not found OR legacy user without hash
    if (!u || !u.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (!ENV.JWT_SECRET) {
      return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
    }

    const token = jwt.sign(
      {
        _id: u._id,
        roles: u.roles,
        departmentId: u.departmentId,
        programId: u.programId,
        batchId: u.batchId,
      },
      ENV.JWT_SECRET,
      { expiresIn: "2d" }
    );

    // update lastLogin timestamp
    try {
      await User.findByIdAndUpdate(u._id, { $set: { lastLogin: new Date() } });
    } catch (e) {
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
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Failed to login" });
  }
};

/**
 * POST /api/auth/register
 * body: { name, email, password, role? }
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = "student" } = (req.body ?? {}) as {
      name?: string;
      email?: string;
      password?: string;
      role?: "admin" | "faculty" | "student";
    };

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      roles: [role],
    });

    if (!ENV.JWT_SECRET) {
      return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
    }

    const token = jwt.sign({ _id: user._id, roles: user.roles }, ENV.JWT_SECRET, { expiresIn: "2d" });

    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, roles: user.roles },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Failed to register" });
  }
};
