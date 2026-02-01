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
    const stats = fs.statSync(fullPath);

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
      _mtime: stats.mtime.getTime(), // Store file modification time for sorting
    } as ArticleMeta & { _mtime: number };
  });

  // Sort by date descending (newest first)
  // If no date field, use file modification time (newest file first)
  articles.sort((a, b) => {
    const aDate = a.date;
    const bDate = b.date;

    // Both have dates - compare dates (descending)
    if (aDate && bDate) return bDate.localeCompare(aDate);

    // Only a has date - a comes first
    if (aDate) return -1;

    // Only b has date - b comes first
    if (bDate) return 1;

    // Neither has date - sort by file modification time (newest first)
    const aMtime = (a as any)._mtime || 0;
    const bMtime = (b as any)._mtime || 0;
    return bMtime - aMtime;
  });

  return articles;
}
