import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface IRouterMatcher<
    T,
    Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,
  > {
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
}
