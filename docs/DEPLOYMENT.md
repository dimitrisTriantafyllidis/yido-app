# YIDO Deployment Guide

## Prerequisites

1. **Azure Subscription** with permissions to create resources
2. **GitHub repository** with the code pushed
3. **Azure CLI** installed locally (for initial setup)

## GitHub Secrets

Configure these secrets in your GitHub repository (Settings → Secrets → Actions):

### Azure Authentication
- `AZURE_CREDENTIALS` - Service principal JSON (see below)

### Container Registry (set after first infra deployment)
- `ACR_LOGIN_SERVER` - e.g., `cryidoabc12345.azurecr.io`
- `ACR_USERNAME` - ACR admin username
- `ACR_PASSWORD` - ACR admin password

### Database
- `SQL_ADMIN_USERNAME` - SQL Server admin username
- `SQL_ADMIN_PASSWORD` - SQL Server admin password (strong, 16+ chars)
- `SQL_CONNECTION_STRING` - Full connection string (for migrations)

### Application Secrets
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `SENDGRID_API_KEY` - SendGrid API key
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key

### Frontend Environment
- `NEXT_PUBLIC_API_URL` - API URL (e.g., `https://ca-api-yido-staging.azurecontainerapps.io`)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key

## Initial Setup

### 1. Create Azure Service Principal

```bash
# Login to Azure
az login

# Create service principal with Contributor role
az ad sp create-for-rbac \
  --name "yido-github-actions" \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID> \
  --sdk-auth

# Copy the JSON output to AZURE_CREDENTIALS secret
```

### 2. First Deployment (Bootstrap)

For the first deployment, you need to:

1. Deploy infrastructure to create ACR:
   ```bash
   az group create --name rg-yido-staging --location westeurope
   
   az deployment group create \
     --resource-group rg-yido-staging \
     --template-file infra/main.bicep \
     --parameters \
       environmentName=staging \
       sqlAdminUsername=yidoadmin \
       sqlAdminPassword='<STRONG_PASSWORD>' \
       apiImageTag=placeholder \
       webImageTag=placeholder
   ```

2. Get ACR credentials:
   ```bash
   # Get ACR name from deployment output
   ACR_NAME=$(az deployment group show \
     --resource-group rg-yido-staging \
     --name main \
     --query properties.outputs.containerRegistryName.value -o tsv)
   
   # Get credentials
   az acr credential show --name $ACR_NAME
   ```

3. Add ACR credentials to GitHub secrets

4. Push placeholder images:
   ```bash
   az acr login --name $ACR_NAME
   
   # Tag and push a placeholder (first deployment only)
   docker pull mcr.microsoft.com/dotnet/samples:aspnetapp
   docker tag mcr.microsoft.com/dotnet/samples:aspnetapp $ACR_NAME.azurecr.io/yido-api:placeholder
   docker push $ACR_NAME.azurecr.io/yido-api:placeholder
   
   docker pull nginx:alpine
   docker tag nginx:alpine $ACR_NAME.azurecr.io/yido-web:placeholder
   docker push $ACR_NAME.azurecr.io/yido-web:placeholder
   ```

5. Trigger the GitHub Actions workflow

## Environments

### Staging
- Auto-deploys on push to `main`
- Resource group: `rg-yido-staging`
- Scale: 0-5 replicas (scales to zero when idle)

### Production
- Manual trigger via workflow_dispatch
- Resource group: `rg-yido-production`
- Configure separately with production secrets

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Container Apps                     │
├─────────────────────────────┬───────────────────────────────┤
│     ca-api-yido-staging     │     ca-web-yido-staging       │
│     (ASP.NET Core API)      │     (Next.js Frontend)        │
│     Port 8080               │     Port 3000                 │
└──────────────┬──────────────┴───────────────┬───────────────┘
               │                              │
               ▼                              │
┌──────────────────────────┐                  │
│    Azure SQL Database    │                  │
│    yido-staging          │                  │
└──────────────────────────┘                  │
               │                              │
               ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Azure Blob Storage                         │
│                    (uploads container)                        │
└──────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│      Azure Key Vault     │
│  (secrets management)    │
└──────────────────────────┘
```

## Monitoring

- **Application Insights**: Automatically configured for API telemetry
- **Log Analytics**: Container logs and metrics
- **Hangfire Dashboard**: Available at `/hangfire` (development only)

## Costs (Estimated Monthly - Staging)

| Resource | SKU | Est. Cost |
|----------|-----|-----------|
| Container Apps | Consumption | ~$5-20 |
| Azure SQL | Basic (2GB) | ~$5 |
| Blob Storage | Standard LRS | ~$1 |
| Container Registry | Basic | ~$5 |
| Log Analytics | Pay-per-GB | ~$2-5 |

Total: ~$20-40/month for staging (scales to zero when not in use)

## Troubleshooting

### Container won't start
```bash
# Check container logs
az containerapp logs show \
  --name ca-api-yido-staging \
  --resource-group rg-yido-staging \
  --follow
```

### Database connection issues
```bash
# Test SQL connectivity
az containerapp exec \
  --name ca-api-yido-staging \
  --resource-group rg-yido-staging \
  --command "dotnet InvitationPlatform.Api.dll --info"
```

### Image pull failures
```bash
# Verify ACR access
az acr repository list --name <ACR_NAME>
az acr repository show-tags --name <ACR_NAME> --repository yido-api
```

## DNS & Custom Domain

To add a custom domain (e.g., `api.yido.gr`):

```bash
# Add custom domain
az containerapp hostname add \
  --name ca-api-yido-staging \
  --resource-group rg-yido-staging \
  --hostname api.staging.yido.gr

# Configure managed certificate
az containerapp hostname bind \
  --name ca-api-yido-staging \
  --resource-group rg-yido-staging \
  --hostname api.staging.yido.gr \
  --environment cae-yido-staging \
  --validation-method CNAME
```

## Rollback

To rollback to a previous version:

```bash
# List revisions
az containerapp revision list \
  --name ca-api-yido-staging \
  --resource-group rg-yido-staging \
  --output table

# Activate previous revision
az containerapp revision activate \
  --name ca-api-yido-staging \
  --resource-group rg-yido-staging \
  --revision <REVISION_NAME>
```
