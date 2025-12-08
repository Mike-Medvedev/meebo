/**
 * Infers a Zod schema shape from a payload for error messages
 */
export function inferZodShape(payload: any): string {
  if (payload === null) return "z.null()";
  if (payload === undefined) return "z.undefined()";

  const type = typeof payload;

  if (type === "string") return "z.string()";
  if (type === "number") return "z.number()";
  if (type === "boolean") return "z.boolean()";

  if (Array.isArray(payload)) {
    if (payload.length === 0) return "z.array(z.unknown())";
    return `z.array(${inferZodShape(payload[0])})`;
  }

  if (type === "object") {
    const shape: Record<string, string> = {};
    for (const [key, value] of Object.entries(payload)) {
      shape[key] = inferZodShape(value);
    }
    const shapeStr = Object.entries(shape)
      .map(([k, v]) => `    ${k}: ${v}`)
      .join(",\n");
    return `z.object({\n${shapeStr}\n  })`;
  }

  return "z.unknown()";
}

/**
 * Generates helpful error message suggesting union types for response validation failures
 */
export function generateUnionSuggestion(payload: any, method: string, path: string): string {
  const receivedShape = inferZodShape(payload);

  return `
❌ Response validation failed for ${method} ${path}

The response payload doesn't match your responseSchema.

📦 Received: ${JSON.stringify(payload, null, 2)}

💡 Fix: Add this shape to your responseSchema using z.union():

response: z.union([
  YourCurrentResponseSchema,
  ${receivedShape}
])
`;
}
