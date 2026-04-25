import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.js";
import protectedRouter from "./routes/protected.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", healthRouter);
  app.use("/api", protectedRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: "Route not found.",
    });
  });

  return app;
}
