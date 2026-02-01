import { getArticle } from "@/lib/getArticle";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/styles/writing.module.css";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* ===== Static Params ===== */
export async function generateStaticParams() {
  const fs = await import("fs");
  const path = await import("path");

  const dir = path.join(process.cwd(), "content", "articles");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({ slug: f.replace(/\.mdx$/, "") }));
}

/* ===== Metadata ===== */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article not found" };
  }

  const fm = article.frontmatter || {};
  const title = fm.title ?? slug;
  const description = fm.summary || fm.description || "";
  const articleUrl = `https://your-domain.com/writing/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: articleUrl,
      type: "article",
      publishedTime: fm.date,
      authors: ["You"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ===== Page ===== */
export default async function ArticlePage(props: PageProps) {
  const { slug } = await props.params;
  const article = await getArticle(slug);

  if (!article) {
    return <div>Article not found</div>;
  }

  const fm = article.frontmatter || {};

  return (
    <article className={styles.articleContainer}>
      <Link href="/writing" className={styles.backLink}>
        ← Back to Writing
      </Link>

      <div className={styles.articleHeader}>
        <h1>{fm.title || slug}</h1>
        {fm.date && <p className={styles.articleMeta}>{fm.date}</p>}
      </div>

      <hr className={styles.divider} />

      {article.html && (
        <div
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      )}
    </article>
  );
}
