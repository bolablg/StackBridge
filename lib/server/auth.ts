import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureSchema, getSql } from "./db";

export type PublicUser = { id: string; email: string; displayName: string };
type AppUserRow = { id: string; email: string; display_name: string };

export type AppSession = {
  sql: ReturnType<typeof getSql>;
  clerkUserId: string;
  user: PublicUser;
};

function isHostedAuthConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function hostedAuthConfigured() {
  return isHostedAuthConfigured();
}

export async function getAppSession(): Promise<AppSession | null> {
  if (!isHostedAuthConfigured()) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const sql = getSql();
  await ensureSchema(sql);
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)?.emailAddress
    || clerkUser?.emailAddresses[0]?.emailAddress
    || `${userId}@clerk.local`;
  const displayName = clerkUser?.fullName || clerkUser?.firstName || email.split("@")[0] || "Learner";
  const rows = await sql`
    INSERT INTO app_users (id, email, display_name)
    VALUES (${userId}, ${email}, ${displayName})
    ON CONFLICT (id)
    DO UPDATE SET email = EXCLUDED.email, display_name = EXCLUDED.display_name, updated_at = NOW()
    RETURNING id, email, display_name
  ` as unknown as AppUserRow[];

  return { sql, clerkUserId: userId, user: publicUser(rows[0]) };
}

export function publicUser(row: AppUserRow): PublicUser {
  return { id: row.id, email: row.email, displayName: row.display_name };
}
