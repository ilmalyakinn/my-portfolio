import Link from "next/link";
import { getArticles } from "@/lib/getArticles";
import { formatCategory } from "@/lib/categories";
import type { Metadata } from "next";
import styles from "@/styles/writing.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Articles and insights on machine learning, data science, Python programming, and web development.",
};

export default async function Writing() {
  const articles = await getArticles();

  return (
    <div className={styles.writingContainer}>
      <div className={`${styles.header} reveal`}>
        <h1>Writing</h1>
      </div>

      {articles.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>No articles yet</h2>
          <p>
            I&apos;m working on some pieces to share. Check back soon for insights,
            tutorials, and thoughts on web development and data.
          </p>
          <p className={styles.emptyStateHint}>
            New articles will appear here as they&apos;re published.
          </p>
        </section>
      ) : (
        <ul className={styles.writingList}>
          {articles.map((a, index) => (
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
