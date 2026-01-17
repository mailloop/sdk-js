import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, uniqueName } from "./helpers.js";
import { NotFoundError } from "../src/index.js";
import type { MailloopClient, Sandbox } from "../src/index.js";

describe("Sandboxes", () => {
  let client: MailloopClient;
  let createdSandboxIds: string[] = [];

  beforeAll(() => {
    client = getTestClient();
  });

  afterAll(async () => {
    // Cleanup any sandboxes created during tests
    for (const id of createdSandboxIds) {
      try {
        await client.sandboxes.delete(id);
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  describe("create", () => {
    it("should create a new sandbox with name", async () => {
      const name = uniqueName("test-sandbox");

      const sandbox = await client.sandboxes.create({ name });
      createdSandboxIds.push(sandbox.id);

      expect(sandbox.id).toBeDefined();
      expect(sandbox.name).toBe(name);
      expect(sandbox.emailAddress).toMatch(/@.*mailloop/);
      expect(sandbox.username).toBeDefined();
      expect(sandbox.emailCount).toBe(0);
      expect(sandbox.isTemporary).toBe(false);
      expect(sandbox.createdAt).toBeDefined();
    });

    it("should return valid ISO date strings", async () => {
      const sandbox = await client.sandboxes.create({
        name: uniqueName("date-test"),
      });
      createdSandboxIds.push(sandbox.id);

      expect(() => new Date(sandbox.createdAt)).not.toThrow();
      expect(() => new Date(sandbox.updatedAt)).not.toThrow();
    });
  });

  describe("get", () => {
    let testSandbox: Sandbox;

    beforeAll(async () => {
      testSandbox = await client.sandboxes.create({
        name: uniqueName("get-test"),
      });
      createdSandboxIds.push(testSandbox.id);
    });

    it("should return sandbox by ID", async () => {
      const sandbox = await client.sandboxes.get(testSandbox.id);

      expect(sandbox.id).toBe(testSandbox.id);
      expect(sandbox.name).toBe(testSandbox.name);
      expect(sandbox.emailAddress).toBe(testSandbox.emailAddress);
    });

    it("should throw NotFoundError for non-existent ID", async () => {
      await expect(
        client.sandboxes.get("non-existent-sandbox-id")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("list", () => {
    let testSandbox: Sandbox;

    beforeAll(async () => {
      testSandbox = await client.sandboxes.create({
        name: uniqueName("list-test"),
      });
      createdSandboxIds.push(testSandbox.id);
    });

    it("should return array of sandboxes", async () => {
      const { sandboxes } = await client.sandboxes.list();

      expect(Array.isArray(sandboxes)).toBe(true);
      expect(sandboxes.length).toBeGreaterThan(0);
    });

    it("should include recently created sandbox", async () => {
      const { sandboxes } = await client.sandboxes.list();

      const found = sandboxes.find((s) => s.id === testSandbox.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe(testSandbox.name);
    });
  });

  describe("update", () => {
    let testSandbox: Sandbox;

    beforeAll(async () => {
      testSandbox = await client.sandboxes.create({
        name: uniqueName("update-test"),
      });
      createdSandboxIds.push(testSandbox.id);
    });

    it("should update sandbox name", async () => {
      const newName = uniqueName("updated-name");

      const updated = await client.sandboxes.update(testSandbox.id, {
        name: newName,
      });

      expect(updated.name).toBe(newName);
      expect(updated.id).toBe(testSandbox.id);
    });

    it("should persist the update", async () => {
      const newName = uniqueName("persisted-name");
      await client.sandboxes.update(testSandbox.id, { name: newName });

      const fetched = await client.sandboxes.get(testSandbox.id);
      expect(fetched.name).toBe(newName);
    });

    it("should throw NotFoundError for non-existent ID", async () => {
      await expect(
        client.sandboxes.update("non-existent-id", { name: "test" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should delete a sandbox", async () => {
      const sandbox = await client.sandboxes.create({
        name: uniqueName("delete-test"),
      });

      await expect(client.sandboxes.delete(sandbox.id)).resolves.not.toThrow();

      // Verify it's deleted
      await expect(client.sandboxes.get(sandbox.id)).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw NotFoundError for non-existent ID", async () => {
      await expect(
        client.sandboxes.delete("non-existent-id")
      ).rejects.toThrow(NotFoundError);
    });
  });
});
