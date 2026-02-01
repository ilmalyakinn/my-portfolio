import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProjectMeta } from "@/types/project";

export async function getProjects(): Promise<ProjectMeta[]> {
  const projectsDir = path.join(process.cwd(), "content", "projects");
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".mdx"));

  const projects: ProjectMeta[] = files.map((file) => {
    const fullPath = path.join(projectsDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);
    const stats = fs.statSync(fullPath);

    const slug = file.replace(/\.mdx$/, "");
    const title = data.title || slug;
    const description = data.description || data.summary || "";
    const tech = Array.isArray(data.tech)
      ? data.tech
      : typeof data.tech === "string"
        ? data.tech.split(",").map((s: string) => s.trim())
        : undefined;
    const year = data.year || data.date || "";

    return {
      slug,
      title,
      description,
      tech,
      year,
      _mtime: stats.mtime.getTime(), // Store file modification time for sorting
    } as ProjectMeta & { _mtime: number };
  });

  // Sort by year descending (newest first)
  // If no year field, use file modification time (newest file first)
  projects.sort((a, b) => {
    const ay = a.year ? String(a.year) : "";
    const by = b.year ? String(b.year) : "";

    // Both have years - compare years (descending)
    if (ay && by) return by.localeCompare(ay);

    // Only a has year - a comes first
    if (ay) return -1;

    // Only b has year - b comes first
    if (by) return 1;

    // Neither has year - sort by file modification time (newest first)
    const aMtime = (a as any)._mtime || 0;
    const bMtime = (b as any)._mtime || 0;
    return bMtime - aMtime;
  });

  return projects;
}
