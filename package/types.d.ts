import type { Router } from "express";
import type { RequestHandler, PathParams } from "express-serve-static-core";
import type { z } from "zod";
import type { RouteSchema } from "./shared.ts";

/**
 * Schema-aware router method signature
 * Requires a schema object as the second parameter before handlers
 */
export interface TypedRouterMatcher<T> {
  <
    Route extends string,
    TRequest extends z.ZodType = z.ZodAny,
    TResponse extends z.ZodType = z.ZodAny,
    TQuery extends z.ZodType = z.ZodAny,
    TParams extends z.ZodType = z.ZodAny,
    THeaders extends z.ZodType = z.ZodAny,
    ReqBody = z.infer<TRequest>,
    ResBody = z.infer<TResponse>,
    ReqQuery = z.infer<TQuery>,
    ReqParams = z.infer<TParams>,
    LocalsObj extends Record<string, any> = Record<string, any>,
  >(
    path: Route,
    schema: RouteSchema<TRequest, TResponse, TQuery, TParams, THeaders>,
    ...handlers: Array<RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery, LocalsObj>>
  ): T;

  <
    TRequest extends z.ZodType = z.ZodAny,
    TResponse extends z.ZodType = z.ZodAny,
    TQuery extends z.ZodType = z.ZodAny,
    TParams extends z.ZodType = z.ZodAny,
    THeaders extends z.ZodType = z.ZodAny,
    ReqBody = z.infer<TRequest>,
    ResBody = z.infer<TResponse>,
    ReqQuery = z.infer<TQuery>,
    ReqParams = z.infer<TParams>,
    LocalsObj extends Record<string, any> = Record<string, any>,
  >(
    path: PathParams,
    schema: RouteSchema<TRequest, TResponse, TQuery, TParams, THeaders>,
    ...handlers: Array<RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery, LocalsObj>>
  ): T;
}

/**
 * Extended router type with schema-aware HTTP methods
 * All HTTP methods require a RouteSchema as the second parameter
 */
export interface TypedRouterInstance extends Router {
  all: TypedRouterMatcher<this>;
  get: TypedRouterMatcher<this>;
  post: TypedRouterMatcher<this>;
  put: TypedRouterMatcher<this>;
  delete: TypedRouterMatcher<this>;
  patch: TypedRouterMatcher<this>;
  options: TypedRouterMatcher<this>;
  head: TypedRouterMatcher<this>;
}
