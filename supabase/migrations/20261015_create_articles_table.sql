-- Migration: create public.articles schema for CMS article management
-- This migration only manages the articles table and the policies tied to the
-- existing project function public.is_admin().
-- It intentionally does not create or modify public.admin_users or public.is_admin().

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    title_id text,
    title_en text,
    excerpt_id text,
    excerpt_en text,
    content_id text,
    content_en text,
    category text NOT NULL CHECK (category IN ('education', 'politics', 'data-science')),
    cover_image text,
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.articles IS 'Portfolio article content for bilingual publishing.';
COMMENT ON COLUMN public.articles.slug IS 'Unique URL slug used in public article routes.';
COMMENT ON COLUMN public.articles.title_id IS 'Article title in Indonesian.';
COMMENT ON COLUMN public.articles.title_en IS 'Article title in English.';
COMMENT ON COLUMN public.articles.excerpt_id IS 'Short summary in Indonesian.';
COMMENT ON COLUMN public.articles.excerpt_en IS 'Short summary in English.';
COMMENT ON COLUMN public.articles.content_id IS 'Body content in Indonesian.';
COMMENT ON COLUMN public.articles.content_en IS 'Body content in English.';
COMMENT ON COLUMN public.articles.category IS 'Fixed content category, intentionally restricted to the supported portfolio values.';
COMMENT ON COLUMN public.articles.cover_image IS 'Optional cover image URL or storage path.';
COMMENT ON COLUMN public.articles.published_at IS 'Publication timestamp. NULL means draft/unpublished.';

CREATE OR REPLACE FUNCTION public.set_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_set_updated_at ON public.articles;
CREATE TRIGGER articles_set_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.set_articles_updated_at();

CREATE INDEX IF NOT EXISTS idx_articles_published_at
    ON public.articles (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_category
    ON public.articles (category);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read policy: only published articles are readable by anonymous users.
CREATE POLICY "articles_public_select_published"
    ON public.articles
    FOR SELECT
    USING (
        published_at IS NOT NULL
        AND published_at <= now()
    );

-- Admin-only write policies: they rely on the existing project function public.is_admin().
-- This migration intentionally avoids creating or replacing that function.
CREATE POLICY "articles_admin_insert"
    ON public.articles
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "articles_admin_update"
    ON public.articles
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "articles_admin_delete"
    ON public.articles
    FOR DELETE
    USING (public.is_admin());

COMMIT;
