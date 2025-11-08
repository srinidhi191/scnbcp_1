"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
require("dotenv/config");
exports.ENV = {
    PORT: process.env.PORT || "4000",
    MONGO_URI: process.env.MONGO_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "supersecret",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    SMTP: {
        HOST: process.env.SMTP_HOST || "",
        PORT: Number(process.env.SMTP_PORT || 587),
        USER: process.env.SMTP_USER || "",
        PASS: process.env.SMTP_PASS || ""
    }
};
