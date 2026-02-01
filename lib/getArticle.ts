import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ArticleData = {
  slug: string;
  Component?: any; // default export from MDX module
  frontmatter: Record<string, any>;
  html?: string;
};

import { marked } from "marked";

export async function getArticle(slug: string): Promise<ArticleData | null> {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  const filePath = path.join(articlesDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  // Convert markdown/MDX (without JSX) to HTML for server-side rendering
  // This keeps implementation simple and avoids bundler dynamic imports.
  const content = raw.replace(/^---[\s\S]*?---/, "").trim();
  const html = marked(content);

  return {
    slug,
    frontmatter: data,
    // Expose HTML for rendering
    // Note: `Component` is left undefined when using HTML rendering
    // and the page will render `html` instead.
    // Keep `Component` optional for future MDX runtime implementations.
    // @ts-ignore
    html,
  } as any;
}
