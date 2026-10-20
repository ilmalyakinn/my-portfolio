import Link from "next/link";
import { getArticles } from "@/lib/getArticles";
import {
  articleCategoryOptions,
  formatCategory,
  normalizeCategory,
} from "@/lib/categories";
import type { Metadata } from "next";
import styles from "@/styles/writing.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Articles and insights on machine learning, data science, Python programming, and web development.",
};

type PageProps = {
  searchParams?: Promise<{ category?: string | string[] }>;
};

export default async function WritingPage(props: PageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const categoryParam = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
  const selectedCategory = categoryParam
    ? normalizeCategory(categoryParam)
    : "all";

  const articles = await getArticles();
  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter(
          (article) => normalizeCategory(article.category) === selectedCategory,
        );

  return (
    <div className={styles.writingContainer}>
      <div className={`${styles.header} reveal`}>
        <h1>Writing</h1>
      </div>

      <div className={styles.filterBar} aria-label="Article categories">
        {articleCategoryOptions.map(({ value, label }) => {
          const href =
            value === "all"
              ? "/writing"
              : `/writing?category=${encodeURIComponent(value)}`;
          const isActive =
            (value === "all" && selectedCategory === "all") ||
            (value !== "all" && selectedCategory === value);

          return (
            <Link
              key={value}
              href={href}
              className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ""}`.trim()}
              aria-pressed={isActive}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {filteredArticles.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>No articles in this category yet.</h2>
          <p>Try another topic or return to all articles to keep exploring.</p>
          <p className={styles.emptyStateHint}>
            <Link href="/writing" className={styles.emptyStateLink}>
              View all articles
            </Link>
          </p>
        </section>
      ) : (
        <ul className={styles.writingList}>
          {filteredArticles.map((a, index) => (
            <li
              key={a.slug}
              className="reveal-subtle"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <Link href={`/writing/${a.slug}`} className={styles.writingItem}>
                <h2 className={styles.writingTitle}>{a.title}</h2>
                <div className={styles.writingMeta}>
                  {a.date && <span>{a.date}</span>}
                  {a.category && (
                    <span className={styles.categoryBadge}>
                      {formatCategory(a.category)}
                    </span>
                  )}
                </div>
                {a.summary && (
                  <p className={styles.writingExcerpt}>{a.summary}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
