import { DEFAULT_PATH_KEY, ensureSchema, getSql, type Sql } from "./db";
import type { PublicUser } from "./auth";
import { getDataEnvironment } from "./config";

export const DEFAULT_ADMIN_EMAIL = "admin@example.com";

export type AccessRequestStatus = "pending" | "approved" | "denied";
export type AccessStatus = "allowed" | "pending" | "denied" | "not_requested";

export type AccessDecision = {
  status: AccessStatus;
  isAdmin: boolean;
  email: string;
  displayName: string;
  adminEmail: string;
  requestId?: string;
  requestedAt?: string;
};

export type PublicAccessRequest = {
  id: string;
  pathKey: string;
  clerkUserId: string;
  email: string;
  displayName: string;
  message: string;
  status: AccessRequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

type AccessRequestRow = {
  id: string;
  path_key: string;
  clerk_user_id: string;
  email: string;
  display_name: string;
  message: string | null;
  status: AccessRequestStatus;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function adminEmail() {
  return normalizeEmail(process.env.STACKBRIDGE_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL);
}

export function isAdminUser(user: PublicUser) {
  return normalizeEmail(user.email) === adminEmail();
}

function publicRequest(row: AccessRequestRow): PublicAccessRequest {
  return {
    id: row.id,
    pathKey: row.path_key,
    clerkUserId: row.clerk_user_id,
    email: row.email,
    displayName: row.display_name,
    message: row.message || "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  };
}

export async function getAccessDecision(user: PublicUser, clerkUserId: string, database = getSql()): Promise<AccessDecision> {
  await ensureSchema(database);

  const email = normalizeEmail(user.email);
  const environmentKey = getDataEnvironment();
  const isAdmin = email === adminEmail();
  if (isAdmin) {
    return { status: "allowed", isAdmin: true, email, displayName: user.displayName, adminEmail: adminEmail() };
  }

  const grants = await database`
    SELECT clerk_user_id
    FROM access_grants
    WHERE environment_key = ${environmentKey}
      AND path_key = ${DEFAULT_PATH_KEY}
      AND (
        clerk_user_id = ${clerkUserId}
        OR clerk_user_id = ${user.id}
        OR LOWER(email) = ${email}
      )
    LIMIT 1
  ` as unknown as Array<{ clerk_user_id: string }>;

  if (grants[0]) {
    return { status: "allowed", isAdmin: false, email, displayName: user.displayName, adminEmail: adminEmail() };
  }

  const requests = await database`
    SELECT id, status, created_at
    FROM access_requests
    WHERE environment_key = ${environmentKey}
      AND path_key = ${DEFAULT_PATH_KEY}
      AND (
        clerk_user_id = ${clerkUserId}
        OR clerk_user_id = ${user.id}
        OR LOWER(email) = ${email}
      )
    ORDER BY created_at DESC
    LIMIT 1
  ` as unknown as Array<{ id: string; status: AccessRequestStatus; created_at: string }>;

  const request = requests[0];
  if (request?.status === "pending") {
    return {
      status: "pending",
      isAdmin: false,
      email,
      displayName: user.displayName,
      adminEmail: adminEmail(),
      requestId: request.id,
      requestedAt: request.created_at,
    };
  }

  if (request?.status === "denied") {
    return {
      status: "denied",
      isAdmin: false,
      email,
      displayName: user.displayName,
      adminEmail: adminEmail(),
      requestId: request.id,
      requestedAt: request.created_at,
    };
  }

  return { status: "not_requested", isAdmin: false, email, displayName: user.displayName, adminEmail: adminEmail() };
}

async function notifyAdminOfRequest(request: PublicAccessRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ACCESS_REQUEST_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const message = [
    "A new StackBridge access request is waiting for review.",
    "",
    `Name: ${request.displayName}`,
    `Email: ${request.email}`,
    `Path: ${request.pathKey}`,
    `Requested: ${request.createdAt}`,
    `Message: ${request.message || "No message provided."}`,
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [adminEmail()],
        subject: `StackBridge access request from ${request.displayName}`,
        text: message,
      }),
    });

    if (!response.ok) {
      console.error("StackBridge access request email failed", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("StackBridge access request email failed", error);
    return false;
  }
}

export async function submitAccessRequest(user: PublicUser, clerkUserId: string, message: string, database = getSql()) {
  await ensureSchema(database);
  const environmentKey = getDataEnvironment();
  const existing = await database`
    SELECT id, path_key, clerk_user_id, email, display_name, message, status, created_at, updated_at, reviewed_at, reviewed_by
    FROM access_requests
    WHERE environment_key = ${environmentKey}
      AND path_key = ${DEFAULT_PATH_KEY}
      AND status = 'pending'
      AND (
        clerk_user_id = ${clerkUserId}
        OR clerk_user_id = ${user.id}
        OR LOWER(email) = ${normalizeEmail(user.email)}
      )
    LIMIT 1
  ` as unknown as AccessRequestRow[];

  if (existing[0]) {
    return { request: publicRequest(existing[0]), notificationSent: false, alreadyPending: true };
  }

  const id = crypto.randomUUID();
  const inserted = await database`
    INSERT INTO access_requests (
      id, path_key, environment_key, clerk_user_id, email, display_name, message, status
    )
    VALUES (
      ${id}, ${DEFAULT_PATH_KEY}, ${environmentKey}, ${clerkUserId}, ${normalizeEmail(user.email)}, ${user.displayName}, ${message || null}, 'pending'
    )
    ON CONFLICT DO NOTHING
    RETURNING id, path_key, clerk_user_id, email, display_name, message, status, created_at, updated_at, reviewed_at, reviewed_by
  ` as unknown as AccessRequestRow[];

  const request = inserted[0] || (await database`
    SELECT id, path_key, clerk_user_id, email, display_name, message, status, created_at, updated_at, reviewed_at, reviewed_by
    FROM access_requests
    WHERE environment_key = ${environmentKey}
      AND path_key = ${DEFAULT_PATH_KEY}
      AND status = 'pending'
      AND (
        clerk_user_id = ${clerkUserId}
        OR clerk_user_id = ${user.id}
        OR LOWER(email) = ${normalizeEmail(user.email)}
      )
    LIMIT 1
  ` as unknown as AccessRequestRow[])[0];

  if (!request) throw new Error("Could not create access request.");
  const notificationSent = await notifyAdminOfRequest(publicRequest(request));
  return { request: publicRequest(request), notificationSent, alreadyPending: false };
}

export async function listAccessRequests(database: Sql, status: AccessRequestStatus = "pending") {
  await ensureSchema(database);
  const environmentKey = getDataEnvironment();
  const rows = await database`
    SELECT id, path_key, clerk_user_id, email, display_name, message, status, created_at, updated_at, reviewed_at, reviewed_by
    FROM access_requests
    WHERE environment_key = ${environmentKey} AND path_key = ${DEFAULT_PATH_KEY} AND status = ${status}
    ORDER BY created_at ASC
  ` as unknown as AccessRequestRow[];
  return rows.map(publicRequest);
}

export async function reviewAccessRequest(
  database: Sql,
  reviewer: PublicUser,
  requestId: string,
  status: Extract<AccessRequestStatus, "approved" | "denied">,
) {
  await ensureSchema(database);
  const environmentKey = getDataEnvironment();
  const rows = await database`
    SELECT id, path_key, clerk_user_id, email, display_name, message, status, created_at, updated_at, reviewed_at, reviewed_by
    FROM access_requests
    WHERE id = ${requestId} AND environment_key = ${environmentKey} AND path_key = ${DEFAULT_PATH_KEY}
    LIMIT 1
  ` as unknown as AccessRequestRow[];
  const request = rows[0];
  if (!request) return null;

  if (status === "approved") {
    await database`
      INSERT INTO access_grants (path_key, environment_key, clerk_user_id, email, granted_by)
      VALUES (${request.path_key}, ${environmentKey}, ${request.clerk_user_id}, ${normalizeEmail(request.email)}, ${reviewer.id})
      ON CONFLICT (environment_key, path_key, clerk_user_id)
      DO UPDATE SET email = EXCLUDED.email, granted_by = EXCLUDED.granted_by, updated_at = NOW()
    `;
  }

  const updated = await database`
    UPDATE access_requests
    SET status = ${status}, updated_at = NOW(), reviewed_at = NOW(), reviewed_by = ${reviewer.id}
    WHERE id = ${requestId} AND environment_key = ${environmentKey}
    RETURNING id, path_key, clerk_user_id, email, display_name, message, status, created_at, updated_at, reviewed_at, reviewed_by
  ` as unknown as AccessRequestRow[];
  return updated[0] ? publicRequest(updated[0]) : null;
}
