import request from "supertest";
import { beforeEach, describe, it, expect } from "vitest";
import { createApp } from "../app";
import { openDb, type Db } from "../db";
import { listOptions } from "./options";
import { createEmployee } from "./repository";
import { makeEmployee } from "./testHelpers";

let db: Db;
beforeEach(() => {
  db = openDb(":memory:");
});

describe("listOptions", () => {
  it("returns empty lists for an empty database", () => {
    expect(listOptions(db)).toEqual({ countries: [], departments: [], jobTitles: [] });
  });

  it("returns sorted distinct values", () => {
    createEmployee(db, makeEmployee({ email: "a@acme.com", country: "India", department: "Sales", jobTitle: "Sales Manager" }));
    createEmployee(db, makeEmployee({ email: "b@acme.com", country: "India", department: "Engineering", jobTitle: "QA Engineer" }));
    createEmployee(db, makeEmployee({ email: "c@acme.com", country: "Germany", currency: "EUR", department: "Sales", jobTitle: "Sales Manager" }));
    expect(listOptions(db)).toEqual({
      countries: ["Germany", "India"],
      departments: ["Engineering", "Sales"],
      jobTitles: ["QA Engineer", "Sales Manager"],
    });
  });
});

describe("GET /api/options", () => {
  it("returns the options as JSON", async () => {
    createEmployee(db, makeEmployee());
    const res = await request(createApp(db)).get("/api/options");
    expect(res.status).toBe(200);
    expect(res.body.countries).toEqual(["India"]);
  });
});