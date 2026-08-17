# YIDO Operator Guide

Short runbook for local and early Azure operations.

## Local stack

- **API:** `dotnet run --project src/InvitationPlatform.Api --urls "http://localhost:5000"`
- **Web:** `cd src/InvitationPlatform.Web && npm run dev`
- **Worker:** `dotnet run --project src/InvitationPlatform.Worker`
- **DB:** SQL Server LocalDB (see `appsettings.Development.json`) or Docker Compose `sqlserver`
- **Mail:** Mailpit on `:1025` SMTP / `:8025` UI (`docker compose up mailpit`)
- **Swagger:** http://localhost:5000/swagger
- **Hangfire:** http://localhost:5000/hangfire (Development)

### Migrations

```bash
dotnet ef database update --project src/InvitationPlatform.Infrastructure --startup-project src/InvitationPlatform.Api
```

### Seed accounts (Development)

- Admin: `admin@yido.gr` / `Admin123!`
- Customer: `maria@example.com` / `Demo123!`

## Docker Compose

```bash
docker compose up --build
```

Services: SQL Server, Mailpit, API (`:5000`), Web (`:3000`), Worker.

## Background jobs

- **API Hangfire:** daily recurring `expire-events-subscriptions`
- **Worker:** hourly expiry via scoped `ApplicationDbContext`
- Email jobs: RSVP confirmation, password reset, email verification (SMTP / Mailpit)

## Feature entitlements

Effective features = active subscription package + `TenantFeatureOverrides` (admin can POST overrides).

Publish requires active subscription or non-empty effective features.

## Impersonation

`POST /api/v1/admin/impersonate/{tenantId}` adds cookie claim `ImpersonatedTenantId`.
`POST ...?stop=true` clears it. Middleware prefers the claim for tenant resolution.

## Azure (stubs)

See `infra/main.bicep` — Container Apps environment + placeholder API app.
Wire ACR images, Azure SQL, Key Vault secrets, and Blob storage before production.

## Stripe

Set `Stripe:SecretKey`, `Stripe:WebhookSecret`, and optional Price IDs.
Without Stripe, checkout returns a **dev-complete** URL that activates the order.

## Health

`GET /api/v1/health` — liveness for Container Apps probes.
