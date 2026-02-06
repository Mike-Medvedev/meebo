import type { Request, Response, NextFunction } from "express";
import swaggerUi, { type SwaggerUiOptions } from "swagger-ui-express";
import openApiService from "./openapi.ts";
import type { SwaggerDocOptions } from "./openapi.ts";

export interface SwaggerOptions extends SwaggerDocOptions {
  /** Default to light theme (Swagger UI 5.31+). Removes the dark-mode class on <html> so the built-in light CSS is used. */
  theme?: "light" | "dark" | "auto";
}

/**
 * Exposes Swagger UI at /docs containing all your paths and registered schemas.
 * Options: `{ bearerAuth: true }` for the Authorize button; `{ theme: "light" }` for default light theme.
 */
export function swagger(title?: string, options?: SwaggerOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const app = req.app;
    if (!(app as any)._swaggerSetup) {
      app.get("/docs/openapi.json", (req, res) => {
        const openapiDoc = openApiService.generateOpenApiDocument(title, options);
        res.json(openapiDoc);
      });

      const setupOpts: SwaggerUiOptions & { customJsStr?: string } = {
        swaggerOptions: { url: "/docs/openapi.json" },
      };
      if (options?.theme === "light") {
        setupOpts.customJsStr = "document.documentElement.classList.remove('dark-mode');";
      } else if (options?.theme === "dark") {
        setupOpts.customJsStr = "document.documentElement.classList.add('dark-mode');";
      }

      app.use("/docs", swaggerUi.serve, swaggerUi.setup(null, setupOpts));
      (app as any)._swaggerSetup = true;
    }
    next();
  };
}
