import { describe, it, expect, beforeAll } from 'vitest';
import { getTestClient, getInvalidClient } from './helpers.js';
import type { MailloopClient, SendEmailParams, EmailBlockInput } from '../src/index.js';
import { ValidationError, AuthenticationError } from '../src/index.js';

describe('Send Email', () => {
  let client: MailloopClient;

  const baseSendParams: SendEmailParams = {
    from: 'test@sandbox.mailloop.io',
    to: ['recipient@sandbox.mailloop.io'],
    subject: 'SDK Integration Test',
    blocks: [{ type: 'paragraph', content: 'Hello from the SDK test.' }],
  };

  beforeAll(() => {
    client = getTestClient();
  });

  describe('send', () => {
    it('should send a basic email with a paragraph block', async () => {
      const result = await client.emails.send(baseSendParams);

      expect(result.id).toBeDefined();
      expect(result.status).toBe('sent');
      expect(result.from).toBe(baseSendParams.from);
      expect(result.to).toEqual(baseSendParams.to);
      expect(result.subject).toBe(baseSendParams.subject);
      expect(result.sentAt).toBeDefined();
    });

    it('should send an email with all block types', async () => {
      const allBlocks: EmailBlockInput[] = [
        { type: 'heading', content: 'Test Heading', level: 1 },
        { type: 'paragraph', content: 'Test paragraph with **bold** text.' },
        { type: 'button', text: 'Click Me', href: 'https://example.com' },
        { type: 'image', src: 'https://via.placeholder.com/300x100', alt: 'Placeholder' },
        { type: 'spacer', height: 20 },
        { type: 'divider' },
        { type: 'code', content: 'const x = 1;', language: 'typescript' },
        { type: 'list', items: ['Item 1', 'Item 2', 'Item 3'], ordered: true },
        { type: 'callout', content: 'Important note!', variant: 'warning', title: 'Warning' },
      ];

      const result = await client.emails.send({
        ...baseSendParams,
        subject: 'All Block Types Test',
        blocks: allBlocks,
      });

      expect(result.status).toBe('sent');
      expect(result.id).toBeDefined();
    });

    it('should send with layout config overrides', async () => {
      const result = await client.emails.send({
        ...baseSendParams,
        subject: 'Layout Override Test',
        layout: {
          primaryColor: '#FF5722',
          backgroundColor: '#FAFAFA',
          companyName: 'Test Corp',
          footerText: '© 2026 Test Corp',
        },
      });

      expect(result.status).toBe('sent');
    });

    it('should send with cc and bcc', async () => {
      const result = await client.emails.send({
        ...baseSendParams,
        cc: ['cc@sandbox.mailloop.io'],
        bcc: ['bcc@sandbox.mailloop.io'],
        replyTo: 'reply@sandbox.mailloop.io',
        subject: 'CC/BCC Test',
      });

      expect(result.status).toBe('sent');
      expect(result.to).toEqual(baseSendParams.to);
    });
  });

  describe('validation errors', () => {
    it('should reject empty blocks array', async () => {
      await expect(
        client.emails.send({
          ...baseSendParams,
          blocks: [],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid from address', async () => {
      await expect(
        client.emails.send({
          ...baseSendParams,
          from: 'not-an-email',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject empty to array', async () => {
      await expect(
        client.emails.send({
          ...baseSendParams,
          to: [],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject empty subject', async () => {
      await expect(
        client.emails.send({
          ...baseSendParams,
          subject: '',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid block type', async () => {
      await expect(
        client.emails.send({
          ...baseSendParams,
          blocks: [{ type: 'invalid' } as any],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject button with invalid href', async () => {
      await expect(
        client.emails.send({
          ...baseSendParams,
          blocks: [{ type: 'button', text: 'Click', href: 'not-a-url' }],
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('authentication', () => {
    it('should reject requests with invalid API key', async () => {
      const invalidClient = getInvalidClient();

      await expect(invalidClient.emails.send(baseSendParams)).rejects.toThrow(AuthenticationError);
    });
  });
});
