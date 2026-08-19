#!/usr/bin/env node
/**
 * Seed the single CMS admin owner (auth user + admin_owner row).
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=... npm run seed:admin
 *
 * Requires a running Supabase (local or cloud) and SUPABASE_SERVICE_ROLE_KEY +
 * NEXT_PUBLIC_SUPABASE_URL in the environment. Idempotent.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceRole || !email || !password) {
  console.error(
    "Missing required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD",
  );
  process.exit(1);
}

async function main() {
  const baseHeaders = {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
    "Content-Type": "application/json",
  };

  // 1. Find or create the auth user.
  let authUid;
  const listRes = await fetch(
    `${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    { headers: baseHeaders },
  );
  const existing = await listRes.json();
  const users = Array.isArray(existing) ? existing : existing.users;
  const found = Array.isArray(users) ? users[0] : null;

  if (found) {
    authUid = found.id;
    console.log(`Auth user already exists: ${email} (${authUid})`);
  } else {
    const createRes = await fetch(`${url}/auth/v1/admin/users`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    const created = await createRes.json();
    if (createRes.status >= 400) {
      console.error("Failed to create auth user:", JSON.stringify(created));
      process.exit(1);
    }
    authUid = created.id;
    console.log(`Created auth user: ${email} (${authUid})`);
  }

  // 2. Ensure the admin_owner row exists for this auth user (idempotent).
  const existingOwner = await fetch(
    `${url}/rest/v1/admin_owner?auth_uid=eq.${authUid}&select=id`,
    { headers: baseHeaders },
  );
  const ownerRows = await existingOwner.json();
  const ownerFound = Array.isArray(ownerRows) && ownerRows.length > 0;

  let ownerRes;
  if (ownerFound) {
    ownerRes = await fetch(
      `${url}/rest/v1/admin_owner?auth_uid=eq.${authUid}`,
      {
        method: "PATCH",
        headers: { ...baseHeaders, Prefer: "return=minimal" },
        body: JSON.stringify({ auth_uid: authUid }),
      },
    );
    console.log(`admin_owner already set; refreshed for ${authUid}`);
  } else {
    ownerRes = await fetch(`${url}/rest/v1/admin_owner`, {
      method: "POST",
      headers: { ...baseHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({ auth_uid: authUid }),
    });
    console.log(`admin_owner set for ${authUid}`);
  }

  if (!ownerRes.ok) {
    console.error("Failed to upsert admin_owner:", ownerRes.status);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
