FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/InvitationPlatform.Domain/InvitationPlatform.Domain.csproj", "src/InvitationPlatform.Domain/"]
COPY ["src/InvitationPlatform.Application/InvitationPlatform.Application.csproj", "src/InvitationPlatform.Application/"]
COPY ["src/InvitationPlatform.Infrastructure/InvitationPlatform.Infrastructure.csproj", "src/InvitationPlatform.Infrastructure/"]
COPY ["src/InvitationPlatform.Api/InvitationPlatform.Api.csproj", "src/InvitationPlatform.Api/"]
RUN dotnet restore "src/InvitationPlatform.Api/InvitationPlatform.Api.csproj"

COPY src/ src/
WORKDIR /src/src/InvitationPlatform.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "InvitationPlatform.Api.dll"]
