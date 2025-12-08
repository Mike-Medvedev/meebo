import { describe, it, expect } from "vitest";
import { inferZodShape, generateUnionSuggestion } from "../package/errorHelpers.ts";

describe("inferZodShape", () => {
  it("infers null", () => {
    expect(inferZodShape(null)).toBe("z.null()");
  });

  it("infers undefined", () => {
    expect(inferZodShape(undefined)).toBe("z.undefined()");
  });

  it("infers string", () => {
    expect(inferZodShape("hello")).toBe("z.string()");
  });

  it("infers number", () => {
    expect(inferZodShape(42)).toBe("z.number()");
  });

  it("infers boolean", () => {
    expect(inferZodShape(true)).toBe("z.boolean()");
    expect(inferZodShape(false)).toBe("z.boolean()");
  });

  it("infers empty array", () => {
    expect(inferZodShape([])).toBe("z.array(z.unknown())");
  });

  it("infers array of strings", () => {
    expect(inferZodShape(["a", "b"])).toBe("z.array(z.string())");
  });

  it("infers array of numbers", () => {
    expect(inferZodShape([1, 2, 3])).toBe("z.array(z.number())");
  });

  it("infers simple object", () => {
    const result = inferZodShape({ name: "mike", age: 25 });
    expect(result).toContain("z.object");
    expect(result).toContain("name: z.string()");
    expect(result).toContain("age: z.number()");
  });

  it("infers nested object", () => {
    const result = inferZodShape({
      user: { name: "mike", active: true },
    });
    expect(result).toContain("z.object");
    expect(result).toContain("user: z.object");
    expect(result).toContain("name: z.string()");
    expect(result).toContain("active: z.boolean()");
  });

  it("infers array of objects", () => {
    const result = inferZodShape([{ id: 1, name: "mike" }]);
    expect(result).toContain("z.array");
    expect(result).toContain("z.object");
  });
});

describe("generateUnionSuggestion", () => {
  it("generates helpful error message", () => {
    const payload = { id: 1, name: "mike" };
    const result = generateUnionSuggestion(payload, "GET", "/users");

    expect(result).toContain("Response validation failed");
    expect(result).toContain("GET /users");
    expect(result).toContain("z.union");
    expect(result).toContain("YourCurrentResponseSchema");
  });

  it("includes the received payload", () => {
    const payload = { error: "Not found" };
    const result = generateUnionSuggestion(payload, "POST", "/api/data");

    expect(result).toContain("Not found");
    expect(result).toContain("POST /api/data");
  });
});
