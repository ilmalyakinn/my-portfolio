import { marked } from "marked";
import { ArticleData } from "@/types/article";
import { getPublicSupabaseClient } from "./supabase-public";

export type { ArticleData };

function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    const match = dateInput.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export async function getArticle(
  slug: string,
  options?: { lang?: "id" | "en" | string },
): Promise<ArticleData | null> {
  const requestedLang = options?.lang === "en" ? "en" : "id";

  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    console.error("Supabase public client not available.");
    return null;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "slug, title_id, title_en, excerpt_id, excerpt_en, content_id, content_en, category, cover_image, published_at",
    )
    .eq("slug", slug)
    .not("published_at", "is", null)
    .lte("published_at", now)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase error fetching article:", {
      slug,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return null;
  }

  if (!data) {
    return null;
  }

  const titleId = data.title_id?.trim() || "";
  const titleEn = data.title_en?.trim() || "";
  const excerptId = data.excerpt_id?.trim() || "";
  const excerptEn = data.excerpt_en?.trim() || "";
  const contentId = data.content_id?.trim() || "";
  const contentEn = data.content_en?.trim() || "";

  // Fallback resolution for content:
  // If one language is not available, fallback to the other so the page is never empty
  const idContent = contentId || contentEn;
  const enContent = contentEn || contentId;

  const htmlId = idContent ? (marked(idContent) as string) : "";
  const htmlEn = enContent ? (marked(enContent) as string) : "";

  const isEnglish = requestedLang === "en";
  const activeTitle =
    (isEnglish ? titleEn || titleId : titleId || titleEn) || data.slug;
  const activeExcerpt = isEnglish
    ? excerptEn || excerptId
    : excerptId || excerptEn;
  const activeHtml = isEnglish ? htmlEn : htmlId;

  return {
    slug: data.slug,
    frontmatter: {
      title: activeTitle,
      date: formatDate(data.published_at),
      summary: activeExcerpt,
      category: data.category || null,
      cover_image: data.cover_image || null,
      title_id: data.title_id,
      title_en: data.title_en,
      excerpt_id: data.excerpt_id,
      excerpt_en: data.excerpt_en,
      content_id: data.content_id,
      content_en: data.content_en,
    },
    html: activeHtml,
    html_id: htmlId,
    html_en: htmlEn,
    source: "supabase",
    hasTranslation: Boolean(titleEn && contentEn),
  };
}
