<div align="center">

![meebo_logo](https://github.com/user-attachments/assets/1623ac58-e24a-4bd8-80ed-0d711c3f1787)

**The missing API validation library for Express**

[![npm version](https://img.shields.io/npm/v/meebo.svg)](https://www.npmjs.com/package/meebo)
[![TypeScript](https://img.shields.io/badge/TypeScript-only-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

[Installation](#install) • [Usage](#usage) • [OpenAPI](#openapi--swagger) • [Configuration](#configuration)

</div>

---

## Why Meebo?

Express is the most popular Node.js framework, but it was built before TypeScript existed...

**Existing solutions require too much:**

- **tRPC**: Amazing, but requires you to abandon REST...
- **ts-rest**: Powerful, but requires defining contracts separately...
- **tsoa**: Generates code from decorators, heavy setup...

**Meebo takes a different approach:**
Keep your Express routes exactly as they are and simply add your schema

---

## The Problem

```typescript
const router = express.Router();

router.post("/users", (req, res) => {
  const user = req.body; // req.body is type any and not validated at runtime
  res.json({ user }); // res.json returns anything and is not validated either
});
```

## The Solution

```typescript
import { TypedRouter, swagger } from "meebo";
import { z } from "zod";

const router = TypedRouter(express.Router());

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

router.post("/users", { request: UserSchema, response: UserSchema }, (req, res) => {
  req.body; // typed + validated using UserSchema ✅
  res.json({ name: "John", email: "john@example.com" }); // typed + validated using UserSchema ✅
});
```

**You now have an API where**

- TypeScript knows the exact shape of `req.body`, `req.query`, `req.params`, and your response
- Full autocomplete and intellisense on your requests, responses, queries, params, and headers
- Zod validates everything at runtime, ensuring data matches and gives very helpful errors
- Swagger UI and OpenAPI json generated from all your endpoints and schema

## Install

```bash
npm install meebo zod express
npm install -D typescript @types/express @types/node
```

> **Requirements:** TypeScript, Express 5+, Zod 3 or 4

## Usage

```typescript
// Validate request body, response, query, params, headers
router.get(
  "/users/:id",
  {
    params: z.object({ id: z.string() }),
    query: z.object({ limit: z.coerce.number().optional() }),
    response: UserSchema,
  },
  (req, res) => {
    req.params.id; // string
    req.query.limit; // number | undefined
  },
);
```

## OpenAPI / Swagger

Add `swagger()` as the **last middleware** to serve swagger ui docs at `/docs`:

```typescript
const app = express();
app.use("/api", router);
app.use(swagger("My API"));
```

### Authorize button (Bearer token)

To show an "Authorize"so you can enter a Bearer token and test protected routes from the docs, pass `{ bearerAuth: true }` as the second argument:

```typescript
app.use(swagger("My API", { bearerAuth: true }));
```

### Router Options

Configure router-level defaults for OpenAPI documentation:

```typescript
const UserRouter = TypedRouter(express.Router(), {
  tag: "Users", // Default tag for all routes in this router
  basePath: "/users", // Prefix for OpenAPI paths (for documentation only)
});

// All routes automatically tagged as "Users" in Swagger
UserRouter.get("/", { response: z.array(UserSchema) }, handler);
UserRouter.get("/:id", { response: UserSchema }, handler);
```

### Schema Options

Add OpenAPI metadata directly in your route schema:

```typescript
router.get(
  "/:id",
  {
    params: z.object({ id: z.string() }),
    response: UserSchema,
    tags: ["Users", "Public"], // Override router tag
    summary: "Get user by ID", // Endpoint summary
    description: "Returns a single user by their unique identifier",
  },
  handler,
);
```

### Multiple Response Codes

Document different response schemas for different HTTP status codes:

```typescript
router.get(
  "/:id",
  {
    params: z.object({ id: z.string() }),
    responses: {
      200: UserSchema,
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string(), requestId: z.string().optional() }),
    },
    summary: "Get user by ID",
  },
  handler,
);
```

You can also use both `response` and `responses` together:

```typescript
{
  response: UserSchema,  // Shorthand for 200
  responses: {
    404: NotFoundSchema,
    500: ErrorSchema,
  },
}
```

### Schema Metadata

Use `.openapi()` on any Zod schema to add descriptions, examples, and more (powered by [zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi)):

```typescript
const UserSchema = z
  .object({
    name: z.string().openapi({ example: "John" }),
    email: z.string().email().openapi({ example: "john@example.com" }),
  })
  .openapi({
    description: "A user object",
    example: { name: "John", email: "john@example.com" },
  });
```

https://github.com/user-attachments/assets/d47bf5c3-a2b5-4ee8-885d-8c9d1db9fcd8

## Configuration

Configure meebo globally to customize error responses and validation behavior:

```typescript
import { configureMeebo } from "meebo";

configureMeebo({
  // Custom error response format
  formatError: (context) => ({
    success: false,
    error: `${context.type} validation failed`,
    details: context.zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  }),

  // Skip response validation for these status codes (default shown)
  skipResponseValidationForStatus: [400, 401, 403, 404, 409, 422, 500, 502, 503],

  // Disable response validation entirely (not recommended)
  validateResponses: true,
});
```

### Error Context

The `formatError` function receives a context object:

```typescript
interface MeeboErrorContext {
  type: "request" | "response" | "params" | "query" | "headers";
  method: string; // HTTP method (GET, POST, etc.)
  path: string; // Request path
  zodError: z.ZodError; // The Zod validation error
}
```

### Default Error Format

Without configuration, errors are returned as:

```json
{
  "error": "Request validation failed",
  "type": "request",
  "detail": [{ "path": ["email"], "message": "Invalid email" }]
}
```

## License

ISC
