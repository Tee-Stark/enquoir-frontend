import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

function backendDir(): string {
  return process.env.E2E_BACKEND_DIR ?? "../enquoir";
}

/**
 * Every test run signs up at least one fresh organisation, and sign-up
 * is rate-limited per IP (5/hour) - same problem scripts/e2e.sh solves
 * on the backend side. Clears that one Redis counter before a run so
 * repeated local test runs don't get locked out; best-effort, since a
 * CI backend may not run through this docker compose file at all.
 */
export async function resetSignupRateLimit(): Promise<void> {
  try {
    await exec("docker", [
      "compose",
      "-f",
      `${backendDir()}/deploy/docker-compose.yml`,
      "exec",
      "-T",
      "redis",
      "sh",
      "-c",
      "redis-cli --scan --pattern 'enq:rl:signup-ip:*' | xargs -r redis-cli del",
    ]);
  } catch {
    // Best effort - a remote/CI backend may not be reachable this way.
  }
}

/** A Resend test inbox - see AGENTS.md: automated tests never email a real person. */
export function testEmail(label: string): string {
  return `delivered+fe-e2e-${label}-${Date.now()}@resend.dev`;
}

export const TEST_PASSWORD = "correct horse battery staple";
