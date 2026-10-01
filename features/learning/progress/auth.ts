export function authenticatedUserId(request: Request): string | null {
  const userId = request.headers.get("oai-authenticated-user-id")?.trim();
  if (!userId || userId.length > 256) return null;
  return userId;
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: "Authentication required", code: "UNAUTHENTICATED" }, { status: 401 });
}
