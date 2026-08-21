import assert from "node:assert/strict";
import { test } from "node:test";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Hard local-only guard: this test exercises real auth against Supabase and
// must never run against a cloud/production project.
if (!url || !anonKey || !serviceRole) {
  console.error(
    "Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY (local Supabase).",
  );
  process.exit(1);
}

const LOCAL_HOST = /^http:\/\/127\.0\.0\.1(?::\d+)?$/;
if (!LOCAL_HOST.test(url)) {
  console.error(
    `Refusing to run session test against non-local Supabase: ${url}\n` +
      "This test performs real sign-in/sign-out and must only target local Supabase.",
  );
  process.exit(1);
}

import { createClient } from "@supabase/supabase-js";
import { endOwnerSession } from "@/features/cms/session";

test("endOwnerSession revokes an authenticated session", async () => {
  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `session-test-${Date.now()}@local.test`;
  const password = "session-test-password-1";
  let userId: string | undefined;

  try {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    assert.equal(createError, null, `createUser: ${createError?.message}`);
    userId = created.user?.id;

    const anon = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: signInError } = await anon.auth.signInWithPassword({
      email,
      password,
    });
    assert.equal(signInError, null, `signInWithPassword: ${signInError?.message}`);

    const {
      data: { user: before },
    } = await anon.auth.getUser();
    assert.ok(before, "session should be valid right after sign-in");

    await endOwnerSession(anon);

    const {
      data: { user: after },
    } = await anon.auth.getUser();
    assert.equal(after, null, "session must be revoked after endOwnerSession");
  } finally {
    if (userId) {
      await admin.auth.admin.deleteUser(userId);
    }
  }
});
