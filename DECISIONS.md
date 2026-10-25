# Luu Tasty Treats — Architecture & Cleanup Decisions

Date: 2026-10-25  
Phase: **0 — audit, consolidation, and build verification**  
Source: uploaded `Luu-Tasty-Treats-main.zip`.

## Scope / constraints

- Phase 0 only: preserve all working business logic; **do not migrate Firebase auth**, connect Render/Vercel, or wire the Spline component into the live login routes yet.
- Payments (PayFast webhook and initiation), order placement/server-side price calculations, and catalog customization code must remain byte-for-byte unchanged.
- Preserve the existing `app/owner/page.tsx`.
- The user approved deletion of nine named orphaned/duplicate files plus the root `package.json`, conditional on checking its references.
- Both original Spline files were inspected and made available in `/mnt/data/SplineScene_original_side_by_side.html` **before either was changed/deleted**. Findings and replacement decision documented below.

## Canonical files retained and why

| File | Reason |
| --- | --- |
| `frontend/src/components/layout/Navbar.tsx` | Imported by active `app/layout.tsx`. |
| `frontend/src/store/authStore.ts` | Imported by live app routes, navbar, API client, and SignalR. |
| `frontend/src/components/admin/RequireAdmin.tsx` | Referenced by live admin dashboard/catalog pages. |
| `frontend/src/app/auth/page.tsx` | Actual customer auth route; retained unchanged for Phase 1. **KNOWN DEFECT** detailed below. |
| `frontend/src/app/admin/login/page.tsx` | Actual administrator login route. |
| `frontend/package.json` | Only manifest with Next.js, Spline, npm dev/build/start/lint scripts. |
| `frontend/src/components/auth/SplineScene.tsx` | Canonical Spline location; implementation replaced with safer `next/dynamic` client-only loading and a persistent CSS fallback. Currently not imported by live routes; Phase 2 will wire it to both auth experiences. |
| `frontend/src/app/owner/page.tsx` | Intentional artisan content; must not change. |
| `src/LuuTastyTreats.Api/Modules/Payments/Features/PayFastWebhook/PayFastWebhookHandler.cs` | Existing payment webhook; protected. |
| `src/LuuTastyTreats.Api/Modules/Payments/Features/CreatePayFastPayment/` | Existing payment initiation handlers/models; protected. |
| `src/LuuTastyTreats.Api/Modules/Orders/` | Order placement and pricing business logic protected. |
| `src/LuuTastyTreats.Api/Modules/Catalog/` | Catalog/customization module protected. |

## Approved removals — performed after reference audit

| Deleted file | Reason |
| --- | --- |
| `frontend/src/stores/auth-store.ts` | Unused duplicate of live `src/store/authStore.ts`. |
| `frontend/src/components/layout/FloatingNavbar.tsx` | Only imported by unused `BakeryShell.tsx`. |
| `frontend/src/components/layout/BakeryShell.tsx` | Unused wrapper; real layout imports `Navbar.tsx`. |
| `frontend/src/components/admin/RequiereAdmin.tsx` | Typo-named duplicate; real routes use `RequireAdmin.tsx`. |
| `frontend/src/components/admin/Requirements.tsx` | Duplicate administrator guard; live routes use `RequireAdmin.tsx`. |
| `frontend/src/components/auth/AuthPage.tsx` | Parallel unused customer auth page, NOT the live `app/auth/page.tsx` route. |
| `frontend/src/components/auth/AuthTabs.tsx` | Used only by the removed parallel `AuthPage.tsx`. |
| `frontend/src/components/auth/AccessGrantedOverlay.tsx` | Used only by the removed parallel `AuthPage.tsx`. |
| `frontend/src/components/customer/CustomCakeModal.tsx` | No references in active source tree. |
| `package.json` (repo root) | No `name` or `scripts`; repo-wide source/config/docs scan found no references to a root manifest or root npm scripts. Build scripts and app dependency manifest reside under `frontend/`. |
| `frontend/src/components/SplineScene.tsx` | Decorative SVG only, not an actual Spline scene and zero live importers. Compared in full against the auth component before removal. |

`package-lock.json` in the repository root was deleted at user request on 2026-10-25 after the root manifest had been removed. `frontend/package-lock.json` remains the canonical lockfile.

