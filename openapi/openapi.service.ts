import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import fs from "node:fs";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

class OpenApiService {
  public readonly registry;
  constructor() {
    this.registry = new OpenAPIRegistry();
    extendZodWithOpenApi(z);
  }
  generateOpenApiDocument() {
    const generator = new OpenApiGeneratorV3(this.registry.definitions);
    const openAPIJson = generator.generateDocument({
      openapi: "3.0.0",
      info: {
        title: "My API",
        version: "1.0.0",
      },
      servers: [{ url: "v1" }],
    });
    // fs.writeFileSync("./openapi.json", JSON.stringify(openAPIJson));
    return openAPIJson;
  }
}
const openApiService = new OpenApiService();
export default openApiService;
