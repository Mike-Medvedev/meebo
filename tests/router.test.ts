import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { z } from "zod";
import { TypedRouter } from "../package/index.ts";

describe("TypedRouter", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe("Request Body Validation (POST/PUT)", () => {
    it("accepts valid request body", async () => {
      const router = TypedRouter(express.Router());

      router.post(
        "/users",
        {
          request: z.object({ name: z.string(), age: z.number() }),
          response: z.object({ id: z.number(), name: z.string(), age: z.number() }),
        },
        (req, res) => {
          res.json({ id: 1, name: req.body.name, age: req.body.age });
        },
      );

      app.use(router);

      const response = await request(app).post("/users").send({ name: "mike", age: 25 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: "mike", age: 25 });
    });

    it("rejects invalid request body with 422", async () => {
      const router = TypedRouter(express.Router());

      router.post(
        "/users",
        {
          request: z.object({ name: z.string(), age: z.number() }),
          response: z.object({ id: z.number(), name: z.string() }),
        },
        (req, res) => {
          res.json({ id: 1, name: req.body.name });
        },
      );

      app.use(router);

      const response = await request(app)
        .post("/users")
        .send({ name: "mike", age: "not-a-number" }); // Invalid: age should be number

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("Request validation failed");
      expect(response.body.detail).toBeDefined();
    });

    it("rejects missing required fields with 422", async () => {
      const router = TypedRouter(express.Router());

      router.post(
        "/users",
        {
          request: z.object({ name: z.string(), email: z.string().email() }),
          response: z.object({ success: z.boolean() }),
        },
        (req, res) => {
          res.json({ success: true });
        },
      );

      app.use(router);

      const response = await request(app).post("/users").send({ name: "mike" }); // Missing email

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("Request validation failed");
    });
  });

  describe("Response Validation", () => {
    it("accepts valid response body", async () => {
      const router = TypedRouter(express.Router());

      router.post(
        "/users",
        {
          request: z.object({ name: z.string() }),
          response: z.object({ id: z.number(), name: z.string() }),
        },
        (req, res) => {
          res.json({ id: 1, name: req.body.name });
        },
      );

      app.use(router);

      const response = await request(app).post("/users").send({ name: "mike" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: "mike" });
    });

    it("rejects invalid response body with 500", async () => {
      const router = TypedRouter(express.Router());

      router.post(
        "/users",
        {
          request: z.object({ name: z.string() }),
          response: z.object({ id: z.number(), name: z.string() }),
        },
        (req, res) => {
          // Return wrong shape - id should be number, not string
          res.json({ id: "not-a-number", name: req.body.name });
        },
      );

      app.use(router);

      const response = await request(app).post("/users").send({ name: "mike" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Response validation failed");
    });
  });

  describe("Query Parameters Validation (GET)", () => {
    it("accepts valid query parameters", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/search",
        {
          response: z.object({ found: z.boolean() }),
          query: z.object({ q: z.string() }),
        },
        (req, res) => {
          res.json({ found: true });
        },
      );

      app.use(router);

      const response = await request(app).get("/search?q=hello");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ found: true });
    });

    it("rejects invalid query parameters with 422", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/search",
        {
          response: z.object({ results: z.array(z.string()) }),
          query: z.object({
            q: z.string().min(3, "Search query must be at least 3 characters"),
          }),
        },
        (req, res) => {
          res.json({ results: [] });
        },
      );

      app.use(router);

      const response = await request(app).get("/search?q=ab"); // Too short

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("Query validation failed");
    });

    it("rejects missing required query parameters", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/search",
        {
          response: z.object({ results: z.array(z.string()) }),
          query: z.object({ q: z.string() }), // q is required
        },
        (req, res) => {
          res.json({ results: [] });
        },
      );

      app.use(router);

      const response = await request(app).get("/search"); // Missing q param

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("Query validation failed");
    });
  });

  describe("Headers Validation (GET)", () => {
    it("accepts valid headers", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/protected",
        {
          response: z.object({ authenticated: z.boolean(), user: z.string() }),
          headers: z.object({ "x-api-key": z.string() }).loose(),
        },
        (req, res) => {
          res.json({ authenticated: true, user: "mike" });
        },
      );

      app.use(router);

      const response = await request(app).get("/protected").set("x-api-key", "secret-key-123");

      expect(response.status).toBe(200);
      expect(response.body.authenticated).toBe(true);
    });

    it("rejects missing required headers with 422", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/protected",
        {
          response: z.object({ authenticated: z.boolean() }),
          headers: z.object({ "x-api-key": z.string() }),
        },
        (req, res) => {
          res.json({ authenticated: true });
        },
      );

      app.use(router);

      const response = await request(app).get("/protected"); // No x-api-key header

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("Headers validation failed");
    });

    it("validates header format", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/protected",
        {
          response: z.object({ success: z.boolean() }),
          headers: z
            .object({
              authorization: z.string().startsWith("Bearer "),
            })
            .loose(),
        },
        (req, res) => {
          res.json({ success: true });
        },
      );

      app.use(router);

      // Invalid - doesn't start with "Bearer "
      const invalidResponse = await request(app)
        .get("/protected")
        .set("authorization", "invalid-token");

      expect(invalidResponse.status).toBe(422);
      expect(invalidResponse.body.error).toBe("Headers validation failed");

      // Valid
      const validResponse = await request(app)
        .get("/protected")
        .set("authorization", "Bearer valid-token");

      expect(validResponse.status).toBe(200);
    });
  });

  describe("Path Parameters Validation (GET)", () => {
    it("accepts valid path parameters", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/users/:id",
        {
          response: z.object({ id: z.string(), name: z.string() }),
          params: z.object({ id: z.string().regex(/^\d+$/, "ID must be numeric") }),
        },
        (req, res) => {
          res.json({ id: req.params.id, name: "mike" });
        },
      );

      app.use(router);

      const response = await request(app).get("/users/123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: "123", name: "mike" });
    });

    it("rejects invalid path parameters with 422", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/users/:id",
        {
          response: z.object({ id: z.string() }),
          params: z.object({ id: z.string().regex(/^\d+$/) }),
        },
        (req, res) => {
          res.json({ id: req.params.id });
        },
      );

      app.use(router);

      const response = await request(app).get("/users/abc"); // Invalid: not digits

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("Params validation failed");
    });

    it("validates UUID path parameters", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/posts/:postId",
        {
          response: z.object({ postId: z.string() }),
          params: z.object({ postId: z.string().uuid() }),
        },
        (req, res) => {
          res.json({ postId: req.params.postId });
        },
      );

      app.use(router);

      // Invalid UUID
      const invalidResponse = await request(app).get("/posts/not-a-uuid");
      expect(invalidResponse.status).toBe(422);

      // Valid UUID
      const validResponse = await request(app).get("/posts/550e8400-e29b-41d4-a716-446655440000");
      expect(validResponse.status).toBe(200);
    });
  });

  describe("Combined Validation (GET with multiple schemas)", () => {
    it("validates params, query, and headers together", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/users/:id/posts",
        {
          response: z.object({ success: z.boolean() }),
          params: z.object({ id: z.string().regex(/^\d+$/) }),
          query: z.object({ limit: z.string().optional() }),
          headers: z.object({ "x-api-key": z.string() }).loose(),
        },
        (req, res) => {
          res.json({ success: true });
        },
      );

      app.use(router);

      const response = await request(app)
        .get("/users/123/posts?limit=5")
        .set("x-api-key", "my-key");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("fails if any validation fails", async () => {
      const router = TypedRouter(express.Router());

      router.get(
        "/users/:id/posts",
        {
          response: z.object({ posts: z.array(z.string()) }),
          params: z.object({ id: z.string().regex(/^\d+$/) }),
          query: z.object({ limit: z.string() }),
          headers: z.object({ "x-api-key": z.string() }).loose(),
        },
        (req, res) => {
          res.json({ posts: [] });
        },
      );

      app.use(router);

      // Invalid params
      const badParamsResponse = await request(app)
        .get("/users/abc/posts?limit=5")
        .set("x-api-key", "my-key");
      expect(badParamsResponse.status).toBe(422);
      expect(badParamsResponse.body.error).toBe("Params validation failed");
    });
  });

  describe("Union Response Types", () => {
    it("accepts multiple valid response shapes with union", async () => {
      const router = TypedRouter(express.Router());

      const SuccessResponse = z.object({ success: z.literal(true), data: z.string() });
      const ErrorResponse = z.object({ success: z.literal(false), error: z.string() });

      router.post(
        "/data",
        {
          request: z.object({ action: z.string() }),
          response: z.union([SuccessResponse, ErrorResponse]),
        },
        (req, res) => {
          res.json({ success: true, data: "hello" });
        },
      );

      app.use(router);

      const response = await request(app).post("/data").send({ action: "test" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: "hello" });
    });

    it("accepts error shape in union response", async () => {
      const router = TypedRouter(express.Router());

      const SuccessResponse = z.object({ success: z.literal(true), data: z.string() });
      const ErrorResponse = z.object({ success: z.literal(false), error: z.string() });

      router.post(
        "/data",
        {
          request: z.object({ action: z.string() }),
          response: z.union([SuccessResponse, ErrorResponse]),
        },
        (req, res) => {
          res.json({ success: false, error: "Something went wrong" });
        },
      );

      app.use(router);

      const response = await request(app).post("/data").send({ action: "test" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: false, error: "Something went wrong" });
    });
  });
});
