# Phase 0 — Build and Static Validation Report

Date: 2026-10-25  
**Build status: BLOCKED BY THIS EXECUTION ENVIRONMENT. NOT VERIFIED.**

Both requested build commands were actually executed **after the approved deletions and the Spline replacement**. Neither reached an application compiler, due to unavailable build dependencies/toolchains.

## Frontend — attempted

Working directory: `frontend/`  
Command: `npm run build`  
Exit code: **127**  
Output:

```text
> frontend@0.1.0 build
> next build

sh: 1: next: not found
```

Meaning: `npm` ran the package's build script (`next build`), but **Next.js is not installed** in the execution environment (there is no `frontend/node_modules/` directory). The project includes `frontend/package-lock.json`; run `npm ci` with registry/network access, then `npm run build` in a properly provisioned environment. This is not a report that the Next.js code compiled or passed.

## Backend — attempted

Working directory: repository root  
Command: `dotnet build LuuTastyTreats.sln`  
Exit code: **127**  
Output:

```text
bash: line 6: dotnet: command not found
```

Meaning: the .NET SDK/`dotnet` executable is **not installed** in the execution environment, so backend compilation was not reached. A machine with the matching .NET SDK and NuGet access must run the command.

## Connectivity constraints

Network access needed to fetch missing SDK/dependencies is unavailable here (DNS resolution fails). No attempt was made to fake successful build output or to alter build scripts merely to hide this environment limitation.

## Additional source-only checks — passed

- TypeScript parser (`typescript` 5.8.3 installed globally) parsed **35** remaining frontend `.ts`/`.tsx` files without syntax parse errors.
- Validated **135** source-level static/dynamic import specifiers, confirming all local `@/` and relative imports point to existing files.
- Confirmed all nine approved orphan files, the root `package.json`, and the redundant root Spline component are absent.
- Confirmed the canonical Spline file uses `next/dynamic` with `ssr: false`, retains the environment-based scene URL, and exposes a CSS-only fallback.
- Confirmed live customer auth remains unchanged and still contains the documented mock JWT defect.
- SHA-256 byte comparison before/after cleanup confirms **64 backend files** across protected payment, order, and catalog code are unchanged.

These static checks do **not** substitute for `npm run build`, `dotnet build`, or runtime UI testing. The historical Turbopack Draco decoder issue has not been retested in an installed-dependency environment.

## Reproduction instructions on a machine with dependencies

```sh
cd frontend
npm ci
npm run build
cd ..
dotnet restore LuuTastyTreats.sln
dotnet build LuuTastyTreats.sln --no-restore
```

Keep Phase 1/2/3 feature work deferred until full builds can be verified and any real compile errors fixed.
