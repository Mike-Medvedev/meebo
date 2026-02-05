import type { z } from "zod";

/**
 * Context provided to error formatters
 */
export interface MeeboErrorContext {
  type: "request" | "response" | "params" | "query" | "headers";
  method: string;
  path: string;
  zodError: z.ZodError;
}

/**
 * Function type for custom error formatters
 */
export type ErrorFormatter = (context: MeeboErrorContext) => Record<string, unknown>;

/**
 * Configuration options for meebo
 */
export interface MeeboConfig {
  /**
   * Custom error response formatter
   */
  formatError?: ErrorFormatter;

  /**
   * Whether to validate responses (default: true)
   */
  validateResponses?: boolean;

  /**
   * Skip response validation for these status codes
   * Default: [400, 401, 403, 404, 409, 422, 500, 502, 503]
   */
  skipResponseValidationForStatus?: number[];
}

let globalConfig: MeeboConfig = {};

/**
 * Configure meebo globally
 * @example
 * configureMeebo({
 *   formatError: (ctx) => ({
 *     success: false,
 *     error: ctx.type + " validation failed",
 *     details: ctx.zodError.errors
 *   }),
 *   skipResponseValidationForStatus: [400, 401, 403, 404, 500]
 * });
 */
export function configureMeebo(config: MeeboConfig): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get the current configuration
 */
export function getConfig(): MeeboConfig {
  return globalConfig;
}

/**
 * Reset configuration to defaults (useful for testing)
 */
export function resetConfig(): void {
  globalConfig = {};
}

/**
 * Get the error formatter (custom or default)
 */
export function getErrorFormatter(): ErrorFormatter {
  return globalConfig.formatError ?? defaultErrorFormatter;
}

/**
 * Check if response validation should run for a given status code
 */
export function shouldValidateResponse(statusCode: number): boolean {
  if (globalConfig.validateResponses === false) return false;

  const skipCodes = globalConfig.skipResponseValidationForStatus ?? [
    400, 401, 403, 404, 409, 422, 500, 502, 503,
  ];

  return !skipCodes.includes(statusCode);
}

/**
 * Default error formatter
 */
function defaultErrorFormatter(context: MeeboErrorContext): Record<string, unknown> {
  const typeLabel = context.type.charAt(0).toUpperCase() + context.type.slice(1);
  return {
    error: `${typeLabel} validation failed`,
    type: context.type,
    detail: context.zodError.issues,
  };
}
