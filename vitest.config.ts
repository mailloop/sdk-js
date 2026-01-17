import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 60000,
    hookTimeout: 60000,
    setupFiles: ["tests/setup.ts"],
    reporters: ["verbose"],
    // Run tests sequentially to avoid rate limiting
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    sequence: {
      shuffle: false,
    },
  },
});
