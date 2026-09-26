# YIDO API - Multi-stage Docker build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln .
COPY src/InvitationPlatform.Domain/*.csproj src/InvitationPlatform.Domain/
COPY src/InvitationPlatform.Application/*.csproj src/InvitationPlatform.Application/
COPY src/InvitationPlatform.Infrastructure/*.csproj src/InvitationPlatform.Infrastructure/
COPY src/InvitationPlatform.Api/*.csproj src/InvitationPlatform.Api/
COPY tests/InvitationPlatform.Domain.Tests/*.csproj tests/InvitationPlatform.Domain.Tests/
COPY tests/InvitationPlatform.Application.Tests/*.csproj tests/InvitationPlatform.Application.Tests/
COPY tests/InvitationPlatform.Api.Tests/*.csproj tests/InvitationPlatform.Api.Tests/

# Restore dependencies
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish src/InvitationPlatform.Api/InvitationPlatform.Api.csproj -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 8080

# Create non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Copy published app
COPY --from=build /app/publish .

# Set ownership and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

ENTRYPOINT ["dotnet", "InvitationPlatform.Api.dll"]
