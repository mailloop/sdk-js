# @mailloop/sdk

Official JavaScript/TypeScript SDK for the Mailloop API.

## Installation

```bash
npm install @mailloop/sdk
# or
yarn add @mailloop/sdk
# or
bun add @mailloop/sdk
```

## Quick Start

```typescript
import { MailloopClient } from '@mailloop/sdk';

const client = new MailloopClient({
  apiKey: 'ml_live_your_api_key_here'
});

// Create a sandbox
const sandbox = await client.sandboxes.create({ name: 'my-test' });
console.log(`Sandbox email: ${sandbox.emailAddress}`);

// Wait for an email to arrive
const email = await client.emails.waitFor(sandbox.id, {
  timeout: 30000,
  from: 'noreply@myapp.com'
});
console.log(`Received: ${email.subject}`);

// Clean up
await client.sandboxes.delete(sandbox.id);
```

## Features

- Full TypeScript support with complete type definitions
- Dual ESM and CommonJS builds
- Zero dependencies (uses native `fetch`)
- Long-polling email waiting with configurable timeouts
- Temporary sandboxes with auto-cleanup

## API Reference

### MailloopClient

Create a client instance:

```typescript
const client = new MailloopClient({
  apiKey: 'ml_live_...',     // Required: Your API token
  baseUrl: 'https://...',    // Optional: Custom API URL
  timeout: 30000             // Optional: Request timeout in ms (default: 30000)
});
```

### Sandboxes

#### List sandboxes

```typescript
const { sandboxes } = await client.sandboxes.list();
```

#### Create a sandbox

```typescript
const sandbox = await client.sandboxes.create({
  name: 'my-sandbox'
});
```

#### Create a temporary sandbox

Temporary sandboxes auto-delete after the specified duration (max 60 seconds):

```typescript
const sandbox = await client.sandboxes.createTemporary({
  duration: 30,  // Deletes after 30 seconds
  name: 'temp-test'
});
```

#### Get a sandbox

```typescript
const sandbox = await client.sandboxes.get('sandbox-id');
```

#### Update a sandbox

```typescript
const sandbox = await client.sandboxes.update('sandbox-id', {
  name: 'new-name'
});
```

#### Delete a sandbox

```typescript
await client.sandboxes.delete('sandbox-id');
```

### Emails

#### List emails in a sandbox

```typescript
const { emails, total } = await client.emails.list('sandbox-id', {
  limit: 20,   // Optional: Max emails to return (default: 20, max: 100)
  offset: 0,   // Optional: Number of emails to skip
  after: 'id'  // Optional: Return emails after this ID
});
```

#### Get email details

```typescript
const email = await client.emails.get('sandbox-id', 'email-id');
console.log(email.html);
console.log(email.attachments);
```

#### Wait for an email

Poll until an email arrives or timeout is reached:

```typescript
try {
  const email = await client.emails.waitFor('sandbox-id', {
    timeout: 30000,      // Optional: Max wait time in ms (default: 30000, max: 60000)
    from: 'sender@...',  // Optional: Filter by sender
    to: 'recipient@...', // Optional: Filter by recipient
    subject: 'Reset'     // Optional: Filter by subject substring
  });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('No email received within timeout');
  }
}
```

## Error Handling

The SDK throws typed errors for different failure scenarios:

```typescript
import {
  MailloopError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ValidationError
} from '@mailloop/sdk';

try {
  const email = await client.emails.waitFor('sandbox-id');
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Invalid or expired API token
  } else if (error instanceof PermissionError) {
    // Token lacks required permissions
  } else if (error instanceof NotFoundError) {
    // Sandbox or email not found
  } else if (error instanceof RateLimitError) {
    // Rate limit exceeded, retry after error.retryAfter seconds
  } else if (error instanceof TimeoutError) {
    // No email received within timeout
  } else if (error instanceof ValidationError) {
    // Invalid request parameters
  }
}
```

## License

MIT
