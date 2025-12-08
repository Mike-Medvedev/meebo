import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Router,
  IRouterMatcher,
  Application,
} from "express";
import { z } from "zod";

//TODO: HANDLE STRICT MODE for requiring schema

export function validateRequest(requestSchema: z.ZodAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { data, error } = requestSchema.safeParse(req.body);
    if (error) {
      return res.status(422).json({ detail: z.treeifyError(error) });
    }
    req.body = data;
    next();
  };
}

export function validateResponse(responseSchema: z.ZodAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    const originalRes = res.json;
    res.json = function (payload) {
      const { data, error } = responseSchema.safeParse(payload);
      if (error) {
        console.log(error);
        return originalRes.call(res.status(422), {
          detail: z.treeifyError(error),
        });
      }
      return originalRes.call(this, data);
    };
    next();
  };
}

export function validateHeaders(headersSchema: z.ZodAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = headersSchema.safeParse(req.headers);
    if (error) {
      return res.status(422).json({ detail: z.treeifyError(error) });
    }
    next();
  };
}

export function validateQuery(querySchema: z.ZodAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { data, error } = querySchema.safeParse(req.query);
    if (error) {
      return res.status(422).json({ detail: z.treeifyError(error) });
    }
    req.query = data as typeof req.query;
    next();
  };
}

export function validateParams(paramsSchema: z.ZodAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { data, error } = paramsSchema.safeParse(req.params);
    if (error) {
      return res.status(422).json({ detail: z.treeifyError(error) });
    }
    req.params = data as typeof req.params;
    next();
  };
}
