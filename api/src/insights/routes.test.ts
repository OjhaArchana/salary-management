import request from "supertest";
import { beforeEach, describe, it, expect } from "vitest";
import { createApp } from "../app";
import { openDb } from "../db";
import { createEmployee } from "../employees/repository";
import { makeEmployee } from "../employees/testHelpers";

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  const db = openDb(":memory:");
  createEmployee(db, makeEmployee({ email: "a@acme.com", salary: 100 }));
  createEmployee(db, makeEmployee({ email: "b@acme.com", salary: 300 }));
  createEmployee(
    db,
    makeEmployee({ email: "c@acme.com", country: "Germany", currency: "EUR", department: "Sales", salary: 50 })
  );
  app = createApp(db);
});

describe("GET /api/insights/salary", () => {
  it("groups by country by default", async () => {
    const res = await request(app).get("/api/insights/salary");
    expect(res.status).toBe(200);
    expect(res.body.groupBy).toBe("country");
    expect(res.body.rows).toEqual([
      { group: "Germany", currency: "EUR", headcount: 1, min: 50, max: 50, average: 50, median: 50 },
      { group: "India", currency: "INR", headcount: 2, min: 100, max: 300, average: 200, median: 200 },
    ]);
  });

  it("supports grouping by department", async () => {
    const res = await request(app).get("/api/insights/salary?groupBy=department");
    expect(res.body.rows.map((r: { group: string }) => r.group)).toEqual(["Engineering", "Sales"]);
  });

  it("applies filters", async () => {
    const res = await request(app).get("/api/insights/salary?groupBy=department&country=India");
    expect(res.body.rows).toHaveLength(1);
    expect(res.body.rows[0]).toMatchObject({ group: "Engineering", headcount: 2 });
  });

  it("returns 400 for an invalid grouping", async () => {
    const res = await request(app).get("/api/insights/salary?groupBy=salary");
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("groupBy");
  });
});