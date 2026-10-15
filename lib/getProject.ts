import { marked } from "marked";
import { ProjectData } from "@/types/project";
import { getPublicSupabaseClient } from "./supabase-public";

export async function getProject(slug: string): Promise<ProjectData | null> {
  const trimmedSlug = slug?.trim();
  if (!trimmedSlug) return null;

  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    console.error("Supabase public client not available.");
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      "slug, title, category, year, short_description, description, tools, image_url, github_url, live_url, created_at"
    )
    .eq("slug", trimmedSlug)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase error fetching project by slug:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const tools = Array.isArray(data.tools) ? data.tools : [];
  const content = data.description?.trim() || "";
  const html = content ? (marked(content) as string) : "";

  return {
    slug: data.slug,
    title: data.title,
    category: data.category || null,
    year: data.year ?? null,
    short_description: data.short_description || null,
    description: data.description || null,
    tools,
    tech: tools,
    image_url: data.image_url || null,
    github_url: data.github_url || null,
    live_url: data.live_url || null,
    source: "supabase",
    content,
    html,
  };
}
