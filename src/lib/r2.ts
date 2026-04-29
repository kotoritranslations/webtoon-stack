//src/lib/r2.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuración de R2
const R2_CONFIG = {
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucket: process.env.R2_BUCKET!,
  publicUrl: process.env.R2_PUBLIC_URL!,
};

// Cliente S3 configurado para Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_CONFIG.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
});

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Sube un archivo a Cloudflare R2
 * @deprecated Usar generatePresignedUploadUrl para subidas desde el cliente
 * sin pasar por el servidor. Mantener solo para subidas server-side pequeñas
 * (ej. thumbnails generados en el server, avatares, etc.)
 */
export async function uploadToR2(
  file: File | Buffer,
  key: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    let buffer: Buffer;
    let type: string;

    if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
      type = file.type || contentType || "application/octet-stream";
    } else {
      buffer = file;
      type = contentType || "application/octet-stream";
    }

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
      Body: buffer,
      ContentType: type,
    });

    await r2Client.send(command);

    return {
      success: true,
      url: `${R2_CONFIG.publicUrl}/${key}`,
      key,
    };
  } catch (error: any) {
    console.error("Error en uploadToR2:", error.message);
    return { success: false, error: error.message || "Upload failed" };
  }
}

/**
 * Genera una URL firmada para que el CLIENTE suba directamente a R2.
 * El servidor nunca toca el binario del archivo.
 *
 * @param key         - ruta del objeto en el bucket
 * @param contentType - MIME type del archivo
 * @param expiresIn   - segundos hasta expiración (default 15 min)
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 60 * 15
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_CONFIG.bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * @deprecated Usar generatePresignedUploadUrl
 * Alias para no romper código existente que use generateUploadUrl
 */
export const generateUploadUrl = (key: string, contentType: string) =>
  generatePresignedUploadUrl(key, contentType, 3600);

/**
 * Verifica si un objeto existe en R2 usando HeadObject.
 * No descarga el archivo — muy barato en términos de costo y latencia.
 * Útil para confirmar que el cliente terminó su PUT antes de actualizar la DB.
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
  try {
    await r2Client.send(
      new HeadObjectCommand({ Bucket: R2_CONFIG.bucket, Key: key })
    );
    return true;
  } catch (err: any) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err; // error inesperado — propagar
  }
}

/**
 * Elimina un archivo de Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({ Bucket: R2_CONFIG.bucket, Key: key })
    );
    return true;
  } catch (error) {
    console.error("Error deleting from R2:", error);
    return false;
  }
}

/**
 * Genera claves únicas para archivos
 */
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = filename.split(".").pop();
  return `${prefix}/${timestamp}-${random}.${extension}`;
}

/**
 * Extrae la key de una URL de R2
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    return new URL(url).pathname.substring(1);
  } catch {
    console.error("Error extracting key from URL:", url);
    return null;
  }
}

/**
 * Elimina múltiples archivos de R2
 */
export async function deleteMultipleFromR2(
  keys: string[]
): Promise<{ key: string; success: boolean }[]> {
  const results = await Promise.allSettled(
    keys.map(async (key) => ({ key, success: await deleteFromR2(key) }))
  );

  return results.map((result, index) => ({
    key: keys[index],
    success: result.status === "fulfilled" ? result.value.success : false,
  }));
}

/**
 * Elimina archivos de R2 usando URLs completas
 */
export async function deleteFromR2ByUrls(urls: string[]): Promise<boolean[]> {
  const keys = urls
    .map((url) => extractKeyFromUrl(url))
    .filter((key): key is string => key !== null);

  if (keys.length === 0) return [];

  const results = await deleteMultipleFromR2(keys);
  return results.map((r) => r.success);
}