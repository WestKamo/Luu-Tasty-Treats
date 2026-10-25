# Phase 1 — Verification report (2026-10-25)

## Build commands actually attempted

| Command | Exit | Result |
|---|---|---|
| `cd frontend && npm run build` | 127 | `sh: 1: next: not found` — packages not installed; compilation did not begin. |
| `dotnet build LuuTastyTreats.sln` | 127 | `bash: dotnet: command not found` — .NET 8 SDK unavailable; compilation did not begin. |
| `cd frontend && npm install --package-lock-only --ignore-scripts --no-audit --no-fund` | 1 | `EAI_AGAIN registry.npmjs.org` while fetching npm dependency; lockfile cannot be regenerated offline. |

**Do not treat this as a passing build.** Because the new `firebase` dependency is in `frontend/package.json` but absent from the old `frontend/package-lock.json`, run `npm install` on the network-connected development machine FIRST, commit the updated lockfile, then run `npm run build` and `dotnet build`.

## Source-level checks performed

- Global TypeScript `transpileModule` syntax/parse pass: **35 of 35 TS/TSX files parsed with zero diagnostics**. This is *not* an npm-installed TypeScript type-check.
- Local import/reference scan: **50 retained internal alias/relative imports with zero missing destinations**. External npm dependencies are not validated.
- Protected file byte comparison vs approved Phase 0 tree: **74 of 74 files unchanged**, including `Modules/Payments`, `Modules/Orders`, `Modules/Catalog`, `app/owner/page.tsx` and canonical `auth/SplineScene.tsx`.
- Search for deleted `IJwtTokenGenerator`, `JwtOptions`, `JwtBearer`, fake customer token and old access-token setters in retained API/React implementation: **none**.
- `frontend/package-lock.json` retained but stale until dependencies are installed; root `package-lock.json` removed.

## Runtime checks requiring Firebase project and PostgreSQL

1. Configure Firebase keys/service account and PostgreSQL per `PHASE1_SETUP.md`.
2. Verify the new EF migration applies and `identity.users.firebase_uid` is unique/nullable.
3. Test first customer login, return profile, restored session and role authorization.
4. Test both verified owner admin accounts and reject unverified email collisions.
5. Test SignalR authorization and auto-refresh; ensure clients cannot grant themselves DB admin roles.
6. Test password reset and verification delivery.
7. Re-run regression tests on unmodified payment, pricing and catalog modules.

## Known pre-existing production blockers (not Phase 1 scope)

- Existing permissive wildcard/credentials CORS policy remains: **must be restricted to configured origins before production** (Phase 3).
- Static uploaded cake photos remain on ephemeral backend filesystem; fix before Render (Phase 3).
- Order creation endpoint's anonymous/customer-email input remains unchanged on explicit instruction. **Review ownership controls before production.**
