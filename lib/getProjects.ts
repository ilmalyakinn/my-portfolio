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

  // Sort by year descending, then by created_at descending
  projects.sort((a, b) => {
    const aYear = a.year != null && a.year !== "" ? Number(a.year) : null;
    const bYear = b.year != null && b.year !== "" ? Number(b.year) : null;

    if (aYear !== null && bYear !== null && !isNaN(aYear) && !isNaN(bYear)) {
      if (bYear !== aYear) return bYear - aYear;
    } else if (aYear !== null && !isNaN(aYear)) {
      return -1;
    } else if (bYear !== null && !isNaN(bYear)) {
      return 1;
    }

    return 0;
  });

  return projects;
}
