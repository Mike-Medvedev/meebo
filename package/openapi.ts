import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import type { RouteSchema } from "./shared.ts";
import packageJson from "../package.json" with { type: "json" };

/**
 * Default descriptions for common HTTP status codes
 */
const STATUS_CODE_DESCRIPTIONS: Record<number, string> = {
  200: "Success",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

function getDescriptionForCode(code: number): string {
  return STATUS_CODE_DESCRIPTIONS[code] || "Response";
}

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

    // Build responses object
    const responses: Record<number, any> = {};

    // Handle single response (backward compatible, registered as 200)
    if (schema.response) {
      responses[200] = {
        description: getDescriptionForCode(200),
        content: {
          "application/json": {
            schema: schema.response,
          },
        },
      };
    }

    // Handle multiple responses (can override the 200 from above)
    if (schema.responses) {
      for (const [code, zodSchema] of Object.entries(schema.responses)) {
        const statusCode = Number(code);
        responses[statusCode] = {
          description: getDescriptionForCode(statusCode),
          content: {
            "application/json": {
              schema: zodSchema,
            },
          },
        };
      }
    }

    this.registry.registerPath({
      method: method as "get" | "post" | "put" | "patch" | "delete" | "head" | "options" | "trace",
      path: `${path}`,
      summary: schema.summary || `${method.toUpperCase()} ${path}`,
      ...(schema.description && { description: schema.description }),
      tags: tags,
      request: Object.keys(requestConfig).length > 0 ? requestConfig : undefined,
      responses,
    });
  }
}

const openApiService = new OpenApiService();
export default openApiService;
