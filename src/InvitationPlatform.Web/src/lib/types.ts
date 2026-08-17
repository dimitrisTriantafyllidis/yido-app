export interface TenantInfo {
  tenantId: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  locale: string;
  isSystemAdmin: boolean;
  currentTenant: TenantInfo | null;
}
