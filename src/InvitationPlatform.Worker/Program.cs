using InvitationPlatform.Infrastructure;
using InvitationPlatform.Infrastructure.Jobs;
using InvitationPlatform.Infrastructure.Persistence;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<ExpiryWorker>();

var host = builder.Build();
host.Run();

public class ExpiryWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<ExpiryWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await BackgroundJobs.ExpireEventsAndSubscriptions(db, logger, stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Expiry worker failed");
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
