import { Router } from "express";
import type { Db } from "../db";
import { salaryStats } from "./salaryStats";
import { validateSalaryStatsQuery } from "./validation";

export function insightsRouter(db: Db): Router {
  const router = Router();

  router.get("/salary", (req, res) => {
    const parsed = validateSalaryStatsQuery(req.query);
    if (!parsed.ok) {
      res.status(400).json({ errors: parsed.errors });
      return;
    }
    res.json({ groupBy: parsed.data.groupBy, rows: salaryStats(db, parsed.data) });
  });

  return router;
}