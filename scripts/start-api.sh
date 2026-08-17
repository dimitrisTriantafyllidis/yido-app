#!/bin/bash
# Start the ASP.NET Core API on port 5000
cd "$(dirname "$0")/.."
dotnet run --project src/InvitationPlatform.Api --urls "http://localhost:5000"
