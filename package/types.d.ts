import "express-serve-static-core";
import "express";
import { RequestHandler } from "express-serve-static-core";
import { z } from "zod";

interface RouteSchema<
  TRequest extends z.ZodType = z.ZodAny,
  TResponse extends z.ZodType = z.ZodAny,
  TQuery extends z.ZodType = z.ZodAny,
  TParams extends z.ZodType = z.ZodAny,
  THeaders extends z.ZodType = z.ZodAny,
> {
  request: TRequest;
  response: TResponse;
  query?: TQuery;
  params?: TParams;
  headers?: THeaders;
}

// Helper type to ensure schema has both required fields
type ValidRouteSchema = {
  request: z.ZodType;
  response: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
  headers?: z.ZodType;
};

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
