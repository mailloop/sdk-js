/**
 * HTTP Client for Mailloop API
 * Zero-dependency fetch wrapper with auth header injection
 */

import type { ApiErrorResponse } from "./types.js";
import {
  MailloopError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./errors.js";

const DEFAULT_BASE_URL = "https://mailloop.io/api/v1";
const DEFAULT_TIMEOUT = 30000;

export interface HttpClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: HttpClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Make an authenticated request to the API
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const method = options.method ?? "GET";
    const timeout = options.timeout ?? this.timeout;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") ?? "60", 10);
        throw new RateLimitError("Rate limit exceeded", retryAfter);
      }

      // Handle successful responses
      if (response.ok) {
        // Handle 204 No Content
        if (response.status === 204) {
          return undefined as T;
        }
        return (await response.json()) as T;
      }

      // Handle error responses
      let errorBody: ApiErrorResponse;
      let effectiveStatus = response.status;
      try {
        const json = await response.json();
        // Handle both { error: { ... } } and { code, message, statusCode } formats
        if (json.error) {
          // Check if error is a string (needs parsing)
          if (typeof json.error === "string") {
            try {
              const parsed = JSON.parse(json.error);
              errorBody = { error: parsed };
              if (parsed.statusCode) {
                effectiveStatus = parsed.statusCode;
              }
            } catch {
              errorBody = { error: { code: "UNKNOWN", message: json.error } };
            }
          } else {
            errorBody = json as ApiErrorResponse;
            // Check for statusCode in nested error
            if (json.error.statusCode) {
              effectiveStatus = json.error.statusCode;
            }
            // API bug workaround: error.message is an object containing the real error
            // e.g. { error: { code: "INTERNAL_ERROR", message: { code: "NOT_FOUND", message: "...", statusCode: 404 } } }
            if (
              json.error.message &&
              typeof json.error.message === "object" &&
              json.error.message.code &&
              json.error.message.message
            ) {
              const innerError = json.error.message;
              errorBody = { error: innerError };
              if (innerError.statusCode) {
                effectiveStatus = innerError.statusCode;
              }
            }
            // Also handle stringified JSON in message field
            else if (typeof json.error.message === "string" && json.error.message.startsWith("{")) {
              try {
                const parsed = JSON.parse(json.error.message);
                if (parsed.code && parsed.message) {
                  errorBody = { error: parsed };
                  if (parsed.statusCode) {
                    effectiveStatus = parsed.statusCode;
                  }
                }
              } catch {
                // Keep original message if parsing fails
              }
            }
          }
        } else if (json.code || json.message) {
          // Check if message is an object with nested error (API bug workaround)
          if (
            json.message &&
            typeof json.message === "object" &&
            json.message.code &&
            json.message.message
          ) {
            errorBody = { error: json.message };
            if (json.message.statusCode) {
              effectiveStatus = json.message.statusCode;
            }
          }
          // Check if message is a stringified JSON
          else if (typeof json.message === "string" && json.message.startsWith("{")) {
            try {
              const parsed = JSON.parse(json.message);
              if (parsed.code && parsed.message) {
                errorBody = { error: parsed };
                if (parsed.statusCode) {
                  effectiveStatus = parsed.statusCode;
                }
              } else {
                errorBody = { error: json };
                if (json.statusCode) {
                  effectiveStatus = json.statusCode;
                }
              }
            } catch {
              errorBody = { error: json };
              if (json.statusCode) {
                effectiveStatus = json.statusCode;
              }
            }
          } else {
            errorBody = { error: json };
            // Check for statusCode in flat response
            if (json.statusCode) {
              effectiveStatus = json.statusCode;
            }
          }
        } else {
          errorBody = {
            error: {
              code: "UNKNOWN",
              message: typeof json === "string" ? json : JSON.stringify(json),
            },
          };
        }
      } catch {
        errorBody = {
          error: { code: "UNKNOWN", message: `HTTP ${response.status}` },
        };
      }

      throw this.createError(errorBody, effectiveStatus);
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw Mailloop errors
      if (error instanceof MailloopError) {
        throw error;
      }

      // Handle fetch abort (timeout)
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new MailloopError("Request timed out", "TIMEOUT", undefined);
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new MailloopError(
          "Network error: Unable to connect to the API",
          "NETWORK_ERROR",
          undefined
        );
      }

      // Unknown error
      throw new MailloopError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "UNKNOWN",
        undefined
      );
    }
  }

  /**
   * Create appropriate error class from API response
   */
  private createError(errorBody: ApiErrorResponse, status: number): MailloopError {
    const { code, message, details } = errorBody.error ?? {};
    const errorMessage =
      typeof message === "string"
        ? message
        : message
          ? JSON.stringify(message)
          : `HTTP ${status}`;
    const errorCode = code ?? "UNKNOWN";

    // First check error code (more reliable than HTTP status due to API bugs)
    switch (errorCode) {
      case "UNAUTHORIZED":
        return new AuthenticationError(errorMessage, details);
      case "FORBIDDEN":
        return new PermissionError(errorMessage, details);
      case "NOT_FOUND":
        return new NotFoundError(errorMessage, details);
      case "VALIDATION_ERROR":
        return new ValidationError(errorMessage, details);
      case "RATE_LIMIT_EXCEEDED":
        return new RateLimitError(errorMessage, 60, details);
    }

    // Fall back to HTTP status
    switch (status) {
      case 401:
        return new AuthenticationError(errorMessage, details);
      case 403:
        return new PermissionError(errorMessage, details);
      case 404:
        return new NotFoundError(errorMessage, details);
      case 400:
        return new ValidationError(errorMessage, details);
      case 429:
        return new RateLimitError(errorMessage, 60, details);
      default:
        return new MailloopError(errorMessage, errorCode, status, details);
    }
  }

  /**
   * GET request
   */
  get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${path}?${queryString}`;
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  /**
   * POST request
   */
  post<T>(path: string, body?: unknown, options?: { timeout?: number }): Promise<T> {
    return this.request<T>(path, { method: "POST", body, ...options });
  }

  /**
   * PATCH request
   */
  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body });
  }

  /**
   * DELETE request
   */
  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}
