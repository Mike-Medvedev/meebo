<div align="center">

![meebo_logo](https://github.com/user-attachments/assets/1623ac58-e24a-4bd8-80ed-0d711c3f1787)

**The missing API validation library for Express**

[![npm version](https://img.shields.io/npm/v/meebo.svg)](https://www.npmjs.com/package/meebo)
[![TypeScript](https://img.shields.io/badge/TypeScript-only-blue.svg)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

[Installation](#install) • [Usage](#usage) • [OpenAPI](#openapi--swagger)

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

## License

ISC
