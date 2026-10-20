"use client";

import { useEffect, useMemo, useState } from "react";

import { normalizeCategory, projectCategoryOptions } from "@/lib/categories";
import type { ProjectMeta } from "@/types/project";
import styles from "@/styles/projects.module.css";
import ProjectCard from "@/components/ProjectCard";

export function ProjectsClient({
  initialProjects,
  initialCategory,
}: {
  initialProjects: ProjectMeta[];
  initialCategory: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextCategory = new URLSearchParams(window.location.search).get(
      "category",
    );

    if (nextCategory) {
      setSelectedCategory(normalizeCategory(nextCategory));
    } else {
      setSelectedCategory("all");
    }
  }, []);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return initialProjects;

    return initialProjects.filter(
      (project) => normalizeCategory(project.category) === selectedCategory,
    );
  }, [initialProjects, selectedCategory]);

  const handleCategoryChange = (value: string) => {
    const nextCategory = value === "all" ? "all" : normalizeCategory(value);
    setSelectedCategory(nextCategory);

    if (typeof window !== "undefined") {
      const nextUrl =
        nextCategory === "all"
          ? "/projects"
          : `/projects?category=${encodeURIComponent(nextCategory)}`;
      window.history.replaceState(null, "", nextUrl);
    }
  };

  const hasProjects = initialProjects.length > 0;
  const hasVisibleProjects = filteredProjects.length > 0;

  return (
    <div className={styles.container}>
      <div className={`${styles.header} reveal`}>
        <h1>Projects</h1>
      </div>

      <div className={styles.filterBar} aria-label="Project categories">
        {projectCategoryOptions.map(({ value, label }) => {
          const isActive =
            (value === "all" && selectedCategory === "all") ||
            (value !== "all" && selectedCategory === value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleCategoryChange(value)}
              className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ""}`.trim()}
              aria-pressed={isActive}
            >
              {label}
            </button>
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
            <button
              type="button"
              className={styles.emptyStateLinkButton}
              onClick={() => handleCategoryChange("all")}
            >
              View all projects
            </button>
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
