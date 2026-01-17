/**
 * Sandboxes Resource
 * CRUD operations for email sandboxes
 */

import type { HttpClient } from "../http.js";
import type {
  Sandbox,
  CreateSandboxParams,
  CreateTemporarySandboxParams,
  UpdateSandboxParams,
  SandboxListResponse,
} from "../types.js";

export class Sandboxes {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all sandboxes for the organization
   *
   * @example
   * ```typescript
   * const { sandboxes } = await client.sandboxes.list();
   * for (const sandbox of sandboxes) {
   *   console.log(sandbox.emailAddress);
   * }
   * ```
   */
  async list(): Promise<SandboxListResponse> {
    return this.http.get<SandboxListResponse>("/sandboxes");
  }

  /**
   * Create a new sandbox
   *
   * @example
   * ```typescript
   * const sandbox = await client.sandboxes.create({
   *   name: 'my-test-sandbox'
   * });
   * console.log(sandbox.emailAddress);
   * ```
   */
  async create(params: CreateSandboxParams): Promise<Sandbox> {
    return this.http.post<Sandbox>("/sandboxes", params);
  }

  /**
   * Create a temporary sandbox that auto-deletes after specified duration
   *
   * @param params.duration Duration in seconds (max 60)
   * @param params.name Optional name for the sandbox
   *
   * @example
   * ```typescript
   * const sandbox = await client.sandboxes.createTemporary({
   *   duration: 30 // Deletes after 30 seconds
   * });
   * ```
   */
  async createTemporary(params: CreateTemporarySandboxParams): Promise<Sandbox> {
    return this.http.post<Sandbox>("/sandboxes/temporary", params);
  }

  /**
   * Get a sandbox by ID
   *
   * @example
   * ```typescript
   * const sandbox = await client.sandboxes.get('sandbox-id');
   * console.log(sandbox.name, sandbox.emailCount);
   * ```
   */
  async get(id: string): Promise<Sandbox> {
    return this.http.get<Sandbox>(`/sandboxes/${encodeURIComponent(id)}`);
  }

  /**
   * Update a sandbox
   *
   * @example
   * ```typescript
   * const updated = await client.sandboxes.update('sandbox-id', {
   *   name: 'new-name'
   * });
   * ```
   */
  async update(id: string, params: UpdateSandboxParams): Promise<Sandbox> {
    return this.http.patch<Sandbox>(`/sandboxes/${encodeURIComponent(id)}`, params);
  }

  /**
   * Delete a sandbox
   *
   * @example
   * ```typescript
   * await client.sandboxes.delete('sandbox-id');
   * ```
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/sandboxes/${encodeURIComponent(id)}`);
  }
}
