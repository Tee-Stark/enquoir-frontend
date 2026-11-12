# Enquoir Cloud — frontend

The control and observability console for agentic financial operations. This
is the frontend for [Enquoir](https://github.com/Tee-Stark/enquoir) (Go API,
`enquoir`, sibling repo), built against its OpenAPI 3.1 contract.

Built with Next.js (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui
(Base UI primitives), TanStack Query/Table, React Hook Form + Zod, Recharts,
and Framer Motion.

## Status

**Phases 1–6 of 7 are complete; Phase 7 (hardening) is in progress.**

- **Phase 1 (Foundation):** application shell, design system, typed API
  client, shared components, global error handling.
- **Phase 2 (Authentication and organisation context):** sign up, log in,
  log out, email verification (+ resend), password reset/change, session
  listing and revocation, organisation switching, and real protected routes
  (`AuthGuard` gates the dashboard behind the live session, redirecting to
  `/login?next=...` on `401 unauthenticated`). Unverified accounts can
  explore the dashboard but see a persistent banner restricting the actions
  that need verification. Signup/session/session-list/logout were
  smoke-tested against the real backend (exact response shapes confirmed),
  not just type-checked. The email-token pages (`/verify-email`,
  `/reset-password`, `/accept-invitation`) are contract-verified but not
  live-tested end-to-end - the backend's `EMAIL_PROVIDER=resend` in this
  environment sends real email, so exercising them here would mean sending
  one. Worth a manual pass (or switching to the file mailer locally) before
  relying on them in a demo.
- **Phase 3 (Core dashboard and payments):** Overview (`/dashboard`) and the
  Payments module (`/payments`, `/payments/[key]`) with filters (date range,
  state, currency, agent, beneficiary, reference), cursor-based "load more"
  pagination (never loads the whole history into memory), all 8 payment
  states visually distinguished, the actual recorded-event sequence as
  state progression, hash-chain verification shown exactly as the backend
  reports it (never independently re-derived), and the full event/attempts
  history. **Scoping note:** the product spec lists metric cards under both
  Phase 3's "Overview" and Phase 5's "Analytics." Overview now shows every
  metric from `/v1/analytics/summary` (real data, the backend's own default
  30-day period) as plain cards; the charts, date-range picker, and
  timezone selector that section B also describes are Phase 5's job -
  building them now would duplicate what Phase 5 is specified to add.
  Empty-state responses (fresh organisation, zero payments) were verified
  live against the real backend; populated-data rendering (table rows, a
  real payment's event/attempts history) is contract-verified via generated
  types but not yet visually confirmed against non-empty data, since that
  needs a full agent → beneficiary → intent submission flow this pass
  didn't set up.
- **Phase 4 (Execution observability):** the Activity module (`/activity`) -
  every agent submission and Airwallex call, filterable by kind, operation,
  outcome, agent, intent key, and date range, with the same cursor-based
  "load more" pagination as Payments and a link from each attempt back to
  its payment. And the Payment replay screen (`/payments/[key]/replay`,
  linked from the payment detail page) - plays a payment's full timeline
  (submissions, state transitions, rail calls, merged and ordered by the
  backend's own database clock) with play/pause, step forward/back, a
  speed selector, and a click-to-jump timeline, plus a detail panel for
  whichever step is selected (transition states, attempt operation,
  transfer ID, HTTP status, error code/message, or the event's hash, as
  applicable to that step's type). The backend's `delta_ms` between steps
  paces the playback; real gaps are clamped to a 400ms–2500ms watchable
  range rather than played back literally (a step that took 20 minutes in
  reality doesn't make the viewer wait 20 minutes) - an explicit frontend
  presentation choice, not a backend behavior. `isUnhappyOutcome` (attempt
  outcome → good/bad styling) was pulled out of `AttemptsTable` into
  `src/lib/attempts/outcome.ts` so the replay timeline could share it
  rather than redefine it.
- **Phase 5 (Analytics):** `/analytics` adds a date-range (with 7/30/90-day
  presets) and timezone filter row that scopes three charts against
  `/v1/analytics/timeseries` - payments by state (stacked, one color per
  state reusing the exact `PaymentStateBadge` palette rather than a second
  categorical scheme for the same meaning), applied volume by currency
  (small multiples - one single-series chart per currency, never one chart
  with currencies overlaid, since amounts in different currencies aren't
  comparable on a shared axis), and median time to applied. Built on
  shadcn's `chart.tsx` (Recharts + CSS-variable theming), pulled in via the
  shadcn CLI like every other UI primitive here rather than hand-rolling
  the Recharts/Tailwind-token integration. `placeholderData: keepPreviousData`
  on the time series queries keeps the previous chart on screen during a
  filter change instead of a skeleton flash. Added `formatMinorUnits` to
  `src/lib/money.ts` - the one place in this app that derives a displayed
  amount from raw minor units instead of deferring to a backend-formatted
  string, because this endpoint has no `Money` object to render, only a
  number per currency group; documented in place as the one disclosed
  exception to the project's usual money-formatting rule. The timezone
  selector is a curated shortlist (the browser's own detected zone plus
  ~18 common ones), not every IANA zone - a real combobox would be the
  fuller answer, but this app has no search/combobox component yet.

Along the way, fixed a Cache Components build error on the new dynamic
`/payments/[key]` route (the first dynamic segment this app has had): the
`(dashboard)` layout now sets `export const instant = false`, since every
dashboard page is behind a client-side session check and real backend
data - there's no static shell to prerender there, by design, not by
oversight. The same route pattern (and fix) applies to
`/payments/[key]/replay`.

- **Phase 6 (Infrastructure management):** `/agents` (create an agent and
  reveal its API key exactly once, rotate a key, revoke an agent),
  `/beneficiaries` (register a US bank-account payee over ACH, list
  registered payees), `/organisation/members` (list members, change a
  role, remove a member or leave), `/organisation/invitations` (invite by
  email and role, list and revoke pending invitations), and
  `/organisation/audit-log` (every recorded account action, filterable by
  action/actor/date range, cursor-paginated "load more" like Payments and
  Activity). Every action button is gated two ways, both disclosed in the
  UI and matched against the real backend, not guessed: by the signed-in
  member's `role` from `useSession()` (viewers see everything read-only;
  only owners/admins invite, change roles, or remove members; only
  operators and above create agents or register payees; only an owner
  edits another owner or admin), and - for create-agent, invite-member,
  and register-payee specifically - by `user.email_verified`, mirroring
  the dashboard's existing unverified-account restriction. Client-side
  gating is a UX nicety only; the backend remains the actual enforcer, and
  every one of these checks was smoke-tested live against the real
  backend (a fresh unverified test organisation got back exactly the
  `403 email_unverified` the gate is built to prevent, and removing the
  org's only owner correctly came back `409 last_owner`). An API key's
  secret, and a rotated key's new secret, are rendered in a dedicated
  "copy it now" dialog the moment the backend issues them and never
  stored or shown again, matching the backend's own one-time-reveal
  contract. Role changes and self-removal also invalidate the cached
  session, since either can sign the acting member out of the
  organisation at once. **Scoping note:** verifying the full
  create-agent / invite-member / register-payee success path (not just
  the unverified-account 403 it's gated against) needs a verified test
  account, and this environment's `EMAIL_PROVIDER=resend` sends a real
  email to do that - the same disclosed limitation as Phase 1's
  email-token pages. The 403/409 error paths above, and every list's
  empty-state shape, were confirmed live; populated tables (a real agent,
  a real payee, a second member) are contract-verified via generated
  types but not yet visually confirmed.
- **Phase 7 (Hardening), in progress:** Playwright e2e tests against the
  real dashboard UI and a real backend - see `e2e/README.md`. So far:
  the unauthenticated-redirect check, and the full sign up → unverified
  banner → email verification → log out → forgot password → reset → log
  in journey, reading tokens back out of the backend's `MAIL_FILE` the
  same way its own `scripts/e2e.sh` does. This first run caught two real
  bugs (not environment artifacts): `SidebarUserMenu` crashed the whole
  dashboard on open (a `DropdownMenuLabel` used outside the `Menu.Group`
  Base UI requires it to be in), and logging out invalidated the session
  on the backend but left the UI on the stale dashboard instead of
  redirecting - both fixed, see `e2e/README.md` for detail. Not yet
  covered: invitation accept, and visually confirming the populated-data
  views Phases 1, 3, and 6 above disclose as contract-verified but not
  yet seen with real data.

## Prerequisites

- Node.js 20.9+ (this repo is developed against Node 26)
- pnpm (`corepack enable` or `npm install -g pnpm`)
- A running [enquoir](https://github.com/Tee-Stark/enquoir) backend for
  anything beyond the shell — see that repo's README for `make up` / `make
  worker` / `make api`.

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The app runs on **http://localhost:3000**. This matters: the backend's
`CORS_ALLOWED_ORIGINS` must include whatever origin you actually run this on,
or every dashboard request will be rejected with `403 forbidden_origin`. The
backend's `.env.example` already ships `CORS_ALLOWED_ORIGINS=http://localhost:3000`,
so the default setup on both sides matches without changes.

### Configuration

| Variable                      | Default                 | Purpose                                    |
| ------------------------------ | ------------------------ | ------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`      | `http://localhost:8090`  | The Enquoir API this app talks to.          |

Dashboard auth rides the backend's HttpOnly `enquoir_session` cookie
(`credentials: "include"` on every request) — there is no token to configure
here, and the app never reads or stores a session token itself.

## Keeping the API contract in sync

This repo vendors its own copy of the backend's `api/openapi.yaml`
(`openapi/openapi.yaml`) so it builds without depending on a sibling checkout
existing, and generates `src/lib/api/schema.d.ts` from it with
[openapi-typescript](https://openapi-ts.dev/). Whenever the backend contract
changes:

```bash
pnpm sync:api
```

This re-copies `../enquoir/api/openapi.yaml` (assumes that sibling checkout
exists at `../enquoir` relative to this repo) and regenerates the types.
Never hand-edit `src/lib/api/schema.d.ts`.

All API calls go through the single typed client in `src/lib/api/client.ts`
(`api`, built on [openapi-fetch](https://openapi-ts.dev/openapi-fetch)), with
errors unwrapped into a typed `ApiError` carrying the backend's stable
`code` (see the OpenAPI spec's `Problem` schema) — branch on `.code`, not on
HTTP status.

## Scripts

| Command             | Purpose                                      |
| -------------------- | --------------------------------------------- |
| `pnpm dev`            | Start the dev server (Turbopack, port 3000)   |
| `pnpm build`          | Production build                              |
| `pnpm start`          | Run the production build                      |
| `pnpm lint`           | ESLint                                        |
| `pnpm typecheck`      | `tsc --noEmit`                                |
| `pnpm test`           | Run the Vitest suite once                     |
| `pnpm test:watch`     | Run Vitest in watch mode                      |
| `pnpm test:e2e`       | Run the Playwright e2e suite (see `e2e/README.md`) |
| `pnpm sync:api`       | Re-vendor the OpenAPI spec and regenerate types |

### Testing

Unit and component tests (Vitest + React Testing Library) live beside the
code they test (`*.test.ts(x)`). Phase 2's auth flows were verified by hand
against the real backend (signup → session → session list → logout, with
the exact response shapes checked), not just type-checked. End-to-end tests
(Playwright) now live in `e2e/` - see `e2e/README.md` for what they cover
and how to run them.

## Project structure

```
src/app/                    Routes (App Router). (dashboard)/ is the shell's
                             route group - it doesn't appear in the URL.
src/components/ui/          shadcn/ui primitives (Base UI-backed).
src/components/shell/       Sidebar, topbar, mobile drawer, nav config.
src/components/feedback/    EmptyState, ErrorState, PagePlaceholder.
src/components/payments/    Payment-domain shared components (state badge, ...).
src/lib/api/                Typed client, generated schema, pagination helper.
openapi/openapi.yaml        Vendored copy of the backend contract.
scripts/sync-openapi.sh     Re-vendors the spec + regenerates types.
```

## Notes for the next phase

- **Cache Components is on** (`cacheComponents: true` in `next.config.ts`,
  Next 16's default for new apps). Phase 1's pages are all static, so this
  has caused no friction yet. Phase 2 adds real per-request session state
  (`cookies()`, a session fetch) - under Cache Components, dynamic reads
  outside a `<Suspense>` boundary are a build error, not a silent fallback.
  Plan dynamic data fetches accordingly (Suspense boundaries, or explicit
  `"use cache"` where genuinely cacheable) rather than disabling the flag.
- The sidebar's collapsed state is the only thing persisted client-side
  (`localStorage`, per-viewer convenience only). Nothing else should be -
  session state belongs to the backend's cookie, not browser storage.
- No policy/limits UI exists anywhere, by design - the API contract doesn't
  expose policy configuration, and the spec is explicit that this must not
  be invented ahead of the backend.
