import type { z } from "zod";

/**
 * Schema definition for typed routes
 * - request: Optional for GET, HEAD, OPTIONS (methods without body)
 * - response: Always required
 */
export interface RouteSchema<
  TRequest extends z.ZodType = z.ZodAny,
  TResponse extends z.ZodType = z.ZodAny,
  TQuery extends z.ZodType = z.ZodAny,
  TParams extends z.ZodType = z.ZodAny,
  THeaders extends z.ZodType = z.ZodAny,
> {
  request?: TRequest;
  response: TResponse;
  query?: TQuery;
  params?: TParams;
  headers?: THeaders;
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
