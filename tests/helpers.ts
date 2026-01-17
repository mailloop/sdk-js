import { MailloopClient } from "../src/index.js";

/**
 * Get configured test client
 */
export function getTestClient(): MailloopClient {
  const apiKey = process.env.MAILLOOP_API_KEY;
  const baseUrl = process.env.MAILLOOP_BASE_URL || "http://localhost:4000/api/v1";

  if (!apiKey) {
    throw new Error("MAILLOOP_API_KEY not configured");
  }

  return new MailloopClient({ apiKey, baseUrl });
}

/**
 * Get client with invalid API key for error testing
 */
export function getInvalidClient(): MailloopClient {
  const baseUrl = process.env.MAILLOOP_BASE_URL || "http://localhost:4000/api/v1";

  return new MailloopClient({
    apiKey: "ml_invalid_test_key_12345",
    baseUrl,
  });
}

/**
 * Generate unique test name with timestamp
 */
export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
