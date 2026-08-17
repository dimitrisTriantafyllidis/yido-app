FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY src/InvitationPlatform.Domain ./InvitationPlatform.Domain
COPY src/InvitationPlatform.Application ./InvitationPlatform.Application
COPY src/InvitationPlatform.Infrastructure ./InvitationPlatform.Infrastructure
COPY src/InvitationPlatform.Worker ./InvitationPlatform.Worker
RUN dotnet restore InvitationPlatform.Worker/InvitationPlatform.Worker.csproj
RUN dotnet publish InvitationPlatform.Worker/InvitationPlatform.Worker.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "InvitationPlatform.Worker.dll"]
