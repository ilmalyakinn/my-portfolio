import { getProjects } from "@/lib/getProjects";
import type { Metadata } from "next";
import styles from "@/styles/projects.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my data science and analytics projects showcasing Python, machine learning, and data visualization expertise.",
};

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
        {projects.map((p, index) => (
          <li
            key={p.slug}
            className={`${styles.card} reveal-subtle`}
            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.title}>{p.title}</h2>
              <div className={styles.meta}>
                {p.year && <span className={styles.year}>{p.year}</span>}
                {p.tech && p.tech.length > 0 && (
                  <div className={styles.badges}>
                    {p.tech.map((t) => (
                      <span key={t} className={styles.badge}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {p.description && (
              <div className={styles.description}>{p.description}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
