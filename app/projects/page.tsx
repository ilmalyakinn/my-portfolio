import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/getProjects";
import { normalizeCategory, projectCategoryOptions } from "@/lib/categories";
import type { Metadata } from "next";
import styles from "@/styles/projects.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my data science and analytics projects showcasing Python, machine learning, and data visualization expertise.",
};

type PageProps = {
  searchParams?: Promise<{ category?: string | string[] }>;
};

export default async function ProjectsPage(props: PageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const categoryParam = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
  const selectedCategory = categoryParam
    ? normalizeCategory(categoryParam)
    : "all";

  const projects = await getProjects();
  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter(
          (project) => normalizeCategory(project.category) === selectedCategory,
        );

  const hasProjects = projects.length > 0;
  const hasVisibleProjects = filteredProjects.length > 0;

  return (
    <div className={styles.container}>
      <div className={`${styles.header} reveal`}>
        <h1>Projects</h1>
      </div>

      <div className={styles.filterBar} aria-label="Project categories">
        {projectCategoryOptions.map(({ value, label }) => {
          const href =
            value === "all"
              ? "/projects"
              : `/projects?category=${encodeURIComponent(value)}`;
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

      {!hasProjects ? (
        <div className={styles.emptyState}>
          <h1>Projects</h1>
          <p>No projects available yet.</p>
        </div>
      ) : !hasVisibleProjects ? (
        <div className={styles.emptyState}>
          <h2>No projects in this category yet.</h2>
          <p>
            Try another category or browse all projects to see the full
            portfolio.
          </p>
          <p className={styles.emptyStateHint}>
            <Link href="/projects" className={styles.emptyStateLink}>
              View all projects
            </Link>
          </p>
        </div>
      ) : (
        <ul className={styles.projectsList}>
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </ul>
      )}
    </div>
  );
}
