import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProject } from "@/lib/getProject";
import { getProjects } from "@/lib/getProjects";
import styles from "@/styles/projects.module.css";

export const revalidate = 60;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
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

/* ===== Static Params ===== */
export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch (err) {
    console.error("Error generating static params for projects:", err);
    return [];
  }
}

/* ===== Metadata ===== */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const title = project.title || slug;
  const description =
    project.short_description ||
    project.description?.slice(0, 160) ||
    "Project detail";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(project.image_url && isValidHttpUrl(project.image_url)
        ? { images: [{ url: project.image_url }] }
        : {}),
    },
    twitter: {
      card: project.image_url && isValidHttpUrl(project.image_url)
        ? "summary_large_image"
        : "summary",
      title,
      description,
      ...(project.image_url && isValidHttpUrl(project.image_url)
        ? { images: [project.image_url] }
        : {}),
    },
  };
}

/* ===== Detail Page ===== */
export default async function ProjectDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const displayTools =
    project.tools && project.tools.length > 0
      ? project.tools
      : project.tech && project.tech.length > 0
        ? project.tech
        : [];

  const hasGithub = isValidHttpUrl(project.github_url);
  const hasLive = isValidHttpUrl(project.live_url);
  const hasValidImage = isValidHttpUrl(project.image_url);

  return (
    <article className={styles.detailContainer}>
      <Link href="/projects" className={styles.backLink}>
        ← Back to Projects
      </Link>

      <div className={styles.detailHeader}>
        <h1>{project.title || slug}</h1>

        <div className={styles.detailMeta}>
          {project.year && <span className={styles.year}>{project.year}</span>}
          {project.category && (
            <span className={styles.categoryBadge}>{project.category}</span>
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

        {(hasGithub || hasLive) && (
          <div className={styles.links} style={{ marginTop: "0.75rem" }}>
            {hasGithub && (
              <a
                href={project.github_url!.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                GitHub ↗
              </a>
            )}
            {hasLive && (
              <a
                href={project.live_url!.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Live Demo ↗
              </a>
            )}
          </div>
        )}
      </div>

      {hasValidImage && (
        <div className={styles.imageWrapper}>
          <img
            src={project.image_url!.trim()}
            alt={project.title || slug}
            className={styles.projectImage}
          />
        </div>
      )}

      <hr className={styles.divider} />

      {project.html ? (
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: project.html }}
        />
      ) : project.description ? (
        <div className={styles.content}>
          <p>{project.description}</p>
        </div>
      ) : null}
    </article>
  );
}
