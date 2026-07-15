import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 konfiguratsiyasi.
 * Ulanish satri (DATABASE_URL) endi schema.prisma'da emas, shu yerda —
 * Migrate/CLI buyruqlari uchun. Runtime'da esa lib/db.ts adapter ishlatadi.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
