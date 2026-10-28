import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error("Set DIRECT_URL or DATABASE_URL before invoking the Prisma CLI.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prefer the direct connection for schema/migration operations when configured.
    url: datasourceUrl,
  },
});
