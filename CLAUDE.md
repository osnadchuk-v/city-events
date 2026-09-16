@AGENTS.md

# city-events

Next.js (App Router, canary) issue-tracker style app with a small "events" area, backed by Postgres (Neon) via Drizzle ORM.

## Stack

- Next.js `16.4.0-canary.17`, React `19.2.8` — App Router, Server Actions, `useActionState`
- Drizzle ORM (`db/schema.ts`, `db/index.ts`) over Postgres (`@neondatabase/serverless` / `pg`)
- Auth: hand-rolled JWT session in an httpOnly cookie (`lib/auth.ts`), no external auth library
- Validation: Zod schemas colocated with the Server Actions that use them
- Styling: Tailwind v4 + `clsx`/`tailwind-merge`; one CSS module (`app/events/new/newevent.module.css`)
- Tests: Vitest + Testing Library (`vitest.config.mjs`, `vitest.setup.ts`)

## Layout

- `app/actions/*.ts` — `'use server'` Server Actions (`issues.ts`, `auth.ts`). Each action does its own auth check via `getCurrentUser()`, its own Zod validation, and returns an `ActionResponse` (`{ success, message, errors?, error? }`) rather than throwing.
- `app/api/**/route.ts` — REST-style route handlers (e.g. `issue/[id]`). Gated by `middleware.ts`, which requires an `Authorization` header on any `/api/*` request.
- `lib/dal.ts` — data-access layer: read queries (`getIssues`, `getIssue`, `getUserByEmail`, `getCurrentUser`). `getCurrentUser` and `getSession` are wrapped in React's `cache()`. `getIssues` uses `'use cache'` + `cacheTag('issues')`; Server Actions call `revalidateTag('issues', 'max')` after writes.
- `lib/auth.ts` — JWT creation/verification (`jose`), password hashing (`bcrypt`), session cookie management.
- `db/schema.ts` — Drizzle table/enum/relation definitions and inferred `Issue`/`User` types. `ISSUE_STATUS` / `ISSUE_PRIORITY` are the label/value maps used to build `<select>` options.
- `app/components/ui/*` — form/button/card/badge primitives (`Form`, `FormGroup`, `FormLabel`, `FormInput`, `FormTextarea`, `FormSelect`, `FormError`, `Button`).
- `app/components/*` — feature components; `EventForm.tsx` is the canonical example of the client-side Server Action pattern (see below).
- Route groups: `(auth)` for signin/signup, `(marketing)` for the public site; `dashboard`, `issues`, `events` are the authenticated app areas.

## Server Action + form pattern (see `app/components/EventForm.tsx`)

- Client component, `useActionState<ActionResponse, FormData>` bound to a Server Action (`createIssue`/`updateIssue`).
- The action callback reads fields off `FormData` manually, calls the Server Action, and returns its `ActionResponse` (or a caught-error `ActionResponse`) — `useActionState` never throws past this boundary.
- On `success`, call `router.refresh()`; only navigate away (`router.push`) for the create path, not edit.
- Field errors come from `state.errors[field][0]` and toggle a `border-red-500` class plus an `aria-describedby` paragraph; the top-level `state.message` renders in `FormError`, colored green on success.
- New forms following this pattern should reuse the same shape rather than inventing a new one.

## Commands

```
npm run dev             # next dev
npm run build / start
npm run lint            # eslint
npm run db:push         # drizzle-kit push
npm run db:studio       # drizzle-kit studio
npm test / test:ui / test:coverage   # vitest
```
