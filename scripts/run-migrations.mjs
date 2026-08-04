import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { Client } from "pg";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
config({ path: path.join(rootDir, ".env.local") });

const rawConnectionString = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;

if (!rawConnectionString) {
  console.error("POSTGRES_URL_NON_POOLING (or POSTGRES_URL) is not set. Run `vercel env pull` first.");
  process.exit(1);
}

// Strip sslmode from the URL so it doesn't override the explicit `ssl` option below
// (newer pg-connection-string treats sslmode=require as verify-full, which fails
// against Supabase's pooler cert chain in this environment).
const connectionUrl = new URL(rawConnectionString);
connectionUrl.searchParams.delete("sslmode");
const connectionString = connectionUrl.toString();

const migrationsDir = path.join(rootDir, "supabase", "migrations");
const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    console.log(`Applying ${file}...`);
    await client.query(sql);
    console.log(`Applied ${file}`);
  }
} finally {
  await client.end();
}
