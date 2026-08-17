FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY src/InvitationPlatform.Domain ./InvitationPlatform.Domain
COPY src/InvitationPlatform.Application ./InvitationPlatform.Application
COPY src/InvitationPlatform.Infrastructure ./InvitationPlatform.Infrastructure
COPY src/InvitationPlatform.Api ./InvitationPlatform.Api
RUN dotnet restore InvitationPlatform.Api/InvitationPlatform.Api.csproj
RUN dotnet publish InvitationPlatform.Api/InvitationPlatform.Api.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "InvitationPlatform.Api.dll"]
