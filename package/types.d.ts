import "express-serve-static-core";
import "express";
import type {
  RequestHandler,
  RequestHandlerParams,
  RouteParameters,
  PathParams,
  ParamsDictionary,
} from "express-serve-static-core";
import type { ParsedQs } from "qs";
import type { z } from "zod";
import type { RouteSchema } from "./shared.ts";

declare module "express-serve-static-core" {
  interface IRouterMatcher<
    T,
    Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,
  > {
    <
      Route extends string,
      P = RouteParameters<Route>,
      TRequest extends z.ZodType = z.ZodAny,
      TResponse extends z.ZodType = z.ZodAny,
      TQuery extends z.ZodType = z.ZodAny,
      TParams extends z.ZodType = z.ZodAny,
      THeaders extends z.ZodType = z.ZodAny,
      ReqBody = z.infer<TRequest>,
      ResBody = z.infer<TResponse>,
      ReqQuery = ParsedQs,
      LocalsObj extends Record<string, any> = Record<string, any>,
    >(
      path: Route,
      schema: RouteSchema<TRequest, TResponse, TQuery, TParams, THeaders>,
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;

    <
      Path extends string,
      P = RouteParameters<Path>,
      TRequest extends z.ZodType = z.ZodAny,
      TResponse extends z.ZodType = z.ZodAny,
      TQuery extends z.ZodType = z.ZodAny,
      TParams extends z.ZodType = z.ZodAny,
      THeaders extends z.ZodType = z.ZodAny,
      ReqBody = z.infer<TRequest>,
      ResBody = z.infer<TResponse>,
      ReqQuery = ParsedQs,
      LocalsObj extends Record<string, any> = Record<string, any>,
    >(
      path: Path,
      schema: RouteSchema<TRequest, TResponse, TQuery, TParams, THeaders>,
      ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;

    <
      P = ParamsDictionary,
      TRequest extends z.ZodType = z.ZodAny,
      TResponse extends z.ZodType = z.ZodAny,
      TQuery extends z.ZodType = z.ZodAny,
      TParams extends z.ZodType = z.ZodAny,
      THeaders extends z.ZodType = z.ZodAny,
      ReqBody = z.infer<TRequest>,
      ResBody = z.infer<TResponse>,
      ReqQuery = ParsedQs,
      LocalsObj extends Record<string, any> = Record<string, any>,
    >(
      path: PathParams,
      schema: RouteSchema<TRequest, TResponse, TQuery, TParams, THeaders>,
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;

    <
      P = ParamsDictionary,
      TRequest extends z.ZodType = z.ZodAny,
      TResponse extends z.ZodType = z.ZodAny,
      TQuery extends z.ZodType = z.ZodAny,
      TParams extends z.ZodType = z.ZodAny,
      THeaders extends z.ZodType = z.ZodAny,
      ReqBody = z.infer<TRequest>,
      ResBody = z.infer<TResponse>,
      ReqQuery = ParsedQs,
      LocalsObj extends Record<string, any> = Record<string, any>,
    >(
      path: PathParams,
      schema: RouteSchema<TRequest, TResponse, TQuery, TParams, THeaders>,
      ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
  }
}
