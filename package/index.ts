export { TypedRouter, typedHandler } from "./TypedRouter.ts";
export { swagger } from "./swagger.ts";

/**
 * Modular Architeture for Typed Express Router
 *
 * Typescript Declarations to add Zod Schema to end points
 * Router Definition
 *  Typescript Compiletime validation on endpoints
 *  Runtime Schema Validation on endpoints
 * Swagger OpenAPI Registry
 *  Register Paths
 *  Register Schemas
 *  Generate OpenAPI Document
 *  Serve openApi.json from express app
 *  Fetch and serve swagger UI from /docs
 */
