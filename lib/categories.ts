export function formatCategory(category?: string | null): string {
  if (!category) return "";
  const key = category.trim().toLowerCase();
  switch (key) {
    case "education":
      return "Pendidikan";
    case "politics":
      return "Politik";
    case "data-science":
    case "datascience":
      return "Data Science";
    default:
      return category;
  }
}
