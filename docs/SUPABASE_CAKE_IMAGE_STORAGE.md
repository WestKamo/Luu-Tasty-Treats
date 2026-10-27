# Luu Tasty Treats — Supabase Storage for cake images

This migration moves **new** cake photograph uploads from Cloudinary to **Supabase Storage only**.

The application's PostgreSQL data remains hosted on Render. Firebase Authentication,
existing role policies, cake customization, cart and PayFast are unchanged. The
existing `POST /api/v1/admin/cakes/{id}/images` endpoint and its JSON success payload
`{ "imageId": "...", "imageUrl": "..." }` remain unchanged.

## One-time setup (Supabase Dashboard)

1. Open **Storage** in your Supabase project.
2. Create a bucket with ID **`cake-images`**.
3. Set the bucket **Public**; this is a public product catalogue, not a private-files bucket.
4. Allow only **image/jpeg**, **image/png**, **image/webp**, with a **5 MB** file-size limit.
5. Go to **Project Settings > API Keys**. Create/select a backend-only **secret key**
   (it starts with `sb_secret_`). Never use a publishable or anon key for backend
   uploads, and never put a secret key in the browser or GitHub.
6. Note the project URL shown in Supabase, e.g. `https://PROJECT_REF.supabase.co`.

A public bucket makes photos readable without login, but uploading and deleting are
still performed *only by the .NET backend* after its existing Firebase / PostgreSQL
`SuperAdminOnly` policy authorizes the request. The server's secret key bypasses
Supabase RLS; it must stay private.

## Required Render backend environment variables

In the **Luu-Tasty-Treats_api** web service > Environment, add:

| Key | Example / meaning |
|-----|-------------------|
| `SUPABASE_URL` | `https://PROJECT_REF.supabase.co` |
| `SUPABASE_SECRET_KEY` | Your actual **private** `sb_secret_...` key |
| `SUPABASE_STORAGE_BUCKET` | `cake-images` |

The new handler also supports `SUPABASE_SERVICE_ROLE_KEY` containing the legacy JWT
service-role key as a fallback, but the new `SUPABASE_SECRET_KEY` is preferred.
Do not paste secret values in chats, issues, commits, screenshots or Vercel.

**Do not merge/deploy the backend storage switch until this bucket and all variables
have been configured.** Changing Render environment variables and merging the PR
may each start a deployment.

## Verification

1. Check Render deployment status is **Live**.
2. Log in using the existing Firebase-enabled **SuperAdmin** account.
3. Admin > Catalog > open an existing inactive cake, then add a JPG/PNG/WebP photo.
4. Confirm the response is HTTP 200 and the image loads at
   `https://PROJECT_REF.supabase.co/storage/v1/object/public/cake-images/cakes/...`.
5. Confirm both the Admin gallery and public cake cards display it.
6. Delete an image in Admin and verify its object is removed in Supabase.
7. Run `dotnet build LuuTastyTreats.sln` and `cd frontend && npm run build`
   in a provisioned build environment before merging.

## Compatibility

- Existing `https://res.cloudinary.com/...` images remain usable; there is **no**
  automatic migration, re-upload, or database rewrite for those images.
- Existing local `/uploads/...` links still depend on Render ephemeral filesystem
  availability; re-upload the original photos to Supabase if those links are broken.
- The public frontend uses native `<img>` components for photos and needs **no**
  Supabase key or Next.js `remotePatterns` change. Only HTTPS public image URLs
  are stored in the existing catalog tables.
- This service does **not** replace the application's Render PostgreSQL database.
- Invalid/missing Supabase settings or an unauthorized/private bucket will result in
  a clear Admin upload error; the provider's HTTP status and error reason appear in
  Render logs without exposing the key.
- After rollout, remove the old Cloudinary configuration from Render only if no
  other backend features use it, and rotate any credentials previously exposed.
