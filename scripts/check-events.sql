-- Check user and events for elenichapsa@gmail.com

PRINT '=== User Info ==='
SELECT TOP 1 
    u.Id as UserId, 
    u.Email,
    ut.TenantId,
    t.Name as TenantName
FROM Users u
LEFT JOIN UserTenants ut ON u.Id = ut.UserId
LEFT JOIN Tenants t ON ut.TenantId = t.Id
WHERE u.Email = 'elenichapsa@gmail.com'

PRINT ''
PRINT '=== Events for this user ==='
SELECT 
    e.Id,
    e.Title,
    e.Status,
    e.Slug,
    e.PublishedAt,
    (SELECT COUNT(*) FROM InvitationVersions iv WHERE iv.EventId = e.Id) as InvitationVersions,
    (SELECT TOP 1 iv2.IsPublished FROM InvitationVersions iv2 WHERE iv2.EventId = e.Id ORDER BY iv2.VersionNumber DESC) as LatestPublished,
    (SELECT COUNT(*) FROM Subscriptions s WHERE s.EventId = e.Id AND s.Status = 2) as ActiveSubs
FROM Events e
WHERE e.TenantId = (
    SELECT TOP 1 ut.TenantId 
    FROM Users u
    JOIN UserTenants ut ON u.Id = ut.UserId
    WHERE u.Email = 'elenichapsa@gmail.com'
)
AND e.IsDeleted = 0
ORDER BY e.CreatedAt DESC
