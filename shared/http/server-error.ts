/** Never serialize database exceptions: they may contain SQL, bindings or identities. */
export function internalErrorResponse(operation: string) {
  console.error(`[api] ${operation} failed`);
  return Response.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
}
