FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/InvitationPlatform.Domain/InvitationPlatform.Domain.csproj", "src/InvitationPlatform.Domain/"]
COPY ["src/InvitationPlatform.Application/InvitationPlatform.Application.csproj", "src/InvitationPlatform.Application/"]
COPY ["src/InvitationPlatform.Infrastructure/InvitationPlatform.Infrastructure.csproj", "src/InvitationPlatform.Infrastructure/"]
COPY ["src/InvitationPlatform.Worker/InvitationPlatform.Worker.csproj", "src/InvitationPlatform.Worker/"]
RUN dotnet restore "src/InvitationPlatform.Worker/InvitationPlatform.Worker.csproj"

COPY src/ src/
WORKDIR /src/src/InvitationPlatform.Worker
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "InvitationPlatform.Worker.dll"]
