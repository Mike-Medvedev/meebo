# Meebo

> Type-safe API contracts for Express.js

## The Problem

```typescript
router.post("/users", (req, res) => {
  const user = req.body; // any 😱
  res.json({ user }); // returns any payload 😱
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
