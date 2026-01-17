import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { MailloopClient, Sandbox } from '../src/index.js';
import { getTestClient, uniqueName } from './helpers.js';

describe('Temporary Sandboxes', () => {
  let client: MailloopClient;
  let tempSandbox: Sandbox;

  beforeAll(async () => {
    client = getTestClient();
    // Create a single temporary sandbox for most tests
    tempSandbox = await client.sandboxes.createTemporary({
      duration: 60,
      name: uniqueName('temp-test'),
    });
  });

  afterAll(async () => {
    // Cleanup
    try {
      await client.sandboxes.delete(tempSandbox.id);
    } catch {
      // Ignore - may have auto-deleted
    }
  });

  describe('createTemporary', () => {
    it('should create a temporary sandbox with correct properties', () => {
      expect(tempSandbox.id).toBeDefined();
      expect(tempSandbox.isTemporary).toBe(true);
      expect(tempSandbox.deleteAfter).toBeDefined();
      expect(tempSandbox.name).toContain('temp-test');
    });

    it('should set deleteAfter to approximately duration seconds from now', () => {
      const deleteAfterMs = new Date(tempSandbox.deleteAfter!).getTime();
      const now = Date.now();
      // deleteAfter should be in the future (within reason - 60 seconds + some buffer)
      expect(deleteAfterMs).toBeGreaterThan(now);
      expect(deleteAfterMs).toBeLessThan(now + 120 * 1000);
    });

    it('should be retrievable via get', async () => {
      const fetched = await client.sandboxes.get(tempSandbox.id);
      expect(fetched.id).toBe(tempSandbox.id);
      expect(fetched.isTemporary).toBe(true);
    });

    it('should appear in sandbox list', async () => {
      const { sandboxes } = await client.sandboxes.list();
      const found = sandboxes.find(s => s.id === tempSandbox.id);
      expect(found).toBeDefined();
      expect(found?.isTemporary).toBe(true);
    });

    it('should leave this sandbox behind', async () => {
      // This one will be deleted from the system automatically after 60 seconds
      await client.sandboxes.createTemporary({
        duration: 60,
        name: uniqueName('left-behind'),
      });
    });
  });

  describe('delete', () => {
    it('should be deletable manually', async () => {
      // Create a separate sandbox for this test
      const toDelete = await client.sandboxes.createTemporary({
        duration: 60,
        name: uniqueName('manual-delete'),
      });

      // Delete should complete without throwing
      await client.sandboxes.delete(toDelete.id);

      // Verify sandbox no longer exists
      await expect(client.sandboxes.get(toDelete.id)).rejects.toThrow();
    });
  });
});
