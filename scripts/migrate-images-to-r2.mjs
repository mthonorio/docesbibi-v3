#!/usr/bin/env node
/**
 * Copia as imagens de produto do Supabase Storage antigo para um bucket
 * Cloudflare R2, mantendo o mesmo nome de arquivo (chave `images/<arquivo>`)
 * — assim src/lib/images.ts (r2Image) só precisa trocar o domínio base.
 *
 * Descobre a lista de imagens a partir de:
 *   1. `SELECT DISTINCT image FROM products` no Postgres (requer DATABASE_URL)
 *   2. Lista fixa de banners/categoria que não estão na tabela products
 *      (ver src/constants/products.ts, src/constants/easter.ts, src/app/page.tsx)
 *
 * Uso:
 *   R2_ACCOUNT_ID=xxx \
 *   R2_ACCESS_KEY_ID=xxx \
 *   R2_SECRET_ACCESS_KEY=xxx \
 *   R2_BUCKET_NAME=docesbibi \
 *   DATABASE_URL=postgres://... \
 *   node scripts/migrate-images-to-r2.mjs
 *
 * Requer @aws-sdk/client-s3 (já em devDependencies).
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const EXTRA_IMAGE_FILENAMES = [
  "easter_category.png",
  "banner_easter.png",
  "banner_easter_2.png",
  "ovo_150g (1).png",
  "ovo_duo (1).png",
  "ovo_trio (1).png",
  "ovo_400g (1).png",
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Faltando variável de ambiente: ${name}`);
    process.exit(1);
  }
  return value;
}

const accountId = requiredEnv("R2_ACCOUNT_ID");
const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
const bucketName = requiredEnv("R2_BUCKET_NAME");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

function filenameFromUrl(url) {
  const path = new URL(url).pathname;
  return decodeURIComponent(path.split("/").pop());
}

async function collectImageFilenames() {
  const filenames = new Set(EXTRA_IMAGE_FILENAMES);

  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
    try {
      const result = await pool.query(
        `SELECT DISTINCT image FROM products WHERE image LIKE 'http%'`,
      );
      for (const row of result.rows) {
        filenames.add(filenameFromUrl(row.image));
      }
    } finally {
      await pool.end();
    }
  } else {
    console.warn(
      "DATABASE_URL não definida — migrando só as imagens fixas (banners/categoria), sem consultar a tabela products.",
    );
  }

  return Array.from(filenames);
}

async function migrateOne(filename, sourceBaseUrl) {
  const sourceUrl = `${sourceBaseUrl}/${encodeURIComponent(filename)}`;
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`GET ${sourceUrl} -> ${response.status}`);
  }
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const body = Buffer.from(await response.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: `images/${filename}`,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function main() {
  const sourceBaseUrl = requiredEnv("SOURCE_SUPABASE_STORAGE_URL");
  const filenames = await collectImageFilenames();

  console.log(`Migrando ${filenames.length} imagens para o bucket "${bucketName}"...`);

  let ok = 0;
  let failed = 0;
  for (const filename of filenames) {
    try {
      await migrateOne(filename, sourceBaseUrl);
      console.log(`  ✅ ${filename}`);
      ok++;
    } catch (error) {
      console.error(`  ❌ ${filename}:`, error instanceof Error ? error.message : error);
      failed++;
    }
  }

  console.log(`\nConcluído: ${ok} ok, ${failed} falharam.`);
  if (failed > 0) process.exitCode = 1;
}

main();
