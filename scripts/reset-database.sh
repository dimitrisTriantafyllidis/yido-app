#!/bin/bash
# Drop and recreate the database, apply migrations
cd "$(dirname "$0")/.."
dotnet ef database drop --project src/InvitationPlatform.Infrastructure --startup-project src/InvitationPlatform.Api --force
dotnet ef database update --project src/InvitationPlatform.Infrastructure --startup-project src/InvitationPlatform.Api
echo "Database reset complete. Run the API to seed demo data."
