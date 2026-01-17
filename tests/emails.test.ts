import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestClient, uniqueName, sleep } from './helpers.js';
import { TimeoutError, RateLimitError } from '../src/index.js';
import type { MailloopClient, Sandbox } from '../src/index.js';

describe('Emails', () => {
  let client: MailloopClient;
  let testSandbox: Sandbox;

  beforeAll(async () => {
    client = getTestClient();

    // Retry sandbox creation with backoff if rate limited
    let attempts = 0;
    while (attempts < 3) {
      try {
        testSandbox = await client.sandboxes.create({
          name: uniqueName('email-test'),
        });
        break;
      } catch (error) {
        if (error instanceof RateLimitError && attempts < 2) {
          const waitTime = (error.retryAfter || 30) * 1000;
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await sleep(waitTime);
          attempts++;
        } else {
          throw error;
        }
      }
    }
  });

  afterAll(async () => {
    try {
      await client.sandboxes.delete(testSandbox.id);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('list', () => {
    it('should return emails array with total count', async () => {
      const { emails, total } = await client.emails.list(testSandbox.id);

      expect(Array.isArray(emails)).toBe(true);
      expect(emails.length).toBe(0); // New sandbox should be empty
      expect(total).toBe(0);
    });

    it('should accept pagination parameters', async () => {
      const { emails } = await client.emails.list(testSandbox.id, {
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(emails)).toBe(true);
    });
  });

  describe('waitFor', () => {
    it('should throw TimeoutError when no email arrives', async () => {
      try {
        await client.emails.waitFor(testSandbox.id, {
          timeout: 1500,
        });
        expect.fail('Should have thrown TimeoutError');
      } catch (error) {
        expect(error).toBeInstanceOf(TimeoutError);
        expect((error as TimeoutError).message).toContain('1500ms');
        expect((error as TimeoutError).code).toBe('TIMEOUT');
      }
    });

    it('should accept filter parameters', async () => {
      // This should still timeout, but verifies params are accepted
      await expect(
        client.emails.waitFor(testSandbox.id, {
          from: 'test@example.com',
          to: 'recipient@example.com',
          subject: 'Test Subject',
        })
      ).rejects.toThrow(TimeoutError);
    });
  });
});
