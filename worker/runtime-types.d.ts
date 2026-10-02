/** Minimal Cloudflare runtime surface used by this project. */
type Fetcher = {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

interface D1Meta {
  duration: number;
  size_after: number;
  rows_read: number;
  rows_written: number;
  last_row_id: number;
  changed_db: boolean;
  changes: number;
  served_by_region?: string;
  served_by_colo?: string;
  served_by_primary?: boolean;
  timings?: { sql_duration_ms: number };
  total_attempts?: number;
}

interface D1Response {
  success: true;
  meta: D1Meta & Record<string, unknown>;
  error?: never;
}

type D1Result<T = unknown> = D1Response & { results: T[] };

interface D1ExecResult {
  count: number;
  duration: number;
}

type D1SessionConstraint = "first-primary" | "first-unconstrained";
type D1SessionBookmark = string;

declare abstract class D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
  withSession(constraintOrBookmark?: D1SessionBookmark | D1SessionConstraint): D1DatabaseSession;
  dump(): Promise<ArrayBuffer>;
}

declare abstract class D1DatabaseSession {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  getBookmark(): D1SessionBookmark | null;
}

declare abstract class D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(columnName: string): Promise<T | null>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(options: { columnNames: true }): Promise<[string[], ...T[]]>;
  raw<T = unknown[]>(options?: { columnNames?: false }): Promise<T[]>;
}

declare module "cloudflare:workers" {
  export const env: Cloudflare.Env;
}