## Spline comparison and replacement decision

Original file contents were preserved as a side-by-side HTML comparison artifact, delivered before deleting either file.

| Criterion | `components/SplineScene.tsx` | `components/auth/SplineScene.tsx` (before change) |
| --- | --- | --- |
| Actual Spline runtime | No; inline SVG animation | Yes |
| `next/dynamic(..., { ssr: false })` | No | No |
| `React.lazy` | No | Yes |
| CSS fallback when URL absent | SVG illustration always visible | Yes, dedicated CSS fallback |
| Scene error fallback | N/A (no network scene) | Error boundary can catch render/load exceptions, but not all non-throwing network failures |
| Decision | Delete | Keep location, replace implementation |

The new implementation uses `next/dynamic` with `ssr: false` **inside a client component**, a CSS-only fallback for missing URLs, a fallback overlay until `onLoad` confirms successful scene initialization, and an ErrorBoundary for render/runtime errors. It does not depend on `React.lazy`, does not make a direct/static Spline import, and keeps the scene URL configurable through `NEXT_PUBLIC_SPLINE_SCENE_URL`. Spline is **not yet connected to the live auth pages** (deferred to Phase 2). This is an SSR-boundary mitigation, **not** a guarantee that Turbopack's historical `../libs/draco/draco_decoder.js` packaging issue cannot recur; verify with a real dependency-installed build.

## Important Phase 1 defect: live customer auth is fake

**KNOWN DEFECT — NOT FIXED IN PHASE 0.** In `frontend/src/app/auth/page.tsx`, the live customer login/registration flow uses `setTimeout`, unconditionally reports success, and saves the hardcoded token string `mock-jwt-token-123` instead of authenticating against a real service. Registration likewise simulates success. This is **broken authentication**, not a production-ready auth workflow. Phase 1 migration to Firebase must replace this behavior, rather than preserve it as working auth. This Phase 0 cleanup **does not modify** the live auth page.

## Repository-wide root `package.json` dependency audit

- Root `package.json` includes only eight dependency declarations; has **no `name` field and no `scripts` field**.
- `frontend/package.json` has `name: frontend`, plus `dev`, `build`, `start`, `lint` scripts and Next.js dependencies.
- Inspected tracked source, docs, root Dockerfile, project files, and app configuration, excluding generated `.next` output and generated lockfile data. Only `frontend/README.md` refers to `npm run ...`, documented for the frontend; no source/config refers to root manifest or root scripts.
- Root lockfile's generated project name is `luu-tasty-treats`, but no usable root manifest `name` or scripts exist. Kept root lockfile as noted above.

## Build verification

Build commands to run **after cleanup**:

```sh
cd frontend && npm run build
# repo root
dotnet build LuuTastyTreats.sln
```

See the `PHASE0_BUILD_REPORT.md` written after attempted builds for command results, host/tooling limitations, and any compile findings. A command failure due to missing package manager dependencies or unavailable .NET SDK must **not** be mislabeled as an application compile failure or a successful build.

## Post-cleanup verification outcome (2026-10-25)

Both `npm run build` and `dotnet build LuuTastyTreats.sln` were attempted after cleanup. **Neither completed**: Next.js dependencies are not installed (`next: not found`), and the .NET CLI is absent (`dotnet: command not found`); network access to install them is unavailable. No passing build is claimed. Detailed commands, logs, and follow-up requirements are in `PHASE0_BUILD_REPORT.md`. Source-only syntax and import checks passed (35 frontend source files / 135 import specifiers); SHA-256 checks confirm 64 protected backend files are unchanged.

The original root `.next/` folder is generated **development cache**, not source. It is intentionally excluded from the deliverable ZIP to avoid distributing stale compiled references to files removed during Phase 0; no source code was removed on that basis.

---

## Phase 1 — Firebase Authentication migration (2026-10-25)

**Authorized scope:** Replace old customer/admin JWT flows with Firebase Authentication, keep database roles and policy names, update SignalR tokens, preserve protected payment, pricing and customization code. Remove the orphaned root `package-lock.json` by explicit user approval.

### Decisions and rationale

