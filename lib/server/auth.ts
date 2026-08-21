import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureSchema, getSql } from "./db";
import { isLocalMode } from "./config";

export type PublicUser = { id: string; email: string; displayName: string };
type AppUserRow = { id: string; email: string; display_name: string };

export type AppSession = {
  sql: ReturnType<typeof getSql>;
  clerkUserId: string;
  user: PublicUser;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isHostedAuthConfigured() {
  return !isLocalMode() && Boolean(
    process.env.DATABASE_URL
      && process.env.CLERK_SECRET_KEY
      && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      && process.env.STACKBRIDGE_ADMIN_EMAIL,
  );
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
  const rawEmail = clerkUser?.emailAddresses.find((entry) => entry.id === clerkUser.primaryEmailAddressId)?.emailAddress
    || clerkUser?.emailAddresses[0]?.emailAddress
    || `${userId}@clerk.local`;
  const email = normalizeEmail(rawEmail);
  const displayName = clerkUser?.fullName || clerkUser?.firstName || email.split("@")[0] || "Learner";
  const rows = await sql`
    INSERT INTO app_users (id, email, display_name)
    VALUES (${crypto.randomUUID()}, ${email}, ${displayName})
    ON CONFLICT (email)
    DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = NOW()
    RETURNING id, email, display_name
  ` as unknown as AppUserRow[];

  return { sql, clerkUserId: userId, user: publicUser(rows[0]) };
}

export function publicUser(row: AppUserRow): PublicUser {
  return { id: row.id, email: row.email, displayName: row.display_name };
}
