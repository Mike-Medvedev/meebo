import type { RequestHandler, Router, IRouterMatcher } from "express";
import { z } from "zod";
import openApiService from "./openapi.ts";
import {
  validateHeaders,
  validateParams,
  validateQuery,
  validateRequest,
  validateResponse,
} from "./runtimeValidators.ts";
import { capitalizeFirst } from "./utils.ts";
import type { RouteSchema, HttpMethod } from "./shared.ts";

const HTTP_METHODS: readonly HttpMethod[] = [
  "all",
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
] as const;

// Methods that typically have a request body
const METHODS_WITH_BODY: readonly HttpMethod[] = ["post", "put", "patch", "delete", "all"] as const;

/**
 * Creates a Typed Express router that adds a "schema" param to all router methods
 * @example const router = TypedRouter(express.Router());
 * @example router.get("/users", { request: UserSchema, response: UsersSchema }, handler)
 * @returns The original express router with typed methods
 */
export function TypedRouter(router: Router) {
  type Methods = (typeof HTTP_METHODS)[number];
  type MethodMap = Record<Methods, IRouterMatcher<Router>>;
  const builder = {} as Partial<MethodMap>;
  const originalRouter = router;
  const originalMethods = {} as Record<Methods, IRouterMatcher<Router>>;
  HTTP_METHODS.forEach((method) => {
    originalMethods[method] = originalRouter[method].bind(originalRouter);
  });

  HTTP_METHODS.forEach((method) => {
    builder[method] = function (path: any, ...args: any[]): any {
      if (schemaExists(args)) {
        const schema = args[0] as RouteSchema<z.ZodAny, z.ZodAny, z.ZodAny, z.ZodAny, z.ZodAny>;
        const handlers = args.slice(1);

        openApiService.registerPath(path, method, schema, [
          capitalizeFirst((path as string).slice(1)),
        ]);

        const middleware: RequestHandler[] = [];

        if (schema.params) {
          middleware.push(validateParams(schema.params));
        }
        if (schema.query) {
          middleware.push(validateQuery(schema.query));
        }
        if (schema.headers) {
          middleware.push(validateHeaders(schema.headers));
        }
        // Only validate request body for methods that have a body
        if (schema.request && METHODS_WITH_BODY.includes(method)) {
          middleware.push(validateRequest(schema.request));
        }
        middleware.push(validateResponse(schema.response));

        return originalMethods[method](path, ...middleware, ...handlers);
      } else {
        console.error(`Error: Invalid or Missing Schema in route: ${method} ${path}`);
        const handlers = args.slice(1);
        return originalMethods[method](path, ...handlers);
      }
    };
  });

  const typedMethods = builder as MethodMap;

  HTTP_METHODS.forEach((method) => {
    (originalRouter as any)[method] = typedMethods[method];
  });

  return originalRouter as Router;
}

function isValidZodSchema(value: any): boolean {
  return value instanceof z.ZodType;
}

/**
 * Checks if schema object exists and has valid response schema
 * Request schema is optional (not needed for GET, HEAD, OPTIONS)
 */
function schemaExists(args: any[]): boolean {
  if (
    args.length > 0 &&
    typeof args[0] === "object" &&
    args[0] !== null &&
    !Array.isArray(args[0]) &&
    "response" in args[0]
  ) {
    const schema = args[0];

    // Response is always required
    if (!isValidZodSchema(schema.response)) {
      return false;
    }

    // Request is optional, but if provided must be valid
    if ("request" in schema && !isValidZodSchema(schema.request)) {
      return false;
    }

    return true;
  }

  return false;
}

/**
 * Helper to create typed handlers with schema inference
 * @example export const getUsers = typedHandler({ request: UserSchema, response: UsersSchema }, handler)
 */
export function typedHandler<
  TRequest extends z.ZodType = z.ZodAny,
  TResponse extends z.ZodType = z.ZodAny,
  TQuery extends z.ZodType = z.ZodAny,
  TParams extends z.ZodType = z.ZodAny,
  THeaders extends z.ZodType = z.ZodAny,
>(
  schemas: RouteSchema<TRequest, TResponse, TQuery, TParams, THeaders>,
  handler: RequestHandler<any, z.infer<TResponse>, z.infer<TRequest>, any, any>,
) {
  return handler;
}
