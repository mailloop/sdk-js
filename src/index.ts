/**
 * @mailloop/sdk
 * Official JavaScript/TypeScript SDK for the Mailloop email testing platform
 */

// Main client
export { MailloopClient } from "./client.js";

// Types
export type {
  ClientOptions,
  Sandbox,
  CreateSandboxParams,
  CreateTemporarySandboxParams,
  UpdateSandboxParams,
  SandboxListResponse,
  EmailSummary,
  EmailDetail,
  EmailAttachment,
  EmailListParams,
  EmailListResponse,
  WaitForEmailParams,
  ApiError,
  ApiErrorResponse,
} from "./types.js";

// Errors
export {
  MailloopError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from "./errors.js";
