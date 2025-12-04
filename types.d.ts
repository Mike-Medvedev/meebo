import "express-serve-static-core";
import { z } from "zod";

interface RouteSchema<TRequest extends z.ZodType, TResponse extends z.ZodType> {
  request: TRequest;
  response: TResponse;
}

export type TypedRequestHandler<
  TRequest extends z.ZodType, // ← Accepts the Zod schema TYPE
  TResponse extends z.ZodType, // ← Accepts the Zod schema TYPE
  Route extends string = string,
> = RequestHandler<
  RouteParameters<Route>,
  z.infer<TResponse>, // ← Does the inference for you
  z.infer<TRequest>,
  ParsedQs,
  Record<string, any>
>;

declare module "express-serve-static-core" {
  interface IRouterMatcher<
    T,
    Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,
  > {
    <
      Route extends string,
      P = RouteParameters<Route>,
      TRequest extends z.ZodType,
      TResponse extends z.ZodType,
      ReqBody = z.infer<TRequest>,
      ResBody = z.infer<TResponse>,
      ReqQuery = ParsedQs,
      LocalsObj extends Record<string, any> = Record<string, any>,
    >(
      // (it's used as the default type parameter for P)
      path: Route,
      schema: RouteSchema<TRequest, TResponse>,
      // (This generic is meant to be passed explicitly.)
      ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
  }
}
interface a {
  <
    Route extends string,
    P = RouteParameters<Route>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
  >(
    // (it's used as the default type parameter for P)
    path: Route,
    // (This generic is meant to be passed explicitly.)
    ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
  ): T;
  <
    Path extends string,
    P = RouteParameters<Path>,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
  >(
    // (it's used as the default type parameter for P)
    path: Path,
    // (This generic is meant to be passed explicitly.)
    ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
  ): T;
  <
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
  >(
    path: PathParams,
    // (This generic is meant to be passed explicitly.)
    ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
  ): T;
  <
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
  >(
    path: PathParams,
    // (This generic is meant to be passed explicitly.)
    ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
  ): T;
  (path: PathParams, subApplication: Application): T;
}
