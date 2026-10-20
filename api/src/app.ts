import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import type { Db } from "./db";
import { employeeRouter } from "./employees/routes";
import { insightsRouter } from "./insights/routes";
import { listOptions } from "./employees/options";

function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if ((err as { status?: number }).status === 400) {
    res.status(400).json({ error: "Malformed request body" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

export function createApp(db: Db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/employees", employeeRouter(db));
  app.use("/api/insights", insightsRouter(db));
  app.get("/api/options", (_req, res) => {res.json(listOptions(db));});
  app.use(errorHandler);
  return app;
}