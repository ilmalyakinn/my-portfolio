import { ProjectMeta } from "@/types/project";
import { getPublicSupabaseClient } from "./supabase-public";

export async function getProjects(): Promise<ProjectMeta[]> {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    console.error("Supabase public client not available.");
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      "slug, title, category, year, short_description, description, tools, image_url, github_url, live_url, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching projects:", error.message);
    return [];
  }

  if (!data) return [];

  const projects: ProjectMeta[] = data.map((item) => {
    const tools = Array.isArray(item.tools) ? item.tools : [];

    return {
      slug: item.slug,
      title: item.title,
      category: item.category || null,
      year: item.year ?? null,
      created_at: item.created_at || null,
      short_description: item.short_description || null,
      description: item.description || item.short_description || null,
      tools,
      tech: tools,
      image_url: item.image_url || null,
      github_url: item.github_url || null,
      live_url: item.live_url || null,
      source: "supabase" as const,
    };
  });

  // Use created_at as the primary recency signal, then year as a fallback for stable ordering.
  projects.sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (aTime !== bTime) return bTime - aTime;

    const aYear = a.year != null && a.year !== "" ? Number(a.year) : NaN;
    const bYear = b.year != null && b.year !== "" ? Number(b.year) : NaN;

    if (!Number.isNaN(aYear) && !Number.isNaN(bYear) && aYear !== bYear) {
      return bYear - aYear;
    }

    if (!Number.isNaN(aYear) && Number.isNaN(bYear)) return -1;
    if (Number.isNaN(aYear) && !Number.isNaN(bYear)) return 1;

    return 0;
  });

  return projects;
}
