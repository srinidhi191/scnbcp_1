import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";

import { ENV } from "./config/env";
import { connectDB } from "./db/mongo";
import authRoutes from "./routes/auth.routes";
import noticesRoutes from "./routes/notices.routes";
import queriesRoutes from "./routes/queries.routes";
import { initSocket } from "./realtime/socket";

const app = express();

// CORS + body parsing
// Allow the configured client origin, plus common local dev ports (5173/5174).
// This is a dev-friendly CORS policy. For production, prefer a strict single origin.
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (e.g., curl, Postman) which send no origin
      if (!origin) return callback(null, true);
      const allowed = new Set([
        ENV.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:5174",
        // Vite may report 127.0.0.1 as the host in logs and the browser may use that
        // form as the Origin header, so accept both localhost and 127.0.0.1 variants.
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ]);
      if (allowed.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// health + quick ping
app.get("/", (_req: Request, res: Response) => res.send("SCNBCP API running"));
app.get("/api/ping", (_req: Request, res: Response) => res.json({ ok: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/queries", queriesRoutes);

const server = http.createServer(app);

(async () => {
  try {
    await connectDB(ENV.MONGO_URI);
    const port = Number(ENV.PORT || 4000);
    console.log("ENV check:", { CLIENT_URL: ENV.CLIENT_URL, PORT: port });
    // initialize socket.io so controllers using getIO() can emit events
    try {
      initSocket(server, ENV.CLIENT_URL || "http://127.0.0.1:5173");
      console.log("Realtime socket initialized");
    } catch (e) {
      console.warn("Realtime socket initialization failed:", e);
    }
    // start listening and log on success
    // Bind explicitly to IPv4 loopback to avoid IPv6/IPv4 ambiguity on some Windows setups
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      try {
        if (addr && typeof addr === "object") {
          console.log(`🚀 API listening on http://${addr.address}:${(addr as any).port} (${addr.family})`);
        } else if (typeof addr === "string") {
          console.log(`🚀 API listening on ${addr}`);
        } else {
          console.log(`🚀 API listening on port ${port}`);
        }
      } catch (e) {
        console.log(`🚀 API on http://localhost:${port}`);
      }
    });
    // handle server errors (EADDRINUSE etc.) and log them clearly
    server.on("error", (err: any) => {
      console.error("Server error while trying to listen:", err && err.stack ? err.stack : err);
      // if it's a listen error, exit so ts-node-dev can restart or you can inspect
      if (err && err.code) process.exit(1);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();

// Global handlers to capture unexpected errors during development
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason && (reason as any).stack ? (reason as any).stack : reason);
});
