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
    } as ProjectMeta;
  });

  // sort by year desc if available
  projects.sort((a, b) => {
    const ay = a.year ? String(a.year) : "";
    const by = b.year ? String(b.year) : "";
    if (ay && by) return by.localeCompare(ay);
    if (ay) return -1;
    if (by) return 1;
    return 0;
  });

  return projects;
}
