export const projectCategoryOptions = [
  { value: "all", label: "All Projects" },
  { value: "data-science", label: "Data Science" },
  { value: "dashboard", label: "Dashboard" },
  { value: "website", label: "Website" },
  { value: "creative-branding", label: "Creative & Branding" },
] as const;

export const articleCategoryOptions = [
  { value: "all", label: "All Articles" },
  { value: "education", label: "Education" },
  { value: "politics", label: "Politics" },
  { value: "data-science", label: "Data Science" },
] as const;

export function normalizeCategory(category?: string | null): string {
  if (!category) return "";
  return category.trim().toLowerCase();
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
      return "Website";
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
      return "Politics";
    case "data-science":
    case "datascience":
      return "Data Science";
    default:
      return category?.trim() || "";
  }
}
