@AGENTS.md

# YIDO - Your Important Day Online

Multi-tenant SaaS platform for digital invitations (weddings, baptisms, parties, corporate events). Greek market focus.

## Tech Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Radix UI
- **Backend:** ASP.NET Core Web API (.NET 9, modular monolith) + C# + Entity Framework Core 9
- **Database:** SQL Server (LocalDB for development)
- **Payments:** Stripe
- **Background Jobs:** Hangfire (SQL Server storage) — not yet implemented
- **File Storage:** Azure Blob Storage (local filesystem for now) — not yet implemented
- **Email:** SendGrid (not yet implemented)
- **Hosting:** Azure (Container Apps, Azure SQL, Blob Storage, Key Vault)

## Architecture
- Modular monolith: Domain → Application → Infrastructure → Api / Worker
- Multi-tenant: shared database with TenantId discriminator + EF Core query filters
- BFF auth pattern: ASP.NET Core Identity with HttpOnly cookies
- Next.js is the frontend only — all business logic in ASP.NET Core

## Solution Structure
```
src/
  InvitationPlatform.Domain/        # Entities, value objects, domain rules (no infra deps)
  InvitationPlatform.Application/   # Use cases, commands, queries, DTOs (empty, to be built)
  InvitationPlatform.Infrastructure/ # EF Core, Identity, storage, email, Stripe
  InvitationPlatform.Api/           # REST API, auth, OpenAPI/Swagger
  InvitationPlatform.Worker/        # Background jobs (skeleton)
  InvitationPlatform.Web/           # Next.js 16 frontend (Tailwind v4)
tests/
  InvitationPlatform.Domain.Tests/
  InvitationPlatform.Application.Tests/
  InvitationPlatform.Api.Tests/
```

## Key Conventions
- Every tenant-owned entity has TenantId — never trust client-sent TenantId
- Event slugs for public URLs: `/e/{slug}`
- Package tiers: Mini (49 EUR), Digital (99 EUR), Video (179 EUR)
- Greek locale default, English supported
- All API errors use ProblemDetails (RFC 7807)
- Feature entitlements checked server-side, never only in frontend
- Three distinct UI contexts: public invitation (editorial), customer portal (guided), admin portal (operational)
- Design tokens: deep sage green accent (#2E5A4C), off-white bg (#FAFAF7)
- Fonts: Inter (sans, Greek) + Literata (display/serif, Greek)

## Local Development (no Docker)
- **Database:** SQL Server LocalDB — connection string in `src/InvitationPlatform.Api/appsettings.Development.json`
- **API:** `dotnet run --project src/InvitationPlatform.Api --urls "http://localhost:5000"`
- **Frontend:** `cd src/InvitationPlatform.Web && npm run dev`
- **Swagger:** http://localhost:5000/swagger
- **Migrations:** `dotnet ef database update --project src/InvitationPlatform.Infrastructure --startup-project src/InvitationPlatform.Api`
- **Reset DB:** `scripts/reset-database.sh`
- Seed data runs automatically on API startup in Development mode

## Seed Data
- Admin: admin@yido.gr / Admin123!
- Customer: maria@example.com / Demo123!
- Tenant: "Μαρία & Γιώργος" (slug: maria-giorgos)
- Event: Wedding, 2027-09-18, Published (slug: maria-giorgos-gamos)
- Venues: Ιερός Ναός Αγίου Νικολάου, Κτήμα Ελαιών
- Event persons: Bride, Groom, Best Man, Maid of Honor

## Documentation
- Technical plan: `docs/TECHNICAL-PLAN.md`
