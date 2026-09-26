using 'main.bicep'

// Staging environment parameters
// Secrets should be provided via GitHub Actions secrets, not committed to source control

param environmentName = 'staging'
param location = 'westeurope'

// These will be overridden by GitHub Actions deployment
param sqlAdminUsername = ''
param sqlAdminPassword = ''
param stripeSecretKey = ''
param sendGridApiKey = ''
param turnstileSecretKey = ''
param apiImageTag = 'latest'
param webImageTag = 'latest'
