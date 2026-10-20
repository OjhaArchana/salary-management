import { describe, it, expect } from "vitest";
import { isActivePath } from "./nav";

describe("isActivePath", () => {
  it("matches the home link only on the exact home path", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/insights", "/")).toBe(false);
  });

  it("matches a section link on its path and on nested paths", () => {
    expect(isActivePath("/insights", "/insights")).toBe(true);
    expect(isActivePath("/insights/details", "/insights")).toBe(true);
  });

  it("does not match a different path that merely starts with the same letters", () => {
    expect(isActivePath("/insightsfoo", "/insights")).toBe(false);
  });
});