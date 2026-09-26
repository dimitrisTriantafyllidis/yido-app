using InvitationPlatform.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace InvitationPlatform.Api.Tests;

/// <summary>
/// Boots the API with EF InMemory so tests run on Linux CI without LocalDB/SQL Server.
/// </summary>
public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            foreach (var descriptor in services
                         .Where(d =>
                             d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                             d.ServiceType == typeof(IDbContextOptionsConfiguration<ApplicationDbContext>))
                         .ToList())
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("InvitationPlatformApiTests"));
        });
    }
}
