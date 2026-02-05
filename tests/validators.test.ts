import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import {
  validateRequest,
  validateResponse,
  validateHeaders,
  validateQuery,
  validateParams,
} from "../package/runtimeValidators.ts";

// Mock Express request/response/next
function createMockReq(overrides: Partial<any> = {}) {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    method: "GET",
    path: "/test",
    url: "/test",
    ...overrides,
  };
}

function createMockRes() {
  const res: any = {
    statusCode: 200,
    _isValidationError: false,
    status: vi.fn(function (code: number) {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn(function (data: any) {
      res._data = data;
      return res;
    }),
  };
  return res;
}

describe("validateRequest", () => {
  it("passes valid request body", () => {
    const schema = z.object({ name: z.string() });
    const middleware = validateRequest(schema);

    const req = createMockReq({ body: { name: "mike" } });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: "mike" });
  });

  it("rejects invalid request body", () => {
    const schema = z.object({ name: z.string() });
    const middleware = validateRequest(schema);

    const req = createMockReq({ body: { name: 123 } }); // Invalid
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res._data.error).toBe("Request validation failed");
  });

  it("transforms data using schema", () => {
    const schema = z.object({
      age: z.coerce.number(),
    });
    const middleware = validateRequest(schema);

    const req = createMockReq({ body: { age: "25" } }); // String input
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.age).toBe(25); // Transformed to number
  });
});

describe("validateQuery", () => {
  it("passes valid query params", () => {
    const schema = z.object({ page: z.string() });
    const middleware = validateQuery(schema);

    const req = createMockReq({ query: { page: "5" } });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    // Note: In Express 5, query is read-only, so we just validate without transforming
  });

  it("rejects invalid query params", () => {
    const schema = z.object({ page: z.string().regex(/^\d+$/) });
    const middleware = validateQuery(schema);

    const req = createMockReq({ query: { page: "abc" } }); // Not a number
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res._data.error).toBe("Query validation failed");
  });
});

describe("validateParams", () => {
  it("passes valid path params", () => {
    const schema = z.object({ id: z.string() });
    const middleware = validateParams(schema);

    const req = createMockReq({ params: { id: "123" } });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    // Note: In Express 5, params is read-only, so we just validate without transforming
  });

  it("rejects invalid path params", () => {
    const schema = z.object({ id: z.string().uuid() });
    const middleware = validateParams(schema);

    const req = createMockReq({ params: { id: "not-a-uuid" } });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res._data.error).toBe("Params validation failed");
  });
});

describe("validateHeaders", () => {
  it("passes valid headers", () => {
    const schema = z.object({ "x-api-key": z.string() }).loose();
    const middleware = validateHeaders(schema);

    const req = createMockReq({ headers: { "x-api-key": "secret", host: "localhost" } });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });

  it("rejects missing required headers", () => {
    const schema = z.object({ "x-api-key": z.string() });
    const middleware = validateHeaders(schema);

    const req = createMockReq({ headers: {} }); // Missing x-api-key
    const res = createMockRes();
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res._data.error).toBe("Headers validation failed");
  });
});

describe("validateResponse", () => {
  it("passes valid response", () => {
    const schema = z.object({ id: z.number(), name: z.string() });
    const middleware = validateResponse(schema);

    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    // Apply middleware
    middleware(req as any, res as any, next);

    // Now call res.json with valid data
    res.json({ id: 1, name: "mike" });

    expect(res._data).toEqual({ id: 1, name: "mike" });
  });

  it("rejects invalid response with 500", () => {
    const schema = z.object({ id: z.number(), name: z.string() });
    const middleware = validateResponse(schema);

    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    // Apply middleware
    middleware(req as any, res as any, next);

    // Now call res.json with invalid data
    res.json({ id: "not-a-number", name: "mike" });

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res._data.error).toBe("Response validation failed");
  });

  it("skips validation when _isValidationError is true", () => {
    const schema = z.object({ id: z.number() });
    const middleware = validateResponse(schema);

    const req = createMockReq();
    const res = createMockRes();
    res._isValidationError = true; // Set flag
    const next = vi.fn();

    // Apply middleware
    middleware(req as any, res as any, next);

    // Call with non-matching data - should pass through
    const errorData = { error: "Some error", detail: {} };
    res.json(errorData);

    // Should pass through without validation
    expect(res._data).toEqual(errorData);
    expect(res.status).not.toHaveBeenCalledWith(500);
  });
});
