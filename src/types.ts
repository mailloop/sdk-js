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

// ============ Send Email Types ============

export type TextAlign = 'left' | 'center' | 'right';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type ButtonSize = 'small' | 'medium' | 'large';
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface ParagraphBlock {
  type: 'paragraph';
  content: string;
  align?: TextAlign;
  color?: string;
  fontSize?: number;
}

export interface HeadingBlock {
  type: 'heading';
  content: string;
  level?: HeadingLevel;
  align?: TextAlign;
  color?: string;
}

export interface ButtonBlock {
  type: 'button';
  text: string;
  href: string;
  align?: TextAlign;
  variant?: ColorVariant;
  size?: ButtonSize;
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  href?: string;
  width?: number;
  height?: number;
  align?: TextAlign;
}

export interface SpacerBlock {
  type: 'spacer';
  height?: number;
}

export interface DividerBlock {
  type: 'divider';
  color?: string;
  thickness?: number;
}

export interface CodeBlock {
  type: 'code';
  content: string;
  language?: string;
}

export interface ListBlock {
  type: 'list';
  items: string[];
  ordered?: boolean;
}

export interface CalloutBlock {
  type: 'callout';
  content: string;
  variant?: ColorVariant;
  title?: string;
}

export type EmailBlockInput =
  | ParagraphBlock
  | HeadingBlock
  | ButtonBlock
  | ImageBlock
  | SpacerBlock
  | DividerBlock
  | CodeBlock
  | ListBlock
  | CalloutBlock;

export interface SocialLink {
  platform: string;
  /** Full URL. Required for custom platforms; optional for known platforms when handle is provided. */
  url?: string;
  /** Username/handle for known platforms (e.g. 'mailloop'). Mutually exclusive with url. */
  handle?: string;
  label?: string;
  iconUrl?: string;
}

export interface SendEmailLayoutConfig {
  primaryColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  logoHeight?: number;
  footerText?: string;
  fontFamily?: string;
  companyName?: string;
  socials?: SocialLink[];
}

export interface SendEmailParams {
  /** Sender email address */
  from: string;
  /** Recipient email addresses */
  to: string[];
  /** CC email addresses */
  cc?: string[];
  /** BCC email addresses */
  bcc?: string[];
  /** Reply-to email address */
  replyTo?: string;
  /** Email subject */
  subject: string;
  /** Preview text shown in email client inbox next to the subject line (not visible in email body). Recommended max ~100 characters. */
  preheader?: string;
  /** Content blocks that make up the email body */
  blocks: EmailBlockInput[];
  /** Optional layout configuration overrides */
  layout?: SendEmailLayoutConfig;
}

export interface SendEmailResponse {
  id: string;
  status: 'sent' | 'failed';
  from: string;
  to: string[];
  subject: string;
  sentAt: string;
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
