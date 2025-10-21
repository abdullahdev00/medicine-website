import { getCurrentUser as getSupabaseUser } from "../auth-client";

export async function getCurrentUser() {
  return await getSupabaseUser();
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if ((user as any).role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}
