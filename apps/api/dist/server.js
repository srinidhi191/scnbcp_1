"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
const mongo_1 = require("./db/mongo");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const notices_routes_1 = __importDefault(require("./routes/notices.routes"));
const queries_routes_1 = __importDefault(require("./routes/queries.routes"));
const app = (0, express_1.default)();
// CORS + body parsing
// Allow the configured client origin, plus common local dev ports (5173/5174).
// This is a dev-friendly CORS policy. For production, prefer a strict single origin.
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow non-browser requests (e.g., curl, Postman) which send no origin
        if (!origin)
            return callback(null, true);
        const allowed = new Set([
            env_1.ENV.CLIENT_URL,
            "http://localhost:5173",
            "http://localhost:5174",
        ]);
        if (allowed.has(origin))
            return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
// health + quick ping
app.get("/", (_req, res) => res.send("SCNBCP API running"));
app.get("/api/ping", (_req, res) => res.json({ ok: true }));
// routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/notices", notices_routes_1.default);
app.use("/api/queries", queries_routes_1.default);
const server = http_1.default.createServer(app);
(async () => {
    try {
        await (0, mongo_1.connectDB)(env_1.ENV.MONGO_URI);
        const port = Number(env_1.ENV.PORT || 4000);
        console.log("ENV check:", { CLIENT_URL: env_1.ENV.CLIENT_URL, PORT: port });
        // start listening and log on success
        // Bind explicitly to IPv4 loopback to avoid IPv6/IPv4 ambiguity on some Windows setups
        server.listen(port, "127.0.0.1", () => {
            const addr = server.address();
            try {
                if (addr && typeof addr === "object") {
                    console.log(`🚀 API listening on http://${addr.address}:${addr.port} (${addr.family})`);
                }
                else if (typeof addr === "string") {
                    console.log(`🚀 API listening on ${addr}`);
                }
                else {
                    console.log(`🚀 API listening on port ${port}`);
                }
            }
            catch (e) {
                console.log(`🚀 API on http://localhost:${port}`);
            }
        });
        // handle server errors (EADDRINUSE etc.) and log them clearly
        server.on("error", (err) => {
            console.error("Server error while trying to listen:", err && err.stack ? err.stack : err);
            // if it's a listen error, exit so ts-node-dev can restart or you can inspect
            if (err && err.code)
                process.exit(1);
        });
    }
    catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
})();
// Global handlers to capture unexpected errors during development
process.on("uncaughtException", (err) => {
    console.error("uncaughtException:", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (reason) => {
    console.error("unhandledRejection:", reason && reason.stack ? reason.stack : reason);
});
