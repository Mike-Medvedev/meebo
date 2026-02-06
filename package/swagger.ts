import type { Request, Response, NextFunction } from "express";
import swaggerUi, { type SwaggerUiOptions } from "swagger-ui-express";
import openApiService from "./openapi.ts";
import type { SwaggerDocOptions } from "./openapi.ts";

export interface SwaggerOptions extends SwaggerDocOptions {}

/**
 * Exposes Swagger UI at /docs containing all your paths and registered schemas.
 * Options: `{ bearerAuth: true }` for the Authorize button; `{ version: "1.2.0" }` for your API version.
 */
export function swagger(title?: string, options?: SwaggerOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const app = req.app;
    if (!(app as any)._swaggerSetup) {
      app.get("/docs/openapi.json", (req, res) => {
        const openapiDoc = openApiService.generateOpenApiDocument(title, options);
        res.json(openapiDoc);
      });

      const setupOpts: SwaggerUiOptions = {
        swaggerOptions: { url: "/docs/openapi.json" },
      };

      app.use("/docs", swaggerUi.serve, swaggerUi.setup(null, setupOpts));
      (app as any)._swaggerSetup = true;
    }
    next();
  };
}
