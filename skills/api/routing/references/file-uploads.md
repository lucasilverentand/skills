# File Uploads

Two strategies for handling file uploads in a Cloudflare Workers API:

1. **Presigned URL** (preferred) — client uploads directly to R2 storage, bypasses the Worker entirely
2. **Server-side upload** — file passes through the Worker (use only when server-side processing is needed)

## Presigned URL pattern (preferred)

Client flow:
1. Client calls `POST /v1/uploads/presigned-url` with `{ filename, contentType }`
2. API validates and returns `{ uploadUrl, key, publicUrl }`
3. Client PUTs the file directly to R2 using `uploadUrl`
4. Client stores `key` / `publicUrl` on the relevant resource

This keeps large files out of Worker memory and avoids CPU time limits.

### Dependencies

```bash
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

R2 is S3-compatible — use the AWS SDK, not a Cloudflare-specific client.

### R2 client setup

```ts
// src/lib/r2.ts
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function createR2Client(env: {
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
}): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function createPresignedUploadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  contentType: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteObject(client: S3Client, bucket: string, key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
```

### Required environment variables

Add to `wrangler.toml` as secrets (not vars):

```
R2_ACCOUNT_ID        — Cloudflare account ID
R2_ACCESS_KEY_ID     — R2 API token access key
R2_SECRET_ACCESS_KEY — R2 API token secret
R2_BUCKET_NAME       — bucket name (var, not secret)
```

Also add the R2 bucket binding for serving private files:

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "my-bucket"
```

### Presigned URL endpoint

```ts
// src/routes/uploads.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createR2Client, createPresignedUploadUrl } from "../lib/r2";
import { nanoid } from "nanoid";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const PresignedUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_CONTENT_TYPES as [string, ...string[]]),
  folder: z.string().optional().default("uploads"),
});

export const uploadsRoute = new Hono()
  .post(
    "/presigned-url",
    authMiddleware(),
    zValidator("json", PresignedUrlSchema),
    async (c) => {
      const { filename, contentType, folder } = c.req.valid("json");
      const user = c.get("user");

      // Build a unique, non-guessable key
      const ext = filename.split(".").pop() ?? "";
      const key = `${folder}/${user.id}/${nanoid(12)}.${ext}`;

      const client = createR2Client(c.env);
      const uploadUrl = await createPresignedUploadUrl(
        client,
        c.env.R2_BUCKET_NAME,
        key,
        contentType,
      );

      const publicUrl = `${c.env.R2_PUBLIC_URL}/${key}`;

      return c.json({ ok: true, data: { uploadUrl, key, publicUrl } });
    },
  );
```

### Client-side upload

```ts
// Client: upload a file using the presigned URL
async function uploadFile(file: File): Promise<{ key: string; publicUrl: string }> {
  // Step 1: get presigned URL
  const { data } = await api.post<{ uploadUrl: string; key: string; publicUrl: string }>(
    "/v1/uploads/presigned-url",
    { filename: file.name, contentType: file.type },
  );

  // Step 2: upload directly to R2
  await fetch(data.uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return { key: data.key, publicUrl: data.publicUrl };
}
```

## Server-side upload (multipart form)

Use when the Worker needs to process the file (resize, validate content, extract metadata). Not suitable for large files — keep under a few MB to avoid hitting Worker memory limits.

```ts
uploadsRoute.post("/", authMiddleware(), async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return c.json({ ok: false, error: { code: "NO_FILE", message: "No file provided" } }, 400);
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return c.json({ ok: false, error: { code: "FILE_TOO_LARGE", message: "File exceeds 10 MB limit" } }, 400);
  }
  if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
    return c.json({ ok: false, error: { code: "INVALID_TYPE", message: "File type not allowed" } }, 400);
  }

  const user = c.get("user");
  const key = `uploads/${user.id}/${nanoid(12)}.${file.name.split(".").pop()}`;

  await c.env.R2_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const publicUrl = `${c.env.R2_PUBLIC_URL}/${key}`;
  return c.json({ ok: true, data: { key, publicUrl } }, 201);
});
```

## Serving private files

Public files are served by R2's custom domain — zero Worker involvement. Private files (user-owned content, access-controlled assets) must go through a Worker that checks auth:

```ts
// Serve private file — Worker checks auth, then streams from R2 binding
uploadsRoute.get("/files/:key{.+}", authMiddleware(), async (c) => {
  const key = c.req.param("key");

  // Prevent path traversal
  if (key.includes("..") || key.startsWith("/")) {
    return c.json({ ok: false, error: { code: "INVALID_KEY", message: "Invalid file key" } }, 400);
  }

  // Check ownership for user-scoped paths
  const user = c.get("user");
  if (key.startsWith("private/") && !key.includes(`/${user.id}/`)) {
    return c.json({ ok: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, 403);
  }

  const object = await c.env.R2_BUCKET.get(key);
  if (!object) return c.json({ ok: false, error: { code: "NOT_FOUND", message: "File not found" } }, 404);

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
  headers.set("Cache-Control", "private, max-age=3600");

  return new Response(object.body, { headers });
});
```

## Security checklist

- **Validate content type** — check against an explicit allowlist, never trust the browser's `Content-Type` header alone
- **Validate key format** — reject keys containing `..` or starting with `/` to prevent path traversal
- **Short presigned URL expiry** — 1 hour is usually enough; don't use 24+ hours
- **Auth on all upload endpoints** — never allow anonymous uploads without rate limiting
- **Size limits** — enforce at the API level before generating a presigned URL; R2 also supports a `Content-Length-Range` condition in the presigned command if you need server-enforced limits
- **Per-user isolation** — include `user.id` in the storage key so users cannot guess or overwrite each other's files

## Folder conventions

Use a consistent key structure to make access control and cleanup predictable:

```
uploads/{userId}/{nanoid}.{ext}          — user-owned, private
assets/public/{nanoid}.{ext}             — public, no auth required
assets/avatars/{userId}/{nanoid}.{ext}   — user avatars, public
```

Public folders are served by R2's custom domain. Private folders go through the Worker auth check.
