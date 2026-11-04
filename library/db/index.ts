import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set to connect to the library database.");
}

export const sql = postgres(databaseUrl, { ssl: "require" });
