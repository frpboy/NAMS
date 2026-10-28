export function resolveDatasourceUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  if (process.env.USE_DIRECT_DATABASE_URL === "true" && directUrl) {
    return directUrl;
  }

  // Prisma Accelerate URLs cannot be passed to the native PostgreSQL adapter.
  // Preserve the existing direct-URL fallback, but fail closed if it is missing.
  if (databaseUrl?.startsWith("prisma+postgres://")) {
    if (directUrl) return directUrl;
    throw new Error("DIRECT_URL is required when DATABASE_URL uses Prisma Accelerate.");
  }

  const connectionString = databaseUrl ?? directUrl;
  if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL must be configured.");
  }
  return connectionString;
}
