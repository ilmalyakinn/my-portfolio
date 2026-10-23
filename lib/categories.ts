export const projectCategoryOptions = [
  { value: "all", label: "All Projects" },
  { value: "data-science", label: "Data Science" },
  { value: "dashboard", label: "Dashboard" },
  { value: "machine-learning", label: "Machine Learning" },
  { value: "creative-branding", label: "Creative & Branding" },
] as const;

export const articleCategoryOptions = [
  { value: "all", label: "All Articles" },
  { value: "education", label: "Education" },
  { value: "publications", label: "Publikasi" },
  { value: "data-science", label: "Data Science" },
] as const;

export function normalizeCategory(category?: string | null): string {
  if (!category) return "";

  const normalized = category.trim().toLowerCase();

  switch (normalized) {
    case "politics":
    case "public policy":
    case "public-policy":
    case "publication":
    case "publications":
    case "publikasi":
      return "publications";
    case "website":
    case "machine learning":
      return "machine-learning";
    default:
      return normalized;
  }
}

export function formatProjectCategory(category?: string | null): string {
  const key = normalizeCategory(category);

  switch (key) {
    case "data-science":
    case "datascience":
      return "Data Science";
    case "dashboard":
      return "Dashboard";
    case "website":
    case "machine-learning":
    case "machine learning":
      return "Machine Learning";
    case "creative-branding":
    case "creative branding":
      return "Creative & Branding";
    default:
      return category?.trim() || "";
  }
}

export function formatCategory(category?: string | null): string {
  const key = normalizeCategory(category);

  switch (key) {
    case "education":
      return "Education";
    case "politics":
    case "public-policy":
    case "public policy":
    case "publication":
    case "publications":
    case "publikasi":
      return "Publikasi";
    case "data-science":
    case "datascience":
      return "Data Science";
    default:
      return category?.trim() || "";
  }
}
