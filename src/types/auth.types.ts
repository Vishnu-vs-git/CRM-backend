export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "AGENT";

export interface AuthContext {
  tenantId: string;
  userId: string;
  role: UserRole;
}
