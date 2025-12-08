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
import swaggerUi from "swagger-ui-express";
import openApiService from "./openapi/openapi.service.ts";

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

        openApiService.registry.registerPath({
          method: method as "get" | "post" | "put" | "delete" | "patch",
          path: `/api${path}`,
          summary: `${method.toUpperCase()} ${path}`,
          request: {
            body: {
              description: "Request body",
              content: {
                "application/json": {
                  schema: schema.request,
                },
              },
            },
          },
          responses: {
            200: {
              description: "Success response",
              content: {
                "application/json": {
                  schema: schema.response,
                },
              },
            },
          },
        });

        //TODO: HANDLE STRICT MODE for requiring schema

        function validateRequest() {
          return function (req: Request, res: Response, next: NextFunction) {
            const { data, error } = schema.request.safeParse(req.body);
            if (error) {
              return res.status(422).json({ detail: z.treeifyError(error) });
            }
            req.body = data;
            next();
          };
        }

        function validateResponse() {
          return function (req: Request, res: Response, next: NextFunction) {
            const originalRes = res.json;
            res.json = function (payload) {
              const { data, error } = schema.response.safeParse(payload);
              if (error) {
                console.log(error);
                return originalRes.call(res.status(422), {
                  detail: z.treeifyError(error),
                });
              }
              return originalRes.call(this, data);
            };
            next();
          };
        }
        return originalMethods[method](path, validateRequest(), validateResponse(), ...handlers);
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

/**
 * Exposes Swagger UI at /docs containing all your paths and registered schemas
 */
export function swagger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const app = req.app;
    if (!(app as any)._swaggerSetup) {
      app.get("/docs/openapi.json", (req, res) => {
        const openapiDoc = openApiService.generateOpenApiDocument();
        res.json(openapiDoc);
      });

      app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(null, {
          swaggerOptions: {
            url: "/docs/openapi.json",
          },
        }),
      );
      (app as any)._swaggerSetup = true;
    }
    next();
  };
}

export function typedHandler<TRequest extends z.ZodType, TResponse extends z.ZodType>(
  schemas: RouteSchema<TRequest, TResponse>,
  handler: RequestHandler<any, z.infer<TResponse>, z.infer<TRequest>, any, any>,
) {
  return handler;
}
