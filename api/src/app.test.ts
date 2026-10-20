import request from "supertest";
import { describe, it, expect } from "vitest";
import { createApp } from "./app";
import { openDb } from "./db";

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(createApp(openDb(":memory:"))).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});