import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../../../.env") });

// Validate required environment variables
const API_KEY = process.env.MAILLOOP_API_KEY;

if (!API_KEY) {
  console.error("\n❌ MAILLOOP_API_KEY not found in environment\n");
  console.error("   Create a .env file in packages/sdk-js/ with:");
  console.error("   MAILLOOP_API_KEY=ml_your_api_key_here\n");
  process.exit(1);
}

console.log(`\n🔑 Using API key: ${API_KEY.substring(0, 12)}...`);
console.log(`🌐 Base URL: ${process.env.MAILLOOP_BASE_URL || "http://localhost:4000/api/v1"}\n`);
