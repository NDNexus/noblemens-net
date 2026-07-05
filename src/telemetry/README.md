# Telemetry

> [!NOTE]
>
> This directory is named `telemetry` because some antivirus software *(Kaspersky)*
> incorrectly blocks local development modules named `analytics`.
>
> The public API and documentation continue to use the term
> "analytics", since that best reflects the module's purpose.
> 

---

A provider-agnostic analytics module for the Noblemens website.

The application tracks business events through a single public API. Analytics providers (such as Google Analytics) are implementation details hidden behind adapters.

This separation keeps application code independent from third-party analytics services and makes future providers easy to add without changing existing tracking calls.

---

## Architecture

```
Application
        │
        ▼
 Public Events API
        │
        ▼
 Analytics Provider
        │
        ▼
 Google Analytics 4
```

The application never communicates directly with Google Analytics.

---

## Directory Structure

```
analytics/

├── README.md
├── types.ts
├── config.ts
├── debug.ts
├── ga4.ts
├── events.ts
└── init.ts
```

---

## Responsibilities

### `types.ts`

Shared analytics types and interfaces.

Contains no implementation.

---

### `config.ts`

Analytics configuration.

Examples include provider enablement, measurement IDs, and debug settings.

Contains no logic.

---

### `debug.ts`

Development-only logging utilities.

Used internally by analytics modules.

---

### `ga4.ts`

Google Analytics 4 adapter.

Responsible only for communicating with GA4.

Must not contain business logic.

---

### `events.ts`

Public analytics API.

Exposes business-focused tracking methods such as:

- Product viewed
- WhatsApp clicked
- Phone clicked
- Email clicked
- Article read

The rest of the application should only interact with this file.

---

### `init.ts`

Initializes analytics providers during application startup.

Performs startup checks and provider initialization.

---

## Design Principles

- Provider-agnostic architecture
- Single Responsibility Principle
- Strict TypeScript
- No business logic inside providers
- No direct `gtag()` usage outside `ga4.ts`
- Business events exposed through `events.ts`
- Production-ready and easily testable

---

## Adding a New Provider

To add another analytics platform:

1. Create a provider adapter.
2. Keep provider-specific logic inside that adapter.
3. Reuse the public API exposed by `events.ts`.
4. Initialize the provider from `init.ts`.

No application code should require changes.