import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Router,
  IRouterMatcher,
  Application,
} from "express";
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

interface RouteSchema<
  TRequest extends z.ZodType = z.ZodAny,
  TResponse extends z.ZodType = z.ZodAny,
  TQuery extends z.ZodType = z.ZodAny,
  TParams extends z.ZodType = z.ZodAny,
  THeaders extends z.ZodType = z.ZodAny,
> {
  request: TRequest;
  response: TResponse;
  query?: TQuery;
  params?: TParams;
  headers?: THeaders;
}
/**
 * Creates a Typed Express router that adds a "schema" param to all router methods
 * @example const t = TypedRouter(); t.get("/", { request: ZodSchema, response: ZodSchema }, handlers)
 * @returns original express router
 */
export function TypedRouter(router: Router) {
  const methods = ["all", "get", "post", "put", "delete", "patch", "options", "head"] as const;
  type Methods = (typeof methods)[number];
  type MethodMap = Record<Methods, IRouterMatcher<Router>>;
  const builder = {} as Partial<MethodMap>;
  const originalRouter = router;
  const originalMethods = {} as Record<Methods, IRouterMatcher<Router>>;
  methods.forEach((method) => {
    originalMethods[method] = originalRouter[method].bind(originalRouter);
  });

  methods.forEach((method) => {
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
        middleware.push(validateRequest(schema.request));
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

  //Step 2:
  methods.forEach((method) => {
    (originalRouter as any)[method] = typedMethods[method];
  });

  return originalRouter as Router;
}

/**
 * checks if a value is a valid Zod schema
 */
function isValidZodSchema(value: any): boolean {
  return value instanceof z.ZodType;
}

/**
 * checks if schema exists in express router method
 */
function schemaExists(args: any[]): boolean {
  if (
    args.length > 0 &&
    typeof args[0] === "object" &&
    args[0] !== null &&
    !Array.isArray(args[0]) &&
    "request" in args[0] &&
    "response" in args[0]
  ) {
    const schema = args[0];

    // Both request and response are required, validate both
    if (!isValidZodSchema(schema.request)) {
      return false;
    }
    if (!isValidZodSchema(schema.response)) {
      return false;
    }

    return true;
  }

  return false;
}

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

/**
 * TODO:
 * 0.
 * 1. Add Runtime validation to passed in schema object middleware to ensure a schemai s even passed
 * 2.  Add shared types in this packaage
 * 3. Potentially make a config with strict mode (schemas are required for all routes in a router)
 * 4. Add All types of request data, (headers, params, etc)
 * 5. Overload all 5 types if IRouterMatches with our schema impl.
 * 6. Add Extensible ways to update OpenAPI Swagger Ui with zod-to-openapi api
 *
 */
