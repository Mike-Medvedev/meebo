import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import type { RouteSchema } from "./shared.ts";
import packageJson from "../package.json" with { type: "json" };

class OpenApiService {
  public readonly registry: OpenAPIRegistry;

  constructor() {
    this.registry = new OpenAPIRegistry();
    extendZodWithOpenApi(z);
  }

  generateOpenApiDocument(title?: string) {
    const generator = new OpenApiGeneratorV3(this.registry.definitions);
    const openAPIJson = generator.generateDocument({
      openapi: "3.0.0",
      info: {
        title: title || "My API",
        version: packageJson.version || "1.0.0",
      },
    });
    return openAPIJson;
  }

  registerPath(
    path: string,
    method: string,
    schema: RouteSchema<z.ZodAny, z.ZodAny, z.ZodAny, z.ZodAny, z.ZodAny>,
    tags: string[],
  ) {
    const requestConfig: any = {};

    if (schema.request) {
      requestConfig.body = {
        description: "Request body",
        content: {
          "application/json": {
            schema: schema.request,
          },
        },
      };
    }

    if (schema.query) {
      requestConfig.query = schema.query;
    }

    if (schema.params) {
      requestConfig.params = schema.params;
    }

    if (schema.headers) {
      requestConfig.headers = schema.headers;
    }

    this.registry.registerPath({
      method: method as
        | "get"
        | "post"
        | "put"
        | "patch"
        | "delete"
        | "head"
        | "options"
        | "trace",
      path: `${path}`,
      summary: schema.summary || `${method.toUpperCase()} ${path}`,
      ...(schema.description && { description: schema.description }),
      tags: tags,
      request: Object.keys(requestConfig).length > 0 ? requestConfig : undefined,
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
  }
}

const openApiService = new OpenApiService();
export default openApiService;
