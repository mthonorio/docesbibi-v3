import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Image } from "@/lib/images";

/**
 * Mesmo padrão de cliente S3 do scripts/migrate-images-to-r2.mjs (bucket
 * R2 é compatível com S3) — mas usado em runtime pela rota de upload do
 * painel, não só pelo script de migração pontual.
 */
function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 não configurado — defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const ALLOWED_IMAGE_TYPES = Object.keys(EXTENSION_BY_MIME);
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Sobe uma imagem de produto pro bucket R2 (mesma chave `images/<arquivo>`
 * usada pelas imagens migradas do Supabase — ver src/lib/images.ts) e
 * devolve a URL pública final, pronta pra ser salva em `products.image`.
 * Nome do arquivo é gerado (UUID + extensão pelo content-type), nunca o
 * nome original enviado pelo navegador.
 */
export async function uploadProductImage(
  body: Buffer,
  contentType: string,
): Promise<string> {
  const extension = EXTENSION_BY_MIME[contentType];
  if (!extension) {
    throw new Error("Formato de imagem não suportado (use JPEG, PNG, WEBP ou GIF)");
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME não configurada");
  }

  const filename = `${randomUUID()}.${extension}`;
  const s3 = getR2Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: `images/${filename}`,
      Body: body,
      ContentType: contentType,
    }),
  );

  return r2Image(filename);
}
