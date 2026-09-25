# uploads

Files go straight from the browser to your bucket — never through your server — with a
progress bar per file.

- **Any S3-compatible storage**: AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces, Backblaze B2.
  Signing uses [aws4fetch](https://github.com/mhart/aws4fetch) (a few KB, no AWS SDK).
- **Private by default**: `/api/uploads/[id]` checks ownership, then redirects to a 5-minute
  signed URL. Only raster images, PDFs, plain text and common audio/video render inline;
  everything else downloads, so an uploaded SVG or HTML file can't run script on your origin.
- **Verified**: an upload is `pending` until the server confirms the object exists with the
  announced size; mismatches are deleted. `sweepPendingUploads()` clears abandoned ones.
- **`<FileUploader />`**: drop, click or **paste** (screenshots straight from the clipboard),
  3 files in parallel, cancel per file.
- **`/files`** in the dashboard: previews, sizes, delete.
- **Development without a bucket**: files are stored in `.site/dev/uploads` and uploaded to the
  app itself, through the same code path.

## Setup

1. Create a private bucket (e.g. R2: dashboard → R2 → Create bucket).
2. Create an access key with object read/write on it and set the `S3_*` variables.
3. Allow uploads from your site: `pnpm uploads:cors` (uses `NEXT_PUBLIC_SITE_URL`).

The CSP gets the `S3_ENDPOINT` origin at build time, so set it in the build environment too.

## Environment

| Variable               | Required   | Description                                                                             |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `S3_ENDPOINT`          | production | e.g. `https://<account>.r2.cloudflarestorage.com`, `https://s3.eu-west-1.amazonaws.com` |
| `S3_REGION`            | no         | `auto` (R2, default) or the bucket's region                                             |
| `S3_BUCKET`            | production | Bucket name                                                                             |
| `S3_ACCESS_KEY_ID`     | production | Access key                                                                              |
| `S3_SECRET_ACCESS_KEY` | production | Secret key                                                                              |

## Usage

```tsx
import { FileUploader } from "@/components/uploads/file-uploader";

<FileUploader accept={["image/*"]} maxSizeMb={5} />;
```

The server enforces `site.config.ts → uploads` (`maxSizeMb`, `accept`, `maxFilesPerUser`)
regardless of the props. Read files with `listUploads(userId)` / `getUpload(userId, id)`, and
link to `/api/uploads/<id>`.

## Customization

- Attach uploads to your own records: store the upload `id` on them.
- Public assets (avatars, product images): make a public bucket or custom domain and build URLs
  from the `key` instead of going through `/api/uploads/[id]`.
- Image processing: run it after `completeUpload()` or with your storage provider's transforms.

## Removal

`pnpm site remove uploads`. Files stay in the bucket; drop the `upload` table in a migration.
