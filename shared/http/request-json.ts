export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed (${status})`);
    this.name = "HttpError";
    this.status = status;
  }
}

const DEMO_USER_ID = "local-demo-user";

function withDemoAuth(url: string | URL | Request, init?: RequestInit): RequestInit | undefined {
  const pathname = typeof url === "string" ? url : url instanceof URL ? url.pathname : new URL(url.url).pathname;
  if (!pathname.startsWith("/api/")) return init;

  const headers = new Headers(init?.headers);
  if (!headers.has("oai-authenticated-user-id")) headers.set("oai-authenticated-user-id", DEMO_USER_ID);
  return { ...init, headers };
}

/** Transport only: each feature validates its own response contract. */
export async function requestJson(
  url: string,
  init?: RequestInit,
  transport: typeof fetch = fetch,
): Promise<unknown> {
  const response = await transport(url, withDemoAuth(url, init));
  if (!response.ok) throw new HttpError(response.status);
  return response.json();
}
