using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace InvitationPlatform.Api.Tests;

public class HealthCheckTests(ApiWebApplicationFactory factory) : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task HealthEndpoint_ReturnsOk()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PackagesEndpoint_ReturnsOk_WithoutAuth()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/v1/packages");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_ReturnsUnauthorized_WithoutAuth()
    {
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        var response = await client.GetAsync("/api/v1/events");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_ReturnsUnauthorized_WithoutAuth()
    {
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        var response = await client.GetAsync("/api/v1/admin/dashboard");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TemplatesEndpoint_ReturnsUnauthorized_WithoutAuth()
    {
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        var response = await client.GetAsync("/api/v1/templates");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
