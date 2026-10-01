export function objectResponse(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Invalid API response");
  return value as Record<string, unknown>;
}

export function arrayResponse(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Invalid API list");
  return value;
}

export function stringField(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid API field");
  return value;
}

export function numberField(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid API number");
  return value;
}
