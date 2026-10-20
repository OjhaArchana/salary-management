import { beforeEach, describe, it, expect } from "vitest";
import { openDb, type Db } from "../db";
import {
  createEmployee,
  deleteEmployee,
  DuplicateEmailError,
  getEmployee,
  updateEmployee,
} from "./repository";
import { makeEmployee } from "./testHelpers";

let db: Db;
beforeEach(() => {
  db = openDb(":memory:");
});

describe("createEmployee / getEmployee", () => {
  it("creates an employee and returns it with an id", () => {
    const created = createEmployee(db, makeEmployee());
    expect(created.id).toBeGreaterThan(0);
    expect(getEmployee(db, created.id)).toEqual(created);
  });

  it("returns undefined for an unknown id", () => {
    expect(getEmployee(db, 999)).toBeUndefined();
  });

  it("rejects a duplicate email", () => {
    createEmployee(db, makeEmployee());
    expect(() => createEmployee(db, makeEmployee())).toThrow(DuplicateEmailError);
  });
});

describe("updateEmployee", () => {
  it("changes only the provided fields", () => {
    const created = createEmployee(db, makeEmployee());
    const updated = updateEmployee(db, created.id, { salary: 2500000 });
    expect(updated).toEqual({ ...created, salary: 2500000 });
  });

  it("returns undefined for an unknown id", () => {
    expect(updateEmployee(db, 999, { salary: 1 })).toBeUndefined();
  });

  it("rejects an email that belongs to another employee", () => {
    createEmployee(db, makeEmployee({ email: "a@acme.com" }));
    const second = createEmployee(db, makeEmployee({ email: "b@acme.com" }));
    expect(() => updateEmployee(db, second.id, { email: "a@acme.com" })).toThrow(DuplicateEmailError);
  });
});

describe("deleteEmployee", () => {
  it("deletes an employee, then reports false when it is already gone", () => {
    const created = createEmployee(db, makeEmployee());
    expect(deleteEmployee(db, created.id)).toBe(true);
    expect(getEmployee(db, created.id)).toBeUndefined();
    expect(deleteEmployee(db, created.id)).toBe(false);
  });
});