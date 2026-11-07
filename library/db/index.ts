import postgres from "postgres";
import type { Sql } from "postgres";

let client: Sql | undefined;

export function getSql(): Sql {
  if (client) {
    return client;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL must be set to connect to the library database.");
  }

  client = postgres(databaseUrl, { ssl: "require" });
  return client;
}
