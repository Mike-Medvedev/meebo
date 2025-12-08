import type { Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import openApiService from "./openapi.ts";
/**
 * Exposes Swagger UI at /docs containing all your paths and registered schemas
 */
export function swagger(title?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const app = req.app;
    if (!(app as any)._swaggerSetup) {
      app.get("/docs/openapi.json", (req, res) => {
        const openapiDoc = openApiService.generateOpenApiDocument(title);
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
