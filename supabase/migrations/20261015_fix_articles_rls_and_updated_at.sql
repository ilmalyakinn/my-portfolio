-- Review-only corrective SQL for an existing Supabase database.
-- This script is intentionally non-destructive and safe for a live project
-- that already has public.articles, an existing updated_at column, RLS enabled,
-- admin policies in place, and a public.is_admin() function.
--
-- IMPORTANT:
-- - Do not add or modify the updated_at column.
-- - Do not backfill or change article row data.
-- - Do not create or replace any function.
-- - Do not create any trigger until helper function existence is confirmed.
-- - Do not drop unknown policies without manual verification of their purpose.
-- - This is a review script, not an automatic migration to be executed blindly.

BEGIN;

-- 1) Manual verification required before any execution.
-- Check all SELECT policies currently present on public.articles.
-- Do not guess names or delete policies that are not explicitly verified.
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'articles'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Confirm the current column state before altering anything.
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'articles'
  AND column_name = 'updated_at';

-- Verify whether a helper function already exists before creating any trigger.
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'set_articles_updated_at';

-- Verify whether an article trigger already exists.
SELECT
    tgname AS trigger_name,
    tgenabled
FROM pg_trigger
WHERE tgrelid = 'public.articles'::regclass
ORDER BY tgname;

-- 2) Only replace the known permissive public read policy.
--    This is the policy explicitly identified as using USING (true).
--    Do not delete other SELECT policies without confirming they are redundant.
DROP POLICY IF EXISTS "Public can read articles" ON public.articles;

CREATE POLICY "Public can read articles"
    ON public.articles
    FOR SELECT
    USING (
        published_at IS NOT NULL
        AND published_at <= now()
    );

-- 3) Additional policy review before any future cleanup.
--    If any other SELECT policy exists on public.articles, inspect its role and impact
--    manually before deciding to remove it. Unknown policies may be intentional or
--    admin-specific and must not be removed by guesswork.
--    Examples of names to inspect: any SELECT policy not equal to "Public can read articles"
--    that uses a permissive condition such as USING (true), USING (auth.role() = 'authenticated'),
--    or a broad role-based condition.

-- 4) Protected objects that must remain untouched.
--    - public.is_admin() must not be changed.
--    - admin insert/update/delete policies must remain intact.
--    - no row content changes are included in this script.
--    - no updated_at column creation or row backfills are performed.

COMMIT;

-- Manual verification checklist before executing this script in Supabase:
-- 1. Confirm "Public can read articles" is the actual public-facing SELECT policy and that it uses USING (true).
-- 2. List every SELECT policy on public.articles and decide whether any additional policy grants broader access.
-- 3. Confirm no other SELECT policy should remain active with a permissive condition.
-- 4. Confirm updated_at already exists and is not missing from the table definition.
-- 5. Confirm whether public.set_articles_updated_at() already exists before creating any trigger.
-- 6. Confirm no admin insert/update/delete policy is being altered.
-- 7. Confirm public.is_admin() is still the intended admin gate.
-- 8. Only after the above checks, decide whether to run the DROP POLICY and CREATE POLICY block above.
