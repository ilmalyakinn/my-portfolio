import fs from "fs";
import path from "path";
import { ArticleMeta } from "@/types/article";

export async function getArticles(): Promise<ArticleMeta[]> {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  if (!fs.existsSync(articlesDir)) return [];

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".mdx"));

  const articles: ArticleMeta[] = files.map((file) => {
    const fullPath = path.join(articlesDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");

    // Extract YAML frontmatter between first two '---' markers
    let title = "";
    let date = "";
    let summary: string | undefined = undefined;
    let tags: string[] | undefined = undefined;

    const fmStart = raw.indexOf("---");
    if (fmStart === 0) {
      const fmEnd = raw.indexOf("---", fmStart + 3);
      if (fmEnd !== -1) {
        const fm = raw.slice(fmStart + 3, fmEnd).trim();
        const lines = fm.split(/\r?\n/);
        for (const line of lines) {
          const m = line.match(/^([a-zA-Z0-9_]+):\s*(.+)$/);
          if (!m) continue;
          const key = m[1];
          let val = m[2].trim();
          // remove surrounding quotes if present
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }

          if (key === "title") title = val;
          if (key === "date") date = val;
          if (key === "summary") summary = val;
          if (key === "tags") {
            // simple array parsing: ["a","b"] or [a, b]
            const arrMatch = val.match(/\[(.*)\]/);
            if (arrMatch) {
              const items = arrMatch[1]
                .split(",")
                .map((s) => s.trim().replace(/^"|"$|^'|'$/g, ""))
                .filter(Boolean);
              tags = items;
            } else {
              tags = val
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            }
          }
        }
      }
    }

    const slug = file.replace(/\.mdx$/, "");
    return {
      slug,
      title: title || slug,
      date: date || "",
      summary,
      tags,
    } as ArticleMeta;
  });

  // sort by date desc (if date present)
  articles.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  return articles;
}
