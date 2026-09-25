/**
 * Allows browsers on your site to PUT files straight into the bucket.
 * Run once per bucket: `pnpm uploads:cors` (reads S3_* and NEXT_PUBLIC_SITE_URL from .env).
 */
import { createHash } from "node:crypto";

import { AwsClient } from "aws4fetch";

async function main() {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // Optional: the variables may come from the shell instead.
    }
  }
  const {
    S3_ENDPOINT,
    S3_BUCKET,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_REGION,
    NEXT_PUBLIC_SITE_URL,
  } = process.env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw new Error("Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY first.");
  }
  const origins = [NEXT_PUBLIC_SITE_URL, "http://localhost:3000"].filter(Boolean) as string[];
  const rules = origins.map((origin) => new URL(origin).origin);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
  <CORSRule>
${rules.map((origin) => `    <AllowedOrigin>${origin}</AllowedOrigin>`).join("\n")}
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>content-type</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>`;

  const client = new AwsClient({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    service: "s3",
    region: S3_REGION || "auto",
  });
  const response = await client.fetch(`${S3_ENDPOINT.replace(/\/$/, "")}/${S3_BUCKET}?cors`, {
    method: "PUT",
    body: xml,
    headers: {
      "content-type": "application/xml",
      "content-md5": createHash("md5").update(xml).digest("base64"),
    },
  });
  if (!response.ok)
    throw new Error(`PutBucketCors failed (${response.status}): ${await response.text()}`);
  console.log(`✔ CORS updated on ${S3_BUCKET} for ${rules.join(", ")}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
