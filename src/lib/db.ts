import { PrismaClient } from "@prisma/client";

const resolveDatasourceUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  // Explicit override for local debugging/tools.
  if (process.env.USE_DIRECT_DATABASE_URL === "true" && directUrl) {
    return directUrl;
  }

  // If DATABASE_URL is an Accelerate URL, prefer DIRECT_URL for stable schema parity.
  if (databaseUrl?.startsWith("prisma+postgres://") && directUrl) {
    return directUrl;
  }

  return databaseUrl ?? directUrl;
};

const createPrismaClient = () =>
  new PrismaClient({
    datasourceUrl: resolveDatasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: ExtendedPrismaClient;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
