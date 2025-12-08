import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import fs from "node:fs";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import type { TagObject } from "openapi3-ts/oas30";

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
        version: "1.0.0",
      },
    });
    // fs.writeFileSync("./openapi.json", JSON.stringify(openAPIJson));
    return openAPIJson;
  }
  registerPath(
    path: string,
    method: string,
    schema: {
      request: z.ZodAny;
      response: z.ZodAny;
      query?: z.ZodAny;
      params?: z.ZodAny;
      headers?: z.ZodAny;
    },
    tags: string[],
  ) {
    //TODO: add glo al types for all schemas
    const requestConfig: any = {
      body: {
        description: "Request body",
        content: {
          "application/json": {
            schema: schema.request,
          },
        },
      },
    };

    // Add query params if provided
    if (schema.query) {
      requestConfig.query = schema.query;
    }

    // Add path params if provided
    if (schema.params) {
      requestConfig.params = schema.params;
    }

    // Add headers if provided
    if (schema.headers) {
      requestConfig.headers = schema.headers;
    }

    this.registry.registerPath({
      method: method as "get" | "post" | "put" | "delete" | "patch",
      path: `${path}`,
      summary: `${method.toUpperCase()} ${path}`,
      tags: tags ? tags : [],
      request: requestConfig,
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
