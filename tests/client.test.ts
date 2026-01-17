import { describe, it, expect } from "vitest";
import { MailloopClient } from "../src/index.js";

describe("MailloopClient", () => {
  describe("constructor", () => {
    it("should require apiKey", () => {
      expect(() => new MailloopClient({} as any)).toThrow("API key is required");
    });

    it("should accept apiKey", () => {
      const client = new MailloopClient({ apiKey: "ml_test_key" });
      expect(client).toBeInstanceOf(MailloopClient);
    });

    it("should accept optional baseUrl", () => {
      const client = new MailloopClient({
        apiKey: "ml_test_key",
        baseUrl: "https://custom.api.com",
      });
      expect(client).toBeInstanceOf(MailloopClient);
    });

    it("should accept optional timeout", () => {
      const client = new MailloopClient({
        apiKey: "ml_test_key",
        timeout: 60000,
      });
      expect(client).toBeInstanceOf(MailloopClient);
    });
  });

  describe("resources", () => {
    it("should expose sandboxes resource", () => {
      const client = new MailloopClient({ apiKey: "ml_test_key" });
      expect(client.sandboxes).toBeDefined();
      expect(typeof client.sandboxes.list).toBe("function");
      expect(typeof client.sandboxes.create).toBe("function");
      expect(typeof client.sandboxes.get).toBe("function");
      expect(typeof client.sandboxes.update).toBe("function");
      expect(typeof client.sandboxes.delete).toBe("function");
      expect(typeof client.sandboxes.createTemporary).toBe("function");
    });

    it("should expose emails resource", () => {
      const client = new MailloopClient({ apiKey: "ml_test_key" });
      expect(client.emails).toBeDefined();
      expect(typeof client.emails.list).toBe("function");
      expect(typeof client.emails.get).toBe("function");
      expect(typeof client.emails.waitFor).toBe("function");
    });
  });
});
