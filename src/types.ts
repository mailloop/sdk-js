// ============ Client Types ============

export interface ClientOptions {
  /** Your API token from the Mailloop dashboard */
  apiKey: string;
  /** Base URL for the API (default: https://mailloop.io/api/v1) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

// ============ Sandbox Types ============

export interface Sandbox {
  id: string;
  name: string;
  username: string;
  password: string;
  emailAddress: string;
  emailCount: number;
  isTemporary: boolean;
  deleteAfter: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSandboxParams {
  name: string;
}

export interface CreateTemporarySandboxParams {
  name?: string;
  /** Duration in seconds (max 60) */
  duration: number;
}

export interface UpdateSandboxParams {
  name?: string;
}

export interface SandboxListResponse {
  sandboxes: Sandbox[];
}

// ============ Email Types ============

export interface EmailSummary {
  id: string;
  from: string;
  to: string[];
  subject: string;
  /** First 128 characters of plain text body, whitespace normalized */
  preview: string;
  hasAttachments: boolean;
  receivedAt: string;
}

export interface EmailDetail {
  id: string;
  messageId: string;
  from: string;
  to: string[];
  cc: string[] | null;
  bcc: string[] | null;
  subject: string;
  text: string | null;
  html: string | null;
  headers: Record<string, string>;
  hasAttachments: boolean;
  attachments: EmailAttachment[];
  receivedAt: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  checksum: string;
}

export interface EmailListParams {
  /** Maximum number of emails to return (default 20, max 100) */
  limit?: number;
  /** Number of emails to skip */
  offset?: number;
  /** Return emails received after this email ID */
  after?: string;
}

export interface EmailListResponse {
  emails: EmailSummary[];
  total: number;
}

export interface WaitForEmailParams {
  /** Timeout in milliseconds (max 60000, default 30000) */
  timeout?: number;
  /** Filter by recipient address */
  to?: string;
  /** Filter by sender address */
  from?: string;
  /** Filter by subject (substring match) */
  subject?: string;
}

// ============ Error Types ============

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiError;
}
