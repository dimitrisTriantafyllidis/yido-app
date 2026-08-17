#!/bin/bash
# Apply EF Core migrations to LocalDB
cd "$(dirname "$0")/.."
dotnet ef database update --project src/InvitationPlatform.Infrastructure --startup-project src/InvitationPlatform.Api
