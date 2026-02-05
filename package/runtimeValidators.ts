import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ValidationErrorResponse } from "./shared.ts";
import { generateUnionSuggestion } from "./errorHelpers.ts";

export function validateRequest(requestSchema: z.ZodType) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { data, error } = requestSchema.safeParse(req.body);
    if (error) {
      (res as any)._isValidationError = true;
      const errorResponse: ValidationErrorResponse = {
        error: "Request validation failed",
        detail: z.treeifyError(error),
      };
      return res.status(422).json(errorResponse);
    }
    req.body = data;
    next();
  };
}

/**
 * Validates response payload against schema(s)
 * @param responseSchemas - Single schema or record of schemas by status code
 */
export function validateResponse(
  responseSchemas: z.ZodType | Record<number, z.ZodType>,
) {
  return function (req: Request, res: Response, next: NextFunction) {
    const originalRes = res.json;
    res.json = function (payload) {
      if ((this as any)._isValidationError) {
        return originalRes.call(this, payload);
      }

      // Pick schema based on status code
      let schema: z.ZodType | undefined;
      if (responseSchemas instanceof z.ZodType) {
        // Single schema (backward compatible)
        schema = responseSchemas;
      } else {
        // Multiple schemas by status code
        const statusCode = this.statusCode || 200;
        schema = responseSchemas[statusCode];

        // If no schema for this status code, skip validation
        if (!schema) {
          return originalRes.call(this, payload);
        }
      }

      const { data, error } = schema.safeParse(payload);
      if (error) {
        const helpfulError = generateUnionSuggestion(
          payload,
          req.method,
          req.path || req.url || "unknown",
        );

        console.error(helpfulError);
        console.error("Validation errors:", error.message);

        (this as any)._isValidationError = true;

        const errorResponse: ValidationErrorResponse = {
          error: "Response validation failed - API contract violation",
          detail: z.treeifyError(error),
        };

        return originalRes.call(res.status(500), errorResponse);
      }
      return originalRes.call(this, data);
    };
    next();
  };
}

export function validateHeaders(headersSchema: z.ZodType) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = headersSchema.safeParse(req.headers);
    if (error) {
      (res as any)._isValidationError = true;
      const errorResponse: ValidationErrorResponse = {
        error: "Headers validation failed",
        detail: z.treeifyError(error),
      };
      return res.status(422).json(errorResponse);
    }
    next();
  };
}

export function validateQuery(querySchema: z.ZodType) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = querySchema.safeParse(req.query);
    if (error) {
      (res as any)._isValidationError = true;
      const errorResponse: ValidationErrorResponse = {
        error: "Query parameters validation failed",
        detail: z.treeifyError(error),
      };
      return res.status(422).json(errorResponse);
    }
    next();
  };
}

export function validateParams(paramsSchema: z.ZodType) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = paramsSchema.safeParse(req.params);
    if (error) {
      (res as any)._isValidationError = true;
      const errorResponse: ValidationErrorResponse = {
        error: "Path parameters validation failed",
        detail: z.treeifyError(error),
      };
      return res.status(422).json(errorResponse);
    }
    next();
  };
}
