#!/bin/bash
# Run all .NET tests
cd "$(dirname "$0")/.."
dotnet test InvitationPlatform.sln
