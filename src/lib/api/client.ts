import createClient from "openapi-fetch";
import type { components, paths } from "./schema";

export type Problem = components["schemas"]["Problem"];
export type ProblemCode = Problem["code"];

/**
 * A typed RFC 9457 problem. Every call site should branch on `code`, which is
 * stable across the API — `detail` is for people and may change wording.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ProblemCode | "unknown";
  readonly detail: string;
  readonly field?: string;
  /** Seconds to wait before retrying, from the `Retry-After` header on 429s. */
  readonly retryAfterSeconds?: number;

  constructor(
    problem: Partial<Problem> & { status: number; retryAfterSeconds?: number }
  ) {
    super(problem.detail ?? problem.title ?? `Request failed (${problem.status})`);
    this.name = "ApiError";
    this.status = problem.status;
    this.code = problem.code ?? "unknown";
    this.detail = problem.detail ?? this.message;
    this.field = problem.field;
    this.retryAfterSeconds = problem.retryAfterSeconds;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8090";

/**
 * The one client the whole app talks to the Enquoir API through. Session
 * auth rides the HttpOnly `enquoir_session` cookie, never JS-readable state.
 */
export const api = createClient<paths>({
  baseUrl,
  credentials: "include",
});

type ApiResult<D> = {
  data?: D;
  error?: unknown;
  response: Response;
};

/**
 * Unwraps an openapi-fetch call into its data, or throws a typed ApiError.
 * Centralizing this means every caller gets `error.code` without re-parsing
 * the problem body itself. Takes the call's promise directly, so call
 * sites read as `unwrap(api.GET(...))` instead of needing their own await.
 *
 * Success is `response.ok`, not "data is present" - a 204/202 response has
 * no body by design (logout, verify-email, resend, ...) and openapi-fetch
 * returns `data: undefined` for those, which is not an error.
 */
export async function unwrap<D>(call: Promise<ApiResult<D>>): Promise<D> {
  const { data, error, response } = await call;
  if (!response.ok) {
    const retryAfter = response.headers.get("Retry-After");
    throw new ApiError({
      ...(error as Partial<Problem> | undefined),
      status: response.status,
      retryAfterSeconds: retryAfter ? Number(retryAfter) : undefined,
    });
  }
  return data as D;
}

/** Human-readable fallback copy for a problem code, when a call site wants a default. */
export const PROBLEM_MESSAGES: Partial<Record<ProblemCode, string>> = {
  invalid_credentials: "That email or password is incorrect.",
  email_taken: "An account with that email already exists.",
  token_invalid: "This link is invalid or has expired.",
  already_verified: "This email is already verified.",
  already_member: "That person is already a member.",
  last_owner: "An organisation must always keep at least one owner.",
  rate_limited: "Too many requests — please slow down and try again.",
  account_locked: "This account is temporarily locked after repeated failed attempts.",
  forbidden: "You don't have permission to do that.",
  forbidden_origin: "This request was blocked for security reasons.",
  no_organisation: "This account isn't part of an organisation yet.",
  email_unverified: "Verify your email address to do this.",
  not_found: "We couldn't find that.",
  body_too_large: "That request was too large.",
  validation_failed: "Please check the highlighted field and try again.",
  not_implemented: "This isn't available yet.",
  internal_error: "Something went wrong on our side. It's safe to try again.",
  unauthenticated: "Please sign in to continue.",
};

function formatRetryAfter(seconds: number): string {
  if (seconds < 90) return `${Math.max(1, Math.round(seconds))} seconds`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `${minutes} minutes`;
  return `${Math.round(minutes / 60)} hours`;
}

export function problemMessage(error: unknown): string {
  if (isApiError(error)) {
    const base = PROBLEM_MESSAGES[error.code as ProblemCode] ?? error.detail;
    if (error.retryAfterSeconds !== undefined) {
      return `${base} Try again in ${formatRetryAfter(error.retryAfterSeconds)}.`;
    }
    return base;
  }
  return "Something went wrong. Please try again.";
}
