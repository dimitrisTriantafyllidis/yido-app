// YIDO - Azure Infrastructure (staging/production)
// Resources: Container Apps, ACR, SQL, Blob Storage, Key Vault, App Insights

@description('Environment name (staging, production)')
param environmentName string = 'staging'

@description('Azure region for most resources')
param location string = resourceGroup().location

@description('Azure region for SQL. New subscriptions are often blocked in West Europe.')
param sqlLocation string = 'northeurope'

@description('SQL Server admin username')
@secure()
param sqlAdminUsername string

@description('SQL Server admin password')
@secure()
param sqlAdminPassword string

@description('Stripe secret key')
@secure()
param stripeSecretKey string = ''

@description('SendGrid API key')
@secure()
param sendGridApiKey string = ''

@description('Turnstile secret key')
@secure()
param turnstileSecretKey string = ''

@description('API container image tag')
param apiImageTag string = 'latest'

@description('Web container image tag')
param webImageTag string = 'latest'

var keyVaultName = 'kvyido${take(uniqueString(resourceGroup().id), 16)}'
// Container Apps secrets cannot be empty strings.
var stripeKeyValue = empty(stripeSecretKey) ? 'not-configured' : stripeSecretKey
var sendGridKeyValue = empty(sendGridApiKey) ? 'not-configured' : sendGridApiKey
var turnstileKeyValue = empty(turnstileSecretKey) ? 'not-configured' : turnstileSecretKey

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'log-yido-${environmentName}'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'ai-yido-${environmentName}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// Azure Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: 'cryido${take(uniqueString(resourceGroup().id), 8)}'
  location: location
  sku: { name: 'Basic' }
  properties: {
    adminUserEnabled: true
  }
}

// Azure SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: 'sql-yido-${environmentName}'
  location: sqlLocation
  properties: {
    administratorLogin: sqlAdminUsername
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// SQL Server Firewall - Allow Azure Services
resource sqlFirewallAzure 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Azure SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: 'yido-${environmentName}'
  location: sqlLocation
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  properties: {
    collation: 'Greek_CI_AS'
    maxSizeBytes: 2147483648
  }
}

// Storage Account for Blob Storage
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'styido${take(uniqueString(resourceGroup().id), 10)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// Blob Container for uploads
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${storageAccount.name}/default/uploads'
  properties: {
    publicAccess: 'Blob'
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
}

// Key Vault Secrets
resource secretSqlConnection 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'SqlConnectionString'
  properties: {
    value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${sqlDatabase.name};User ID=${sqlAdminUsername};Password=${sqlAdminPassword};Encrypt=True;TrustServerCertificate=False;'
  }
}

resource secretStripe 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (!empty(stripeSecretKey)) {
  parent: keyVault
  name: 'StripeSecretKey'
  properties: {
    value: stripeSecretKey
  }
}

resource secretSendGrid 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (!empty(sendGridApiKey)) {
  parent: keyVault
  name: 'SendGridApiKey'
  properties: {
    value: sendGridApiKey
  }
}

resource secretTurnstile 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (!empty(turnstileSecretKey)) {
  parent: keyVault
  name: 'TurnstileSecretKey'
  properties: {
    value: turnstileSecretKey
  }
}

// Container Apps Environment
resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-yido-${environmentName}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

var apiPublicUrl = 'https://ca-api-yido-${environmentName}.${containerAppEnv.properties.defaultDomain}'
var webPublicUrl = 'https://ca-web-yido-${environmentName}.${containerAppEnv.properties.defaultDomain}'

// API Container App
resource apiApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-api-yido-${environmentName}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        corsPolicy: {
          allowedOrigins: [webPublicUrl]
          allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: true
        }
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'sql-connection'
          value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${sqlDatabase.name};User ID=${sqlAdminUsername};Password=${sqlAdminPassword};Encrypt=True;TrustServerCertificate=False;'
        }
        {
          name: 'blob-connection'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'stripe-key'
          value: stripeKeyValue
        }
        {
          name: 'sendgrid-key'
          value: sendGridKeyValue
        }
        {
          name: 'turnstile-key'
          value: turnstileKeyValue
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${containerRegistry.properties.loginServer}/yido-api:${apiImageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'ASPNETCORE_ENVIRONMENT', value: environmentName == 'production' ? 'Production' : 'Staging' }
            { name: 'ConnectionStrings__DefaultConnection', secretRef: 'sql-connection' }
            { name: 'Frontend__Url', value: webPublicUrl }
            { name: 'Frontend__ApiUrl', value: apiPublicUrl }
            { name: 'Storage__Provider', value: 'azure' }
            { name: 'Storage__Azure__ConnectionString', secretRef: 'blob-connection' }
            { name: 'Storage__Azure__ContainerName', value: 'uploads' }
            { name: 'Email__Provider', value: empty(sendGridApiKey) ? 'smtp' : 'SendGrid' }
            { name: 'Email__SendGrid__ApiKey', secretRef: 'sendgrid-key' }
            { name: 'Email__From', value: 'noreply@yido.gr' }
            { name: 'Email__FromName', value: 'YIDO' }
            { name: 'Stripe__SecretKey', secretRef: 'stripe-key' }
            { name: 'Stripe__AllowDevBypass', value: 'false' }
            { name: 'Captcha__Turnstile__SecretKey', secretRef: 'turnstile-key' }
            { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// Web (Next.js) Container App
resource webApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-web-yido-${environmentName}'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: '${containerRegistry.properties.loginServer}/yido-web:${webImageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'NEXT_PUBLIC_API_URL', value: apiPublicUrl }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// Outputs
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output containerRegistryName string = containerRegistry.name
output apiFqdn string = apiApp.properties.configuration.ingress.fqdn
output webFqdn string = webApp.properties.configuration.ingress.fqdn
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output keyVaultName string = keyVault.name
