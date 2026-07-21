import express from "express";
import cors from "cors";
import teamRoutes from "./routes/team.route.js";
import raceRoutes from "./routes/race.route.js";
import raceResultRoutes from "./routes/raceResult.route.js";
import standingsRoutes from "./routes/standings.route.js";
import adminRoutes from "./routes/adminStanding.route.js";
import { rateLimit, securityHeaders } from "./middleware/security.middleware.js";

function allowedOrigins() {
  return (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();
  const origins = allowedOrigins();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(rateLimit({ windowMs: 60_000, max: 180 }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS."));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));
  app.use(express.json({ limit: "64kb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/teams", teamRoutes);
  app.use("/api/races", raceRoutes);
  app.use("/api/race-results", raceResultRoutes);
  app.use("/api/standings", standingsRoutes);
  app.use("/api/admin", adminRoutes);

  app.get("/", (_req, res) => res.send("F1Info API is running."));

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} was not found.` });
  });

  app.use((err, _req, res, _next) => {
    if (err.message === "Origin is not allowed by CORS.") {
      return res.status(403).json({ message: err.message });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ message: "Request body is too large." });
    }
    console.error("Unhandled API error:", err);
    return res.status(500).json({ message: "Internal server error." });
  });

  return app;
}

export default createApp();
