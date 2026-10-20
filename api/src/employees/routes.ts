import { Router, type Response } from "express";
import type { Db } from "../db";
import { listEmployees } from "./list";
import {
  createEmployee,
  deleteEmployee,
  DuplicateEmailError,
  getEmployee,
  updateEmployee,
} from "./repository";
import { validateEmployeeInput, validateEmployeeUpdate, validateListQuery } from "./validation";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Known write errors become 409; anything else goes to the central error handler.
function handleWriteError(err: unknown, res: Response): void {
  if (err instanceof DuplicateEmailError) {
    res.status(409).json({ error: err.message });
    return;
  }
  throw err;
}

export function employeeRouter(db: Db): Router {
  const router = Router();

  router.get("/", (req, res) => {
    const parsed = validateListQuery(req.query);
    if (!parsed.ok) {
      res.status(400).json({ errors: parsed.errors });
      return;
    }
    res.json(listEmployees(db, parsed.data));
  });

  router.post("/", (req, res) => {
    const parsed = validateEmployeeInput(req.body);
    if (!parsed.ok) {
      res.status(400).json({ errors: parsed.errors });
      return;
    }
    try {
      res.status(201).json(createEmployee(db, parsed.data));
    } catch (err) {
      handleWriteError(err, res);
    }
  });

  router.get("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const employee = getEmployee(db, id);
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    res.json(employee);
  });

  router.patch("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = validateEmployeeUpdate(req.body);
    if (!parsed.ok) {
      res.status(400).json({ errors: parsed.errors });
      return;
    }
    try {
      const updated = updateEmployee(db, id, parsed.data);
      if (!updated) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      handleWriteError(err, res);
    }
  });

  router.delete("/:id", (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    if (!deleteEmployee(db, id)) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}