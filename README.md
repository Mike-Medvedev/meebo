# Meebo - Type-Safe Express Router with Runtime Validation

> The missing API contract validation for Express.js

[![npm version](https://badge.fury.io/js/meebo.svg)](https://badge.fury.io/js/meebo)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## 🎯 The Problem

Express routes have **no type safety** and **no runtime validation**:

```typescript
// ❌ Regular Express Router
const router = express.Router();

router.post("/users", (req, res) => {
  const user = req.body; // Could be anything!
  res.json({ success: true });
});
```

**Problems:**

- ❌ No TypeScript type checking
- ❌ No runtime validation
- ❌ No automatic API documentation
- ❌ Silent failures and bugs

## ✨ The Solution

Wrap your router once, get everything:

```typescript
// ✅ Meebo Typed Router
import { TypedRouter } from "meebo";

const router = TypedRouter(express.Router());

router.post(
  "/users",
  {
    request: UserSchema, // Runtime + compile-time validation
    response: UserResponseSchema,
  },
  (req, res) => {
    // req.body is fully typed! 🎉
    // Invalid requests are automatically rejected
    res.json({ users: [] }); // Response validated too!
  },
);
```

**Benefits:**

- ✅ Full TypeScript type safety
- ✅ Runtime validation with Zod
- ✅ Automatic Swagger/OpenAPI docs
- ✅ Zero boilerplate

## 🚀 Quick Start

```bash
npm install meebo zod express
```

```typescript
import express from "express";
import { TypedRouter, swagger } from "meebo";
import { z } from "zod";

const app = express();
app.use(express.json());

// Wrap your router
const router = TypedRouter(express.Router());

// Define schemas
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

// Use typed routes
router.post("/users", { request: UserSchema, response: UserResponseSchema }, (req, res) => {
  // req.body is typed as { name: string, email: string }
  const user = req.body; // ✅ TypeScript knows the type!

  // Create user...
  res.json({ id: 1, ...user }); // ✅ Response validated
});

app.use("/api", router);
app.use(swagger()); // Auto-generated docs at /docs

app.listen(3000);
```

## 📸 Visual Comparison

### Before (Regular Express)

[SCREENSHOT 1: VS Code showing regular Express router with red squiggles on req.body, showing `any` type]

### After (Meebo)

[SCREENSHOT 2: VS Code showing TypedRouter with green types, autocomplete working, no errors]

### Automatic Swagger UI

[SCREENSHOT 3: Browser showing /docs with beautiful Swagger UI]

## 🎨 Features

- **🔒 Type Safety**: Full TypeScript support with inferred types
- **✅ Runtime Validation**: Automatic request/response validation with Zod
- **📚 Auto Documentation**: Swagger UI generated automatically
- **🔄 Gradual Adoption**: Wrap routers individually, migrate incrementally
- **⚡ Zero Config**: Works out of the box
- **🎯 Query, Params, Headers**: Validate everything, not just body

## 📖 Advanced Usage

### Query Parameters & Path Params

```typescript
router.get(
  "/users/:id",
  {
    params: z.object({ id: z.string() }),
    query: z.object({ page: z.number().optional() }),
    response: UserSchema,
  },
  (req, res) => {
    // req.params.id is typed!
    // req.query.page is typed!
  },
);
```

### Headers Validation

```typescript
router.post(
  "/users",
  {
    headers: z.object({ "x-api-key": z.string() }),
    request: UserSchema,
    response: UserResponseSchema,
  },
  handler,
);
```

### Gradual Migration

```typescript
// Old router - untouched
const oldRouter = express.Router();
oldRouter.get('/legacy', legacyHandler);

// New router - typed
const newRouter = TypedRouter(express.Router());
newRouter.get('/users', { request: ..., response: ... }, handler);

// Use both
app.use('/api/v1', oldRouter);
app.use('/api/v2', newRouter);
```

## 🤝 Comparison

| Feature            | Express   | Meebo             |
| ------------------ | --------- | ----------------- |
| TypeScript Types   | ❌ `any`  | ✅ Inferred       |
| Runtime Validation | ❌ Manual | ✅ Automatic      |
| API Documentation  | ❌ Manual | ✅ Auto-generated |
| Query Validation   | ❌ Manual | ✅ Built-in       |
| Params Validation  | ❌ Manual | ✅ Built-in       |
| Headers Validation | ❌ Manual | ✅ Built-in       |

## 📚 Documentation

- [Full Documentation](./docs/README.md)
- [Migration Guide](./docs/MIGRATION.md)
- [API Reference](./docs/API.md)

## 📄 License

ISC

## 🙏 Inspired By

- [FastAPI](https://fastapi.tiangolo.com/) - Python's type-safe API framework
