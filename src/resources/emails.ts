/**
 * Emails Resource
 * Operations for listing and reading emails in sandboxes
 */

import type { HttpClient } from '../http.js';
import { TimeoutError } from '../errors.js';
import type {
  EmailDetail,
  EmailListParams,
  EmailListResponse,
  WaitForEmailParams,
  SendEmailParams,
  SendEmailResponse,
} from '../types.js';

const DEFAULT_TIMEOUT = 30000;
const MAX_TIMEOUT = 60000; // 1 minute max (server-side supports longer)

export class Emails {
  constructor(private readonly http: HttpClient) {}

  /**
   * List emails in a sandbox
   *
   * @example
   * ```typescript
   * const { emails, total } = await client.emails.list('sandbox-id');
   * for (const email of emails) {
   *   console.log(`${email.from}: ${email.subject}`);
   * }
   * ```
   */
  async list(sandboxId: string, params?: EmailListParams): Promise<EmailListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.limit !== undefined) {
      searchParams.set('limit', params.limit.toString());
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', params.offset.toString());
    }
    if (params?.after !== undefined) {
      searchParams.set('after', params.after);
    }

    const query = searchParams.toString();
    const path = `/sandboxes/${encodeURIComponent(sandboxId)}/emails${query ? `?${query}` : ''}`;

    return this.http.get<EmailListResponse>(path);
  }

  /**
   * Get a single email by ID
   *
   * @example
   * ```typescript
   * const email = await client.emails.get('sandbox-id', 'email-id');
   * console.log(email.html);
   * console.log(email.attachments);
   * ```
   */
  async get(sandboxId: string, emailId: string): Promise<EmailDetail> {
    return this.http.get<EmailDetail>(
      `/sandboxes/${encodeURIComponent(sandboxId)}/emails/${encodeURIComponent(emailId)}`
    );
  }

  /**
   * Wait for an email to arrive in the sandbox
   *
   * Calls the server-side wait endpoint which polls internally and returns when
   * an email matching the filters arrives.
   *
   * @param sandboxId The sandbox to poll for emails
   * @param params.timeout Timeout in milliseconds (max 60000, default 30000)
   * @param params.to Filter by recipient address
   * @param params.from Filter by sender address
   * @param params.subject Filter by subject (substring match)
   *
   * @throws TimeoutError if no matching email arrives within the timeout
   *
   * @example
   * ```typescript
   * // Wait for any email
   * const email = await client.emails.waitFor('sandbox-id');
   *
   * // Wait for email from specific sender
   * const email = await client.emails.waitFor('sandbox-id', {
   *   from: 'noreply@myapp.com',
   *   timeout: 45000
   * });
   *
   * // Wait for email with specific subject
   * const email = await client.emails.waitFor('sandbox-id', {
   *   subject: 'Password Reset'
   * });
   * ```
   */
  /**
   * @experimental This method is not yet part of the public API and may change without notice.
   *
   * Send a transactional email with block-based content
   *
   * @example
   * ```typescript
   * const result = await client.emails.send({
   *   from: 'notifications@acme.com',
   *   to: ['user@example.com'],
   *   subject: 'Your order has shipped!',
   *   blocks: [
   *     { type: 'heading', content: 'Order Shipped', level: 2 },
   *     { type: 'paragraph', content: 'Your order #4821 is on its way.' },
   *     { type: 'button', text: 'Track Package', href: 'https://acme.com/track/4821' },
   *   ],
   *   layout: {
   *     primaryColor: '#4F46E5',
   *     companyName: 'Acme Inc.',
   *   },
   * });
   * console.log(result.id, result.status);
   * ```
   */
  async send(params: SendEmailParams): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>('/emails/send', params);
  }

  async waitFor(sandboxId: string, params?: WaitForEmailParams): Promise<EmailDetail> {
    const timeout = Math.min(params?.timeout ?? DEFAULT_TIMEOUT, MAX_TIMEOUT);

    try {
      // Call server-side wait endpoint
      const response = await this.http.post<EmailDetail>(
        `/sandboxes/${encodeURIComponent(sandboxId)}/emails/wait`,
        {
          timeout,
          ...(params?.from && { from: params.from }),
          ...(params?.to && { to: params.to }),
          ...(params?.subject && { subject: params.subject }),
        },
        { timeout }
      );

      return response;
    } catch (error: unknown) {
      // Convert 408 timeout to TimeoutError
      if (
        error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        (error as any).statusCode === 408
      ) {
        throw new TimeoutError(`No email matching filters received within ${timeout}ms`, {
          timeout,
        });
      }
      throw error;
    }
  }
}
