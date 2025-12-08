# Meebo

> Type-safe API contracts for Express.js

## The Problem

```typescript
router.post("/users", (req, res) => {
  const user = req.body; // any 😱
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
  req.body; // typed + validated ✅
  res.json({ name: "John", email: "john@example.com" }); // typed + validated ✅
});
```

## Install

```bash
npm install meebo zod express
```

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

Add `swagger()` as the **last middleware** to serve docs at `/docs`:

```typescript
const app = express();
app.use("/api", router);
app.use(swagger("My API")); // title is optional
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

## License

ISC
