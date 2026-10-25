# Luu Tasty Treats — Phase 1 Firebase setup / smoke test

## Decisions and scope

Firebase Auth is the single provider for customer and admin authentication. The .NET backend authenticates Firebase-issued **ID tokens**; it never issues a JWT. PostgreSQL remains authoritative for Customer, Admin and SuperAdmin roles.

**Included now:** email/password registration and login, verification emails for new customers, Firebase password-reset emails, sign-out and token refresh. **Deferred:** optional Google sign-in, Spline wiring, Render/Vercel, image upload migration.

## 1. Configure Firebase project

1. Create or choose one Firebase project. Enable Authentication → Sign-in method → **Email/Password**. Add actual frontend domains (localhost and later Vercel) to Firebase Authentication's Authorized domains.
2. In Firebase Project settings → General → Your apps, register a Web app and obtain API key, auth domain, project ID and app ID.
3. Create `frontend/.env.local` from `frontend/.env.example` and populate the four `NEXT_PUBLIC_FIREBASE_*` fields. These four values are Firebase public client configuration, **not** Admin SDK credentials. Set `NEXT_PUBLIC_API_URL` to the backend origin in local development.
4. Set backend config `Firebase__ProjectId` to the **same project ID**. Provide Admin SDK credentials through **ONE** of these mechanisms: `FIREBASE_SERVICE_ACCOUNT_JSON` containing the *full* service-account JSON in an environment variable, or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a secure service-account JSON **outside the repo** (or Application Default Credentials on supported hosting). Never prefix service credentials with `NEXT_PUBLIC_`; never commit them.
5. Configure PostgreSQL `ConnectionStrings__CakeOrderingDb` for development (or `DATABASE_URL` if applicable). Existing startup migrations will add nullable unique `identity.users.firebase_uid` without deleting legacy users/orders.

## 2. Create / migrate super-admin accounts safely

The two historical owner records (Phindile, Lulama) **must be real Firebase Authentication users**, with a verified email that exactly matches their existing PostgreSQL `identity.users.email` value. Create them individually in Firebase Console → Authentication → Users (or through a one-off, owner-controlled Admin SDK process); set initial credentials through secure admin channels, and confirm email verification. Do not share passwords in chat, commits or `appsettings.json`.

Ensure these users already exist in PostgreSQL with the **SuperAdmin role in `identity.user_roles`**. If this is a fresh DB, use backend environment entries `SeedAdmins__0__Email`, `SeedAdmins__0__FullName`, `SeedAdmins__1__Email`, `SeedAdmins__1__FullName` to seed placeholder PostgreSQL users/roles with null password hashes. These variables are **configuration**, not login credentials. The first verified Firebase sign-in links `firebase_uid` to the matching DB record. Ordinary customer registration cannot create Admin or SuperAdmin roles. Existing bcrypt password hashes are inert; users must sign in via Firebase from now on.

**Important:** A Firebase user with an unverified email cannot link an existing email record; this prevents an unverified user from claiming a privileged historical identity. If the record was already linked to another Firebase UID, the API denies it; correct identity mismatches administratively, never through client-provided roles.

## 3. Install, build and run (network-connected development machine)

```bash
cd frontend
npm install                 # refreshes frontend/package-lock.json for new firebase dependency
npm run build
# then from repo root
cd ..
dotnet restore LuuTastyTreats.sln
dotnet build LuuTastyTreats.sln --no-restore
```

Commit the regenerated `frontend/package-lock.json` together with `frontend/package.json`. `npm ci` will reject the archived lockfile until this is done. Do not run `npm audit fix --force` as part of this migration.

Run API with configured credentials and Postgres; first startup applies the EF migration. Start Next.js with `npm run dev`.

## 4. Manual acceptance checks

1. Register a new customer with Email/Password. Receive verification email and sign in; `GET /api/v1/auth/me` responds with the user, UID-backed database account and `roles: ["Customer"]`. Check Postgres for a non-null `firebase_uid`.
2. Email/password login uses Firebase; **no `mock-jwt-token-123`** and no `/auth/admin/login` JWT endpoint. Try invalid credentials, sign out, refresh and confirm protected roles are cleared.
3. Reset password from `/auth` and verify that a real Firebase reset message is sent (use a real email account).
4. Sign in as each verified owner. `GET /api/v1/auth/me` returns `SuperAdmin` from PostgreSQL. Confirm `/api/v1/admin/...` endpoints and SignalR admin hub permit access; a Customer token must get 403.
5. Test a new Firebase account with the **same unverified email** as an existing guest/admin DB record; first API request must be rejected until verified. Confirm no role escalation possible by injecting Firebase custom claims.
6. Check Firebase auto-refresh on token expiration. SignalR reconnect must obtain a fresh token; refresh the browser and make sure session is restored from Firebase, not persisted roles.
7. Confirm catalog, order pricing, PayFast payment initiation and webhook still behave exactly as previously tested. Those modules were not modified.

## 5. Existing limitations / next phases

- Frontend `npm install` and both real builds remain **unverified here** until run on a machine with dependencies, registry access, .NET 8 SDK, and env configuration.
- **Do not deploy** before Phase 3 CORS remediation: the legacy `SetIsOriginAllowed(_ => true).AllowCredentials()` policy remains insecure. Image uploads still rely on ephemeral disk and must migrate before Render production deployment.
- The pre-existing order placement endpoint is anonymously callable and accepts a customer email in the request. It remains **unchanged on explicit instruction**, but ownership binding needs a separate security review before production use.
- The existing password hash column is retained solely for schema compatibility; no path verifies or issues local credentials after Phase 1. Plan a separate data retention/cleanup decision.
- Spline remains unwired until Phase 2.
