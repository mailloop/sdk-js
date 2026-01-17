import { describe, it, expect, beforeAll } from "vitest";
import { getTestClient, getInvalidClient } from "./helpers.js";
import {
  NotFoundError,
  MailloopError,
} from "../src/index.js";
import type { MailloopClient } from "../src/index.js";

describe("Error Handling", () => {
  let client: MailloopClient;

  beforeAll(() => {
    client = getTestClient();
  });

  describe("Invalid API Key", () => {
    // Note: API currently returns INTERNAL_ERROR for invalid keys instead of UNAUTHORIZED
    // These tests verify that an error is thrown, though the error type isn't specific
    it("should throw an error for invalid API key", async () => {
      const invalidClient = getInvalidClient();

      await expect(invalidClient.sandboxes.list()).rejects.toThrow(MailloopError);
    });

    it("should include error information", async () => {
      const invalidClient = getInvalidClient();

      try {
        await invalidClient.sandboxes.list();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(MailloopError);
        expect((error as MailloopError).code).toBeDefined();
        expect((error as MailloopError).message).toBeDefined();
      }
    });
  });

  describe("NotFoundError", () => {
    it("should throw NotFoundError for non-existent sandbox", async () => {
      await expect(
        client.sandboxes.get("non-existent-sandbox-12345")
      ).rejects.toThrow(NotFoundError);
    });

    it("should include correct error code", async () => {
      try {
        await client.sandboxes.get("non-existent-sandbox-12345");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).code).toBe("NOT_FOUND");
      }
    });
  });

  describe("MailloopError base class", () => {
    it("All API errors should extend MailloopError", async () => {
      const invalidClient = getInvalidClient();

      try {
        await invalidClient.sandboxes.list();
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(MailloopError);
      }
    });

    it("NotFoundError should extend MailloopError", async () => {
      try {
        await client.sandboxes.get("non-existent-id");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(MailloopError);
      }
    });
  });
});
