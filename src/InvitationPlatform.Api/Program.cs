using System.Threading.RateLimiting;
using Hangfire;
using Hangfire.SqlServer;
using InvitationPlatform.Api.Middleware;
using InvitationPlatform.Infrastructure;
using InvitationPlatform.Infrastructure.Jobs;
using InvitationPlatform.Infrastructure.Persistence;
using InvitationPlatform.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAntiforgery();

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>(name: "db", tags: ["db", "ready"]);

// File storage: Azure Blob in Staging/Production, local disk in Development
var storageProvider = builder.Configuration["Storage:Provider"]?.ToLowerInvariant();
var blobConnection =
    builder.Configuration["Storage:Azure:ConnectionString"]
    ?? builder.Configuration["Storage:AzureBlob:ConnectionString"];
var useAzureBlob =
    !string.IsNullOrWhiteSpace(blobConnection)
    && storageProvider is "azure" or "azureblob";

if (useAzureBlob)
{
    builder.Services.AddSingleton<IFileStorageService>(
        new AzureBlobStorageService(
            blobConnection!,
            builder.Configuration["Storage:Azure:ContainerName"]
                ?? builder.Configuration["Storage:AzureBlob:ContainerName"]
                ?? "uploads",
            builder.Configuration["Storage:Azure:CdnBaseUrl"]
                ?? builder.Configuration["Storage:AzureBlob:CdnBaseUrl"],
            builder.Configuration.GetValue("Storage:Azure:UseSasUrls", false)
                || builder.Configuration.GetValue("Storage:AzureBlob:UseSasUrls", false),
            builder.Configuration.GetValue<TimeSpan?>("Storage:Azure:SasExpiry")
        ));
}
else
{
    var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
    Directory.CreateDirectory(uploadsPath);
    builder.Services.AddSingleton<IFileStorageService>(
        new LocalFileStorageService(uploadsPath, builder.Configuration.GetValue<string>("Frontend:ApiUrl") ?? "http://localhost:5000"));
}

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024;
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024;
});

// Hangfire uses SQL Server in real environments. Integration tests swap EF to
// InMemory and skip Hangfire so CI (Linux) never touches LocalDB.
var isTesting = builder.Environment.IsEnvironment("Testing");
var hangfireConnection = builder.Configuration.GetConnectionString("DefaultConnection");
var useHangfire = !isTesting && !string.IsNullOrWhiteSpace(hangfireConnection);
if (useHangfire)
{
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseSqlServerStorage(hangfireConnection, new SqlServerStorageOptions
        {
            CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
            SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
            QueuePollInterval = TimeSpan.Zero,
            UseRecommendedIsolationLevel = true,
            DisableGlobalLocks = true
        }));
    builder.Services.AddHangfireServer();
}

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global: 100 requests per minute per IP
    options.AddPolicy("global", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Auth: 10 login attempts per 15 min per IP
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(15)
            }));

    // Upload: 20 uploads per hour per IP
    options.AddPolicy("upload", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromHours(1)
            }));

    // Public RSVP: 5 per minute per IP
    options.AddPolicy("public-rsvp", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.AddPolicy("public-wishes", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetValue<string>("Frontend:Url") ?? "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "YIDO API"));

    await DatabaseSeeder.SeedAsync(app.Services);
}
else if (!app.Environment.IsEnvironment("Testing"))
{
    // TLS terminates at Container Apps ingress; the container speaks HTTP.
    app.UseHsts();
    await DatabaseSeeder.EnsureRolesAsync(app.Services);
}

app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<TenantResolutionMiddleware>();
app.MapControllers();

// Health check endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false
});
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

if (useHangfire)
{
    if (app.Environment.IsDevelopment())
        app.MapHangfireDashboard("/hangfire");

    app.Services.GetRequiredService<IRecurringJobManager>().AddOrUpdate<HangfireJobRunner>(
        "expire-events-subscriptions",
        j => j.ExpireEventsAndSubscriptions(),
        Cron.Daily);
}

app.Run();

// Make Program accessible for WebApplicationFactory in integration tests
public partial class Program { }
