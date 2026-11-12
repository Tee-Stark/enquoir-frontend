# End-to-end tests (Phase 7: hardening)

Playwright drives the real dashboard UI against a real backend — no mocked
API, no fixtures. This is the UI-level counterpart to the backend's own
`scripts/e2e.sh` (API-level, curl-based); both read tokens back out of the
same `MAIL_FILE` so there's one convention, not two.

## Prerequisites

1. The backend (`../enquoir` by default) running: `make up && make worker
   && make api`, with `EMAIL_PROVIDER` set to `resend` or `file` and
   `MAIL_FILE` set (the backend's `.env.example` default, `mail.jsonl`,
   already works — see `internal/adapters/mailfile`).
2. This app's own dev server — `pnpm dev`, or let Playwright start it
   (`webServer` in `playwright.config.ts` reuses one that's already running).
3. Chromium for Playwright: `npx playwright install chromium`.

Every test signs up at least one fresh organisation, and sign-up is rate
limited per IP (5/hour on the backend). `test.beforeAll` clears that one
Redis counter before each run via `docker compose exec redis`, the same
way `scripts/e2e.sh` does — best-effort, so a backend that isn't running
through that compose file just skips it.

All test emails use Resend's test-inbox convention
(`delivered+fe-e2e-<label>-<timestamp>@resend.dev`) — never a real address,
per the backend's own rule that automated tests never email a real person.

## Running

```bash
pnpm test:e2e
```

## Environment variables

| Variable           | Default                  | Purpose                                      |
| ------------------- | ------------------------- | --------------------------------------------- |
| `E2E_BASE_URL`       | `http://localhost:3001`   | The frontend under test (not 3000 - see `playwright.config.ts` for why). |
| `E2E_MAIL_FILE`      | `../enquoir/mail.jsonl`   | Where to read verification/reset tokens from. |
| `E2E_BACKEND_DIR`    | `../enquoir`              | For the Redis rate-limit reset.                |

## What's covered so far

- `auth.spec.ts`: unauthenticated redirect to `/login?next=...`; the full
  sign up → unverified banner → email verification → log out → forgot
  password → reset → log in journey.

This first run caught two real bugs, not environment artifacts:
- `SidebarUserMenu` crashed the whole dashboard on open - `DropdownMenuLabel`
  wraps Base UI's `Menu.GroupLabel`, which requires a `Menu.Group` ancestor,
  but the user's email line used it standalone. Fixed by using a plain
  element for that line and wrapping "Switch organisation" in a real
  `DropdownMenuGroup`.
- Logging out invalidated the session on the backend (confirmed: 204 then
  a 401 on the next session fetch) but left the user on the stale,
  still-rendered dashboard - `AuthGuard`'s passive unauthenticated-redirect
  didn't reliably fire for this client-triggered cache clear, only for a
  fresh navigation. Fixed by having the logout button navigate explicitly
  on success instead of waiting on that passive mechanism.

## What's not yet covered

- Invitation accept (needs a second organisation/role to invite into).
- The populated-data views disclosed as "contract-verified but not visually
  confirmed" in the main README (Phases 1, 3, 6): a real agent, payee,
  second member, and non-empty payment/attempt history. These need the
  backend's own `scripts/e2e.sh` flow (agent → beneficiary → payment) to
  have run first, or an equivalent fixture step added here.
