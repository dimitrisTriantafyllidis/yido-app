param(
    [string]$Email = "elenichapsa@gmail.com",
    [string]$ConnectionString = "Server=(localdb)\mssqllocaldb;Database=InvitationPlatform;Integrated Security=true;TrustServerCertificate=True"
)

Write-Host "=== Checking events for $Email ===" -ForegroundColor Cyan
Write-Host ""

try {
    # Find user and tenant
    $userQuery = @"
SELECT TOP 1 
    u.Id as UserId, 
    u.Email,
    ut.TenantId,
    t.Name as TenantName
FROM AspNetUsers u
LEFT JOIN UserTenants ut ON u.Id = ut.UserId
LEFT JOIN Tenants t ON ut.TenantId = t.Id
WHERE u.Email = '$Email'
"@

    $user = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $userQuery -ErrorAction Stop
    
    if ($null -eq $user) {
        Write-Host "❌ User not found with email: $Email" -ForegroundColor Red
        exit
    }

    Write-Host "✓ User found:" -ForegroundColor Green
    Write-Host "  Email: $($user.Email)"
    Write-Host "  UserId: $($user.UserId)"
    Write-Host "  TenantId: $($user.TenantId)"
    Write-Host "  TenantName: $($user.TenantName)"
    Write-Host ""

    # Find events for this tenant
    $eventsQuery = @"
SELECT 
    e.Id,
    e.Title,
    e.Status,
    e.Slug,
    e.PublishedAt,
    e.CreatedAt,
    (SELECT COUNT(*) FROM InvitationVersions iv WHERE iv.EventId = e.Id) as VersionCount,
    (SELECT TOP 1 iv2.IsPublished FROM InvitationVersions iv2 WHERE iv2.EventId = e.Id ORDER BY iv2.VersionNumber DESC) as LatestVersionPublished,
    (SELECT COUNT(*) FROM Subscriptions s WHERE s.EventId = e.Id AND s.Status = 2) as ActiveSubscriptions
FROM Events e
WHERE e.TenantId = '$($user.TenantId)' AND e.IsDeleted = 0
ORDER BY e.CreatedAt DESC
"@

    $events = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $eventsQuery -ErrorAction Stop
    
    if ($events.Count -eq 0) {
        Write-Host "❌ No events found for this tenant" -ForegroundColor Red
        exit
    }

    Write-Host "✓ Found $($events.Count) event(s):" -ForegroundColor Green
    Write-Host ""

    foreach ($event in $events) {
        $statusName = switch ($event.Status) {
            1 { "Draft" }
            2 { "Preview" }
            3 { "Published" }
            4 { "Expired" }
            5 { "Archived" }
            default { "Unknown" }
        }

        Write-Host "Event: $($event.Title)" -ForegroundColor Yellow
        Write-Host "  ID: $($event.Id)"
        Write-Host "  Status: $statusName ($($event.Status))"
        Write-Host "  Slug: $($event.Slug)"
        Write-Host "  Published At: $($event.PublishedAt)"
        Write-Host "  Invitation Versions: $($event.VersionCount)"
        Write-Host "  Latest Version Published: $($event.LatestVersionPublished)"
        Write-Host "  Active Subscriptions: $($event.ActiveSubscriptions)"
        
        if ($event.Status -eq 3 -and $event.LatestVersionPublished -eq $true -and $event.Slug) {
            Write-Host "  ✓ Public URL: http://localhost:3000/e/$($event.Slug)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ Not publicly accessible:" -ForegroundColor Yellow
            if ($event.Status -ne 3) { Write-Host "    - Event status is not Published" }
            if ($event.LatestVersionPublished -ne $true) { Write-Host "    - Invitation not published" }
            if (-not $event.Slug) { Write-Host "    - No slug assigned" }
        }
        Write-Host ""
    }

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure SQL Server LocalDB is running and the database exists." -ForegroundColor Yellow
    Write-Host "You may need to run: dotnet ef database update" -ForegroundColor Yellow
}
