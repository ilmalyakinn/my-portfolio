import Link from "next/link";
import { getProjects } from "@/lib/getProjects";
import type { Metadata } from "next";
import styles from "@/styles/projects.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my data science and analytics projects showcasing Python, machine learning, and data visualization expertise.",
};

function isValidHttpUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  const trimmed = urlString.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default async function Projects() {
  const projects = await getProjects();

  // ⛑️ Guard: jika belum ada data project
  if (projects.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h1>Projects</h1>
          <p>No projects available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.header} reveal`}>
        <h1>Projects</h1>
      </div>
      <ul className={styles.projectsList}>
        {projects.map((p, index) => {
          const displayTools =
            p.tools && p.tools.length > 0
              ? p.tools
              : p.tech && p.tech.length > 0
                ? p.tech
                : [];

          const hasGithub = isValidHttpUrl(p.github_url);
          const hasLive = isValidHttpUrl(p.live_url);
          const displayDescription = p.short_description || p.description;

          return (
            <li
              key={p.slug}
              className={`${styles.card} reveal-subtle`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className={styles.cardHeader}>
                <h2 className={styles.title}>
                  <Link href={`/projects/${p.slug}`} className={styles.titleLink}>
                    {p.title}
                  </Link>
                </h2>
                <div className={styles.meta}>
                  {p.year && <span className={styles.year}>{p.year}</span>}
                  {p.category && (
                    <span className={styles.categoryBadge}>
                      {p.category}
                    </span>
                  )}
                  {displayTools.length > 0 && (
                    <div className={styles.badges}>
                      {displayTools.map((t) => (
                        <span key={t} className={styles.badge}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {displayDescription && (
                <div className={styles.description}>{displayDescription}</div>
              )}
              {(hasGithub || hasLive) && (
                <div className={styles.links}>
                  {hasGithub && (
                    <a
                      href={p.github_url!.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      GitHub ↗
                    </a>
                  )}
                  {hasLive && (
                    <a
                      href={p.live_url!.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      Live Demo ↗
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
