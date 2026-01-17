/**
 * Mailloop Client
 * Main entry point for the SDK
 */

import { HttpClient } from "./http.js";
import { Emails } from "./resources/emails.js";
import { Sandboxes } from "./resources/sandboxes.js";
import type { ClientOptions } from "./types.js";

/**
 * Mailloop API Client
 *
 * @example
 * ```typescript
 * import { MailloopClient } from '@mailloop/sdk';
 *
 * const client = new MailloopClient({
 *   apiKey: 'ml_live_your_api_key_here'
 * });
 *
 * // Create a sandbox
 * const sandbox = await client.sandboxes.create({ name: 'my-test' });
 *
 * // Wait for an email
 * const email = await client.emails.waitFor(sandbox.id, {
 *   timeout: 30000,
 *   from: 'noreply@myapp.com'
 * });
 * ```
 */
export class MailloopClient {
  private readonly http: HttpClient;

  /** Sandbox management operations */
  readonly sandboxes: Sandboxes;

  /** Email operations */
  readonly emails: Emails;

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new Error("API key is required");
    }

    this.http = new HttpClient({
      apiKey: options.apiKey,
      ...(options.baseUrl !== undefined && { baseUrl: options.baseUrl }),
      ...(options.timeout !== undefined && { timeout: options.timeout }),
    });

    // Initialize resources
    this.sandboxes = new Sandboxes(this.http);
    this.emails = new Emails(this.http);
  }

  /**
   * Get the HTTP client for making custom requests
   * @internal
   */
  get _http(): HttpClient {
    return this.http;
  }
}
