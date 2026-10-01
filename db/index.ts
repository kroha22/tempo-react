import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure local D1 in vite.config.ts, or a separate authenticated deployment with its own database."
    );
  }

  return drizzle(env.DB, { schema });
}
