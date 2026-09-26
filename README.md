# YIDO — Your Important Day Online

Multi-tenant SaaS for digital invitations. Current stack:

- **Frontend:** `src/InvitationPlatform.Web` (Next.js)
- **Backend:** `src/InvitationPlatform.Api` (ASP.NET Core)
- **Database:** SQL Server LocalDB

## Local run

```powershell
dotnet run --project src/InvitationPlatform.Api --urls "http://localhost:5000"
cd src/InvitationPlatform.Web
npm run dev
```

- App: http://localhost:3000
- API / Swagger: http://localhost:5000/swagger

See `CLAUDE.md` and `docs/DEPLOYMENT.md` for seed users, migrations, and Azure.
