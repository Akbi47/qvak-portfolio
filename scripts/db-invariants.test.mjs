import assert from "node:assert/strict";
import { test } from "node:test";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error(
    "Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (local/cloud Supabase).",
  );
  process.exit(1);
}

import { createClient } from "@supabase/supabase-js";

const client = createClient(url, serviceRole, {
  auth: { persistSession: false },
});

const headers = {
  apikey: serviceRole,
  Authorization: `Bearer ${serviceRole}`,
  "Content-Type": "application/json",
};

test("single admin-owner invariant: a second distinct owner insert is rejected", async () => {
  const res = await fetch(`${url}/rest/v1/admin_owner`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ auth_uid: crypto.randomUUID() }),
  });
  assert.equal(res.status, 409, "second owner insert must be rejected");
  const body = await res.json();
  assert.match(
    body.message ?? "",
    /unique constraint "admin_owner_single_row"/,
    `expected unique-index violation, got: ${body.message}`,
  );
});

test("resume publicity write->read round-trips exactly (visible and private)", async () => {
  for (const next of ["visible", "private"]) {
    const { error } = await client.from("app_settings").upsert(
      { key: "resume.publicity", value: next },
      { onConflict: "key" },
    );
    assert.equal(error, null, `upsert ${next} error: ${error?.message}`);

    const { data } = await client
      .from("app_settings")
      .select("value")
      .eq("key", "resume.publicity")
      .maybeSingle();
    assert.equal(data?.value, next, `read-back mismatch for ${next}`);
  }

  // Restore the safe default.
  await client
    .from("app_settings")
    .upsert({ key: "resume.publicity", value: "private" }, { onConflict: "key" });
});
