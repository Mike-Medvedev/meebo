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
import { validateRequest, validateResponse } from "./runtimeValidators.ts";

interface RouteSchema<TRequest extends z.ZodType, TResponse extends z.ZodType> {
  request: TRequest;
  response: TResponse;
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
        const schema = args[0] as RouteSchema<z.ZodAny, z.ZodAny>;
        const handlers = args.slice(1);

        openApiService.registerPath(path, method, schema, [(path as string).slice(1)]);

        return originalMethods[method](
          path,
          validateRequest(schema.request),
          validateResponse(schema.response),
          ...handlers,
        );
      }
      return originalMethods[method](path, ...args);
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
 * checks if schema exists in express router method
 */
function schemaExists(args: any[]): boolean {
  //TODO: Add runtime validation to passed in schema
  if (
    args.length > 0 &&
    typeof args[0] === "object" &&
    args[0] !== null &&
    !Array.isArray(args[0]) &&
    ("request" in args[0] || "response" in args[0])
  ) {
    return true;
  }
  return false;
}

export function typedHandler<TRequest extends z.ZodType, TResponse extends z.ZodType>(
  schemas: RouteSchema<TRequest, TResponse>,
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
 * 4. Add All types of request data, (headers, cookies, etc)
 * 5. Overload all 5 types if IRouterMatches with our schema impl.
 * 6. Add Extensible ways to update OpenAPI Swagger Ui with zod-to-openapi api
 *
 */
