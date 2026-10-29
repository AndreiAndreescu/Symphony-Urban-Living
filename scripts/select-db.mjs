// Chooses the Prisma database provider from DATABASE_URL, so switching from the
// local SQLite file to a hosted Postgres database is a single env var change.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file) && typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(file);
    } catch {
      /* ignore malformed env file; Prisma will report missing vars */
    }
  }
}

const url = process.env.DATABASE_URL ?? "";
if (!url) {
  console.error(
    "\n✖ DATABASE_URL is not set.\n  Copy .env.example to .env (local) or add it in Netlify → Project configuration → Environment variables.\n",
  );
  process.exit(1);
}

const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : url.startsWith("file:") ? "sqlite" : null;
if (!provider) {
  console.error(`\n✖ DATABASE_URL must start with "file:" (SQLite) or "postgresql://" (Postgres).\n`);
  process.exit(1);
}

// Deploy builds (netlify.toml) pass --require-postgres: serverless functions have a
// throw-away filesystem, so a SQLite file would lose every reservation.
if (process.argv.includes("--require-postgres") && provider !== "postgresql") {
  console.error(
    "\n✖ This deploy needs a hosted Postgres database (Neon or Supabase).\n  Set DATABASE_URL to a postgresql:// connection string in Netlify → Project configuration → Environment variables.\n",
  );
  process.exit(1);
}

const schemaPath = resolve("prisma/schema.prisma");
const schema = readFileSync(schemaPath, "utf8");
const next = schema.replace(
  /(datasource db \{[^}]*?provider\s*=\s*)"(sqlite|postgresql)"/,
  `$1"${provider}"`,
);

if (next !== schema) {
  writeFileSync(schemaPath, next);
  console.log(`• Database provider set to ${provider}`);
} else {
  console.log(`• Database provider: ${provider}`);
}
