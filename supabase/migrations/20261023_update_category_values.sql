BEGIN;

DO $$
DECLARE
    articles_table_exists boolean;
    projects_table_exists boolean;
    articles_category_exists boolean;
    projects_category_exists boolean;
    article_legacy_constraint_name text;
    article_legacy_constraint_def text;
    project_legacy_constraint_name text;
    project_legacy_constraint_def text;
    invalid_article_category_count bigint;
    invalid_project_category_count bigint;
BEGIN
    -- Confirm required tables and category columns exist before making any assumption.
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'articles'
    ) INTO articles_table_exists;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'projects'
    ) INTO projects_table_exists;

    IF NOT articles_table_exists THEN
        RAISE EXCEPTION 'Precondition failed: public.articles does not exist. Category migration aborted.';
    END IF;

    IF NOT projects_table_exists THEN
        RAISE EXCEPTION 'Precondition failed: public.projects does not exist. Category migration aborted.';
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'articles'
          AND column_name = 'category'
    ) INTO articles_category_exists;

    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'projects'
          AND column_name = 'category'
    ) INTO projects_category_exists;

    IF NOT articles_category_exists THEN
        RAISE EXCEPTION 'Precondition failed: public.articles.category does not exist. Category migration aborted.';
    END IF;

    IF NOT projects_category_exists THEN
        RAISE EXCEPTION 'Precondition failed: public.projects.category does not exist. Category migration aborted.';
    END IF;

    -- Verify the exact, currently live legacy definitions before changing them.
    SELECT c.conname, pg_get_constraintdef(c.oid)
      INTO article_legacy_constraint_name, article_legacy_constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'articles'
      AND c.contype = 'c'
      AND c.conname = 'articles_category_check';

    IF article_legacy_constraint_name IS NULL THEN
        RAISE EXCEPTION 'Precondition failed: public.articles.articles_category_check is missing. Category migration aborted.';
    END IF;

    IF article_legacy_constraint_def <> 'CHECK ((category = ANY (ARRAY[''education''::text, ''politics''::text, ''data-science''::text])))' THEN
        RAISE EXCEPTION 'Precondition failed: public.articles.articles_category_check has unexpected definition: %', article_legacy_constraint_def;
    END IF;

    SELECT c.conname, pg_get_constraintdef(c.oid)
      INTO project_legacy_constraint_name, project_legacy_constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'projects'
      AND c.contype = 'c'
      AND c.conname = 'projects_category_check';

    IF project_legacy_constraint_name IS NULL THEN
        RAISE EXCEPTION 'Precondition failed: public.projects.projects_category_check is missing. Category migration aborted.';
    END IF;

    IF project_legacy_constraint_def <> 'CHECK ((category = ANY (ARRAY[''data-science''::text, ''dashboard''::text, ''website''::text, ''creative-branding''::text])))' THEN
        RAISE EXCEPTION 'Precondition failed: public.projects.projects_category_check has unexpected definition: %', project_legacy_constraint_def;
    END IF;

    -- Guardrail: if any non-NULL category value is outside the canonical and known legacy sets, stop before writing or changing constraints.
    SELECT COUNT(*)
      INTO invalid_article_category_count
    FROM public.articles
    WHERE category IS NOT NULL
      AND lower(trim(category::text)) NOT IN (
          'education',
          'publications',
          'data-science',
          'politics',
          'public policy',
          'public-policy',
          'publication',
          'publikasi'
      );

    IF invalid_article_category_count > 0 THEN
        RAISE EXCEPTION 'Precondition failed: unexpected non-NULL article category values were found before migration. No changes were applied.';
    END IF;

    SELECT COUNT(*)
      INTO invalid_project_category_count
    FROM public.projects
    WHERE category IS NOT NULL
      AND lower(trim(category::text)) NOT IN (
          'data-science',
          'dashboard',
          'machine-learning',
          'creative-branding',
          'website'
      );

    IF invalid_project_category_count > 0 THEN
        RAISE EXCEPTION 'Precondition failed: unexpected non-NULL project category values were found before migration. No changes were applied.';
    END IF;

    -- Replace the old CHECK constraints before updating values that are not valid under the legacy definitions.
    EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT %I', article_legacy_constraint_name);
    EXECUTE format('ALTER TABLE public.projects DROP CONSTRAINT %I', project_legacy_constraint_name);

    -- Normalize legacy values now that the legacy constraints are removed.
    UPDATE public.articles
    SET category = 'publications'
    WHERE lower(trim(category::text)) IN (
        'politics',
        'public policy',
        'public-policy',
        'publication',
        'publikasi'
    );

    UPDATE public.projects
    SET category = 'machine-learning'
    WHERE lower(trim(category::text)) = 'website';

    -- Add the new canonical CHECK constraints and validate them.
    ALTER TABLE public.articles
        ADD CONSTRAINT articles_category_check
        CHECK ((category = ANY (ARRAY['education'::text, 'publications'::text, 'data-science'::text])))
        NOT VALID;
    ALTER TABLE public.articles
        VALIDATE CONSTRAINT articles_category_check;

    ALTER TABLE public.projects
        ADD CONSTRAINT projects_category_check
        CHECK ((category = ANY (ARRAY['data-science'::text, 'dashboard'::text, 'machine-learning'::text, 'creative-branding'::text])))
        NOT VALID;
    ALTER TABLE public.projects
        VALIDATE CONSTRAINT projects_category_check;
END $$;

COMMIT;
