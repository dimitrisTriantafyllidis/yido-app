# YIDO API - Multi-stage Docker build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY src/InvitationPlatform.Domain/*.csproj src/InvitationPlatform.Domain/
COPY src/InvitationPlatform.Application/*.csproj src/InvitationPlatform.Application/
COPY src/InvitationPlatform.Infrastructure/*.csproj src/InvitationPlatform.Infrastructure/
COPY src/InvitationPlatform.Api/*.csproj src/InvitationPlatform.Api/

RUN dotnet restore src/InvitationPlatform.Api/InvitationPlatform.Api.csproj

COPY src/InvitationPlatform.Domain/ src/InvitationPlatform.Domain/
COPY src/InvitationPlatform.Application/ src/InvitationPlatform.Application/
COPY src/InvitationPlatform.Infrastructure/ src/InvitationPlatform.Infrastructure/
COPY src/InvitationPlatform.Api/ src/InvitationPlatform.Api/

RUN dotnet publish src/InvitationPlatform.Api/InvitationPlatform.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
EXPOSE 8080

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

COPY --from=build /app/publish .

RUN chown -R appuser:appgroup /app
USER appuser

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "InvitationPlatform.Api.dll"]
