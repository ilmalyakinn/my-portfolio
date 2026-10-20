import Link from "next/link";

import { formatProjectCategory } from "@/lib/categories";
import type { ProjectMeta } from "@/types/project";
import styles from "@/styles/projects.module.css";

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

export default function ProjectCard({ project }: { project: ProjectMeta }) {
  const displayTools =
    project.tools && project.tools.length > 0
      ? project.tools
      : project.tech && project.tech.length > 0
        ? project.tech
        : [];

  const visibleTools = displayTools.slice(0, 4);
  const remainingTools = Math.max(displayTools.length - visibleTools.length, 0);

  const hasGithub = isValidHttpUrl(project.github_url);
  const hasLive = isValidHttpUrl(project.live_url);
  const hasProjectImage = isValidHttpUrl(project.image_url);
  const displayDescription = project.short_description || project.description;

  return (
    <li className={styles.card}>
      {hasProjectImage ? (
        <div className={styles.projectImageWrapper}>
          <img
            src={project.image_url!.trim()}
            alt={project.title}
            className={styles.projectImageCard}
          />
        </div>
      ) : (
        <div
          className={styles.projectImagePlaceholder}
          aria-label="No project image available"
        >
          No image available
        </div>
      )}

      <div className={styles.cardHeader}>
        <h2 className={styles.title}>
          <Link href={`/projects/${project.slug}`} className={styles.titleLink}>
            {project.title}
          </Link>
        </h2>

        {(project.category || project.year) && (
          <div className={styles.metaRow}>
            {project.category && (
              <span className={styles.categoryBadge}>
                {formatProjectCategory(project.category)}
              </span>
            )}
            {project.year && (
              <span className={styles.year}>{project.year}</span>
            )}
          </div>
        )}
      </div>

      {displayDescription && (
        <p className={styles.description}>{displayDescription}</p>
      )}

      {displayTools.length > 0 && (
        <div className={styles.techSection}>
          <span className={styles.techLabel}>TECH STACK</span>
          <div className={styles.techBadges}>
            {visibleTools.map((tool) => (
              <span key={tool} className={styles.badge}>
                {tool}
              </span>
            ))}
            {remainingTools > 0 && (
              <span className={styles.moreBadge}>+{remainingTools}</span>
            )}
          </div>
        </div>
      )}

      {(hasGithub || hasLive) && (
        <div className={styles.projectLinksSection}>
          <span className={styles.projectLinksLabel}>PROJECT LINKS</span>
          <div className={styles.links}>
            {hasGithub && (
              <a
                href={project.github_url!.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.link} ${styles.secondaryLink}`}
              >
                GitHub ↗
              </a>
            )}
            {hasLive && (
              <a
                href={project.live_url!.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.link} ${styles.primaryLink}`}
              >
                Live Demo ↗
              </a>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
