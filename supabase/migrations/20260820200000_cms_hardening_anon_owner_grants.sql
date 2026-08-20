-- Issue #66: production hardening — revoke default anon privileges on admin_owner.
--
-- The schema migration (20260819204707) revokes anon on all content tables but
-- does not revoke the Supabase default grants on the security-sensitive
-- `admin_owner` table. Those grants are not currently exploitable because RLS
-- is enabled (deny-by-default returns 0 rows / rejects writes), but per the
-- accepted #18 design "anon = zero privileges" we revoke them for defense in
-- depth so anon has no table-level handle at all.

revoke all on public.admin_owner from anon;
