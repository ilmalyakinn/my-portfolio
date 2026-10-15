export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  category?: string | null;
  cover_image?: string | null;
  source?: "supabase";
};

export type ArticleData = {
  slug: string;
  frontmatter: {
    title: string;
    date?: string;
    summary?: string;
    tags?: string[];
    category?: string | null;
    cover_image?: string | null;
    title_id?: string | null;
    title_en?: string | null;
    excerpt_id?: string | null;
    excerpt_en?: string | null;
    content_id?: string | null;
    content_en?: string | null;
    [key: string]: any;
  };
  html?: string;
  html_id?: string;
  html_en?: string;
  source?: "supabase";
  hasTranslation?: boolean;
};
