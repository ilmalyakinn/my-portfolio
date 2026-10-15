import { ArticleMeta } from "@/types/article";
import { getPublicSupabaseClient } from "./supabase-public";

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

export async function getArticles(): Promise<ArticleMeta[]> {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    console.error("Supabase public client not available.");
    return [];
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("articles")
    .select(
      "slug, title_id, title_en, excerpt_id, excerpt_en, category, cover_image, published_at",
    )
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching articles:", error.message);
    return [];
  }

  if (!data) return [];

  return data.map((item) => {
    const slug = item.slug;
    const title = item.title_id || item.title_en || slug;
    const summary = item.excerpt_id || item.excerpt_en || undefined;
    const date = formatDate(item.published_at);

    return {
      slug,
      title,
      date,
      summary,
      category: item.category || null,
      cover_image: item.cover_image || null,
      source: "supabase" as const,
    };
  });
}
