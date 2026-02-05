import type { z } from "zod";

/**
 * Schema definition for typed routes
 * - request: Optional for GET, HEAD, OPTIONS (methods without body)
 * - response: Success response schema (defaults to 200 status code)
 * - responses: Multiple response schemas keyed by HTTP status code
 * - tags: Optional array of tags for OpenAPI grouping
 * - summary: Optional endpoint summary for documentation
 * - description: Optional endpoint description for documentation
 */
export interface RouteSchema<
  TRequest extends z.ZodType = z.ZodAny,
  TResponse extends z.ZodType = z.ZodAny,
  TQuery extends z.ZodType = z.ZodAny,
  TParams extends z.ZodType = z.ZodAny,
  THeaders extends z.ZodType = z.ZodAny,
> {
  request?: TRequest;
  /** Success response schema (registered as 200 status code) */
  response: TResponse;
  /** Multiple response schemas keyed by HTTP status code (for OpenAPI docs) */
  responses?: Record<number, z.ZodType>;
  query?: TQuery;
  params?: TParams;
  headers?: THeaders;
  /** Tags for OpenAPI grouping (overrides router-level tag) */
  tags?: string[];
  /** Endpoint summary for OpenAPI documentation */
  summary?: string;
  /** Endpoint description for OpenAPI documentation */
  description?: string;
}

/**
 * Options for TypedRouter configuration
 */
export interface TypedRouterOptions {
  /** Default tag for all routes in this router */
  tag?: string;
  /** Base path prefix for OpenAPI documentation (e.g., "/api/v1") */
  basePath?: string;
}

/**
 * Standard error response format for all validators
 */
export interface ValidationErrorResponse {
  error: string;
  detail: any;
}

/**
 * HTTP methods supported by TypedRouter
 */
export type HttpMethod = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";
