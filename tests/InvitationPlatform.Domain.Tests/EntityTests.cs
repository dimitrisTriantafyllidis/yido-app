using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Tests;

public class EventTests
{
    [Fact]
    public void Event_DefaultStatus_IsDraft()
    {
        var ev = new Event();
        Assert.Equal(EventStatus.Draft, ev.Status);
    }

    [Fact]
    public void Event_DefaultTimezone_IsAthens()
    {
        var ev = new Event();
        Assert.Equal("Europe/Athens", ev.Timezone);
    }

    [Fact]
    public void Event_DefaultLocale_IsGreek()
    {
        var ev = new Event();
        Assert.Equal("el", ev.Locale);
    }

    [Fact]
    public void Event_ImplementsITenantEntity()
    {
        var ev = new Event();
        Assert.IsAssignableFrom<Common.ITenantEntity>(ev);
    }

    [Fact]
    public void Event_ImplementsISoftDeletable()
    {
        var ev = new Event();
        Assert.IsAssignableFrom<Common.ISoftDeletable>(ev);
        Assert.False(ev.IsDeleted);
    }

    [Fact]
    public void Event_NavigationCollections_InitializedEmpty()
    {
        var ev = new Event();
        Assert.Empty(ev.Venues);
        Assert.Empty(ev.Persons);
        Assert.Empty(ev.Guests);
        Assert.Empty(ev.Rsvps);
    }
}

public class TenantTests
{
    [Fact]
    public void Tenant_DefaultStatus_IsActive()
    {
        var tenant = new Tenant();
        Assert.Equal(TenantStatus.Active, tenant.Status);
    }

    [Fact]
    public void Tenant_DefaultLocale_IsGreek()
    {
        var tenant = new Tenant();
        Assert.Equal("el", tenant.Locale);
    }

    [Fact]
    public void Tenant_ImplementsISoftDeletable()
    {
        var tenant = new Tenant();
        Assert.IsAssignableFrom<Common.ISoftDeletable>(tenant);
    }
}

public class PackageTests
{
    [Fact]
    public void Package_DefaultCurrency_IsEUR()
    {
        var pkg = new Package();
        Assert.Equal("EUR", pkg.PriceCurrency);
    }

    [Fact]
    public void Package_DefaultIsActive_True()
    {
        var pkg = new Package();
        Assert.True(pkg.IsActive);
    }

    [Fact]
    public void Package_PackageFeatures_InitializedEmpty()
    {
        var pkg = new Package();
        Assert.Empty(pkg.PackageFeatures);
    }
}

public class SubscriptionTests
{
    [Fact]
    public void Subscription_DefaultStatus_IsPending()
    {
        var sub = new Subscription();
        Assert.Equal(SubscriptionStatus.Pending, sub.Status);
    }

    [Fact]
    public void Subscription_ImplementsITenantEntity()
    {
        var sub = new Subscription();
        Assert.IsAssignableFrom<Common.ITenantEntity>(sub);
    }
}

public class OrderTests
{
    [Fact]
    public void Order_DefaultStatus_IsPending()
    {
        var order = new Order();
        Assert.Equal(OrderStatus.Pending, order.Status);
    }

    [Fact]
    public void Order_DefaultCurrency_IsEUR()
    {
        var order = new Order();
        Assert.Equal("EUR", order.Currency);
    }
}

public class GuestTests
{
    [Fact]
    public void Guest_DefaultNotDeleted()
    {
        var guest = new Guest();
        Assert.False(guest.IsDeleted);
    }

    [Fact]
    public void Guest_DefaultPlusOnes_IsZero()
    {
        var guest = new Guest();
        Assert.Equal(0, guest.AllowedPlusOnes);
    }
}

public class MediaFileTests
{
    [Fact]
    public void MediaFile_ImplementsITenantEntity()
    {
        var media = new MediaFile();
        Assert.IsAssignableFrom<Common.ITenantEntity>(media);
    }

    [Fact]
    public void MediaFile_DefaultModeration_False()
    {
        var media = new MediaFile();
        Assert.False(media.IsModerated);
        Assert.False(media.IsFlagged);
    }
}