| Choice / change | Decision and reason |
|---|---|
| Identity issuer | Firebase Auth for all customers, admins, and super-admins. The .NET API only **verifies** Firebase ID tokens using `FirebaseAdmin` 3.7.0; no application JWT issuance. |
| Authorization | Role membership is always read from PostgreSQL `identity.user_roles` / `identity.roles` after verifying a Firebase UID; Firebase custom claims cannot grant admin. Preserve `AdminOrAbove` and `SuperAdminOnly`; add `AnyAuthenticated`. |
| Account linking | Add nullable unique `identity.users.firebase_uid`. First login looks up UID; an existing email record is linked **only if Firebase reports email_verified**. Never overwrite a row bound to another UID. Brand-new users receive Customer only. |
| Existing superadmins | Retain existing Postgres users and SuperAdmin role membership; seed new records from configured `SeedAdmins` email/fullName **without local passwords**, and create Firebase user accounts separately in Firebase Console. Existing password hashes in database remain legacy inert data, pending a later approved data migration. |
| Login endpoints | Delete unused local-admin and customer-login/register HTTP handlers, JWT generator and options. Replace with `GET /api/v1/auth/me` returning verified database profile. Frontend uses Firebase SDK for sign-in, registration, logout. |
| Tokens and session | No persisted token in Zustand/localStorage; `onIdTokenChanged` restores user session and `/auth/me` loads roles. Axios interceptor and SignalR obtain current Firebase ID token with `getIdToken()` on demand. Auth handler permits query-string token only under `/hubs/admin-orders`. |
| Password reset | **Included now**, using Firebase `sendPasswordResetEmail` instead of the old fake backend endpoint. |
| Email verification | **Included now** for new customer registrations; required for linking historical email records, especially admins. |
| Google sign-in | **Deferred**. Firebase SDK makes future Google provider addition straightforward, but it was optional and is not activated in this phase. |
| Spline | Remains canonical but unwired; Phase 2 only. |
| Deploy/CORS/image storage | Phase 3 only; no Render/Vercel configuration or storage migration done. Existing permissive `SetIsOriginAllowed(_=>true).AllowCredentials()` is a **known production security blocker**. |
| Frontend lockfile | `firebase` dependency added to frontend manifest. Registry access returned `EAI_AGAIN`, so `frontend/package-lock.json` cannot be regenerated here; developer **must run `npm install` with network before `npm ci` / Next build**. Do not misrepresent it as lockfile-complete. |
| Build verification | SDK / dependencies unavailable here; see `PHASE1_BUILD_REPORT.md`. No passing build asserted. |

### Files removed / changed deliberately

- Root `package-lock.json`: deleted because its corresponding root `package.json` was already removed in Phase 0.
- Deleted backend directories: `Modules/Identity/Features/AdminLogin`, `CustomerLogin`, `CustomerRegister`, and old `ForgotPasswordEndpoint.cs`; their handlers issued hand-rolled JWTs or pretended to send password-reset email.
- Deleted backend JWT implementation `Shared/Infrastructure/Auth/JwtTokenGenerator.cs` and `JwtOptions.cs`; removed `Jwt` settings and obsolete JWT NuGet references.
- Added backend `Shared/Infrastructure/Auth/FirebaseAuthenticationHandler.cs` and new EF migration `20261025090000_AddFirebaseUid.cs`; modified only identity model/config/snapshot, identity module, Program registration, package dependencies and admin account seeder.
- Removed frontend `lib/utils/jwt.ts`, `types/auth.ts` (obsolete), and changed the existing *live* customer/admin login routes to use Firebase.
- Added client Firebase setup, `AuthBootstrap`, auth API and session plumbing; updated API interceptor, SignalR token, admin guard/logout and cart auth gating; auth page design retained.
- `frontend/src/app/owner/page.tsx`, PayFast webhook/payment initiation, Orders module pricing/placement, Catalog customization/business logic remain unchanged from Phase 0 (validated via checksums; see verification report).

**Operational safety:** Firebase must be configured by the owner before this migration can run. SuperAdmin account creation/verification and database linkage require an administrator with access to the Firebase console, PostgreSQL seed configuration, and secure environment variables. No credentials are stored in the repository.
