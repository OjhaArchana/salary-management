import request from "supertest";
import { beforeEach, describe, it, expect } from "vitest";
import { createApp } from "../app";
import { openDb } from "../db";

const body = {
  firstName: "Asha",
  lastName: "Rao",
  email: "asha.rao@acme.com",
  jobTitle: "Software Engineer",
  department: "Engineering",
  country: "India",
  currency: "INR",
  salary: 2000000,
  hireDate: "2022-04-01",
};

let app: ReturnType<typeof createApp>;
beforeEach(() => {
  app = createApp(openDb(":memory:"));
});

const create = (overrides: Record<string, unknown> = {}) =>
  request(app).post("/api/employees").send({ ...body, ...overrides });

describe("POST /api/employees", () => {
  it("creates an employee", async () => {
    const res = await create();
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), email: "asha.rao@acme.com" });
  });

  it("returns 400 with field errors for invalid input", async () => {
    const res = await create({ salary: -5 });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("salary");
  });

  it("returns 409 for a duplicate email", async () => {
    await create();
    expect((await create()).status).toBe(409);
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/employees", () => {
  it("returns a paginated page", async () => {
    await create();
    const res = await request(app).get("/api/employees");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 1, page: 1, pageSize: 25, totalPages: 1 });
    expect(res.body.items).toHaveLength(1);
  });

  it("applies filters from the query string", async () => {
    await create();
    await create({ email: "liam@acme.com", country: "United States", currency: "USD" });
    const res = await request(app).get("/api/employees?country=India");
    expect(res.body.total).toBe(1);
  });

  it("returns 400 for an invalid query", async () => {
    expect((await request(app).get("/api/employees?pageSize=0")).status).toBe(400);
  });
});

describe("GET /api/employees/:id", () => {
  it("returns the employee", async () => {
    const { body: created } = await create();
    const res = await request(app).get(`/api/employees/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("asha.rao@acme.com");
  });

  it("returns 404 for an unknown id", async () => {
    expect((await request(app).get("/api/employees/999")).status).toBe(404);
  });

  it("returns 400 for a non-numeric id", async () => {
    expect((await request(app).get("/api/employees/abc")).status).toBe(400);
  });
});

describe("PATCH /api/employees/:id", () => {
  it("updates the given fields", async () => {
    const { body: created } = await create();
    const res = await request(app).patch(`/api/employees/${created.id}`).send({ salary: 2500000 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: created.id, salary: 2500000, firstName: "Asha" });
  });

  it("returns 404 for an unknown id", async () => {
    expect((await request(app).patch("/api/employees/999").send({ salary: 1 })).status).toBe(404);
  });

  it("returns 400 for an empty update", async () => {
    const { body: created } = await create();
    expect((await request(app).patch(`/api/employees/${created.id}`).send({})).status).toBe(400);
  });
});

describe("DELETE /api/employees/:id", () => {
  it("deletes the employee", async () => {
    const { body: created } = await create();
    expect((await request(app).delete(`/api/employees/${created.id}`)).status).toBe(204);
    expect((await request(app).get(`/api/employees/${created.id}`)).status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    expect((await request(app).delete("/api/employees/999")).status).toBe(404);
  });
});