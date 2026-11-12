import { readFile } from "node:fs/promises";

/**
 * Reads tokens back out of the backend's MAIL_FILE - the same mechanism
 * the backend's own scripts/e2e.sh uses (see its token_for function),
 * so this harness and that one agree on one convention instead of two.
 * One JSON object per line: { to, text, sent_at, ... } - see
 * internal/adapters/mailfile/mailfile.go in the backend repo.
 */
export function mailFilePath(): string {
  return process.env.E2E_MAIL_FILE ?? "../enquoir/mail.jsonl";
}

type Message = { to: string; text: string; sent_at: string };

async function readMessages(path: string): Promise<Message[]> {
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch {
    return [];
  }
  const out: Message[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line) as Message);
    } catch {
      // A line being appended mid-read; skip it, the poll loop retries.
    }
  }
  return out;
}

/**
 * Waits for the token in the most recent email to `to` whose body links
 * to `path` (e.g. "/verify-email"), and returns it. Emails can arrive
 * out of order under concurrent sends, so this always takes the latest
 * matching message, not the first one found.
 */
export async function waitForToken(
  to: string,
  path: string,
  { timeoutMs = 60_000, intervalMs = 500 }: { timeoutMs?: number; intervalMs?: number } = {}
): Promise<string> {
  const file = mailFilePath();
  const deadline = Date.now() + timeoutMs;
  const linkPattern = new RegExp(`${path.replace(/\//g, "\\/")}\\?token=([^\\s"&]+)`);

  for (;;) {
    const messages = await readMessages(file);
    const matches = messages
      .filter((m) => m.to === to && linkPattern.test(m.text))
      .sort((a, b) => a.sent_at.localeCompare(b.sent_at));
    const last = matches.at(-1);
    if (last) {
      const token = last.text.match(linkPattern)?.[1];
      if (token) return token;
    }
    if (Date.now() > deadline) {
      throw new Error(
        `no email with a ${path} link reached ${to} within ${timeoutMs}ms ` +
          `(reading ${file} - is the worker running with MAIL_FILE set?)`
      );
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
