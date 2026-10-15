import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import DeleteArticleForm from "./DeleteArticleForm";

type ArticleRow = {
  id: string;
  slug: string;
  title_id?: string | null;
  title_en?: string | null;
  category?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (!isAdmin || adminError) {
    redirect("/admin/login?error=not_admin");
  }

  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  const successMessage =
    params.success === "created"
      ? "Article created successfully."
      : params.success === "updated"
        ? "Article updated successfully."
        : params.success === "deleted"
          ? "Article deleted successfully."
          : "";

  const errorMessage = (() => {
    if (!params.error) return "";
    const value = params.error;
    const messages: Record<string, string> = {
      not_found: "Article not found.",
      slug_required: "Slug is required.",
      invalid_category:
        "Category must be education, politics, or data-science.",
      title_required: "At least one title field is required.",
      content_required: "At least one content field is required.",
      published_at_required:
        "Publication date is required when the article is published.",
      published_at_invalid: "Publication date is invalid.",
      slug_duplicate: "This slug already exists. Please choose a unique slug.",
    };

    return messages[value] ?? `Operation failed: ${value}`;
  })();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 0 4rem" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid rgba(232, 232, 232, 0.12)",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "rgba(232, 232, 232, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.72rem",
            }}
          >
            Admin area
          </p>
          <h1 style={{ margin: "0.35rem 0 0" }}>Articles</h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            href="/admin/articles/new"
            style={{
              background: "#ffffff",
              color: "#111111",
              borderRadius: 999,
              padding: "0.8rem 1rem",
              fontWeight: 600,
            }}
          >
            Create article
          </Link>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "1px solid rgba(232, 232, 232, 0.2)",
                borderRadius: 999,
                color: "inherit",
                padding: "0.75rem 1rem",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <Link
          href="/admin"
          style={{
            color: "rgba(232, 232, 232, 0.8)",
            border: "1px solid rgba(232, 232, 232, 0.12)",
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: 999,
            padding: "0.7rem 1rem",
            fontSize: "0.92rem",
          }}
        >
          Overview
        </Link>
        <Link
          href="/admin/articles"
          style={{
            color: "#111111",
            background: "#ffffff",
            borderRadius: 999,
            padding: "0.7rem 1rem",
            fontSize: "0.92rem",
            fontWeight: 600,
          }}
        >
          Articles
        </Link>
        <Link
          href="/admin/projects"
          style={{
            color: "rgba(232, 232, 232, 0.8)",
            border: "1px solid rgba(232, 232, 232, 0.12)",
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: 999,
            padding: "0.7rem 1rem",
            fontSize: "0.92rem",
          }}
        >
          Projects
        </Link>
      </nav>

      {successMessage ? (
        <p style={{ marginBottom: "1rem", color: "#86efac" }}>
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p style={{ marginBottom: "1rem", color: "#fca5a5" }}>{errorMessage}</p>
      ) : null}

      {articlesError ? (
        <section
          style={{
            border: "1px solid rgba(248, 113, 113, 0.35)",
            background: "rgba(127, 29, 29, 0.2)",
            borderRadius: 18,
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Unable to load articles</h2>
          <p style={{ marginBottom: 0, color: "rgba(232, 232, 232, 0.8)" }}>
            {articlesError.message}
          </p>
        </section>
      ) : (
        <section
          style={{
            border: "1px solid rgba(232, 232, 232, 0.12)",
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: 18,
            padding: "1.5rem",
          }}
        >
          {!articles || articles.length === 0 ? (
            <div>
              <p style={{ margin: 0, color: "rgba(232, 232, 232, 0.8)" }}>
                No articles yet.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid rgba(232, 232, 232, 0.12)",
                    }}
                  >
                    <th style={{ padding: "0.75rem 0.5rem" }}>Slug</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Title</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Category</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Published</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(articles as ArticleRow[]).map((article) => {
                    const title =
                      article.title_id || article.title_en || article.slug;
                    const isPublished = Boolean(
                      article.published_at && article.published_at !== "",
                    );
                    const status = isPublished ? "Published" : "Draft";

                    return (
                      <tr
                        key={article.id}
                        style={{
                          borderBottom: "1px solid rgba(232, 232, 232, 0.08)",
                        }}
                      >
                        <td
                          style={{
                            padding: "0.9rem 0.5rem",
                            color: "rgba(232, 232, 232, 0.9)",
                          }}
                        >
                          {article.slug}
                        </td>
                        <td
                          style={{
                            padding: "0.9rem 0.5rem",
                            color: "rgba(232, 232, 232, 0.9)",
                          }}
                        >
                          {title}
                        </td>
                        <td
                          style={{
                            padding: "0.9rem 0.5rem",
                            color: "rgba(232, 232, 232, 0.9)",
                          }}
                        >
                          {article.category || "-"}
                        </td>
                        <td style={{ padding: "0.9rem 0.5rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.25rem 0.6rem",
                              borderRadius: 999,
                              background: isPublished
                                ? "rgba(34, 197, 94, 0.12)"
                                : "rgba(250, 204, 21, 0.12)",
                              color: isPublished ? "#86efac" : "#fcd34d",
                              fontSize: "0.8rem",
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "0.9rem 0.5rem",
                            color: "rgba(232, 232, 232, 0.8)",
                          }}
                        >
                          {article.published_at
                            ? new Date(article.published_at).toLocaleString()
                            : "—"}
                        </td>
                        <td style={{ padding: "0.9rem 0.5rem" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              style={{
                                background: "transparent",
                                border: "1px solid rgba(232, 232, 232, 0.2)",
                                borderRadius: 999,
                                color: "inherit",
                                padding: "0.45rem 0.8rem",
                                textDecoration: "none",
                              }}
                            >
                              Edit
                            </Link>
                            <DeleteArticleForm articleId={article.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
