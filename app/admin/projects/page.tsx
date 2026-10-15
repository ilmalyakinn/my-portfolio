import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ProjectRow } from "@/types/project";
import DeleteProjectForm from "./DeleteProjectForm";

export default async function AdminProjectsPage({
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

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const successMessage =
    params.success === "created"
      ? "Proyek berhasil ditambahkan."
      : params.success === "updated"
        ? "Proyek berhasil diperbarui."
        : params.success === "deleted"
          ? "Proyek berhasil dihapus."
          : "";

  const errorMessage = (() => {
    if (!params.error) return "";
    if (params.error === "not_found") return "Proyek tidak ditemukan.";
    return `Operasi gagal: ${params.error}`;
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
          <h1 style={{ margin: "0.35rem 0 0" }}>Projects</h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            href="/admin/projects/new"
            style={{
              background: "#ffffff",
              color: "#111111",
              borderRadius: 999,
              padding: "0.8rem 1rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + Create project
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
            textDecoration: "none",
          }}
        >
          Overview
        </Link>
        <Link
          href="/admin/articles"
          style={{
            color: "rgba(232, 232, 232, 0.8)",
            border: "1px solid rgba(232, 232, 232, 0.12)",
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: 999,
            padding: "0.7rem 1rem",
            fontSize: "0.92rem",
            textDecoration: "none",
          }}
        >
          Articles
        </Link>
        <Link
          href="/admin/projects"
          style={{
            color: "#111111",
            background: "#ffffff",
            borderRadius: 999,
            padding: "0.7rem 1rem",
            fontSize: "0.92rem",
            fontWeight: 600,
            textDecoration: "none",
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

      {projectsError ? (
        <section
          style={{
            border: "1px solid rgba(248, 113, 113, 0.35)",
            background: "rgba(127, 29, 29, 0.2)",
            borderRadius: 18,
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Gagal memuat daftar proyek</h2>
          <p style={{ marginBottom: 0, color: "rgba(232, 232, 232, 0.8)" }}>
            {projectsError.message}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "rgba(232, 232, 232, 0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.7rem",
                }}
              >
                Portfolio management
              </p>
              <h2 style={{ margin: "0.3rem 0 0" }}>Daftar Proyek Supabase</h2>
            </div>
            <Link
              href="/admin/projects/new"
              style={{
                background: "#ffffff",
                color: "#111111",
                borderRadius: 999,
                padding: "0.6rem 1rem",
                fontSize: "0.88rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Tambah Proyek
            </Link>
          </div>

          {!projects || projects.length === 0 ? (
            <div
              style={{
                padding: "2rem 1rem",
                textAlign: "center",
                border: "1px dashed rgba(232, 232, 232, 0.15)",
                borderRadius: 12,
              }}
            >
              <p style={{ margin: "0 0 1rem", color: "rgba(232, 232, 232, 0.8)" }}>
                Belum ada proyek di database.
              </p>
              <Link
                href="/admin/projects/new"
                style={{
                  display: "inline-block",
                  background: "#ffffff",
                  color: "#111111",
                  borderRadius: 999,
                  padding: "0.6rem 1.2rem",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Buat Proyek Pertama
              </Link>
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
                    <th style={{ padding: "0.75rem 0.5rem" }}>Judul</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Kategori</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Tahun</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Slug</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Tools</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(projects as ProjectRow[]).map((project) => (
                    <tr
                      key={project.id}
                      style={{
                        borderBottom: "1px solid rgba(232, 232, 232, 0.08)",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.9rem 0.5rem",
                          color: "rgba(232, 232, 232, 0.95)",
                          fontWeight: 500,
                        }}
                      >
                        {project.title}
                      </td>
                      <td
                        style={{
                          padding: "0.9rem 0.5rem",
                          color: "rgba(232, 232, 232, 0.85)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.2rem 0.6rem",
                            borderRadius: 999,
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {project.category || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.9rem 0.5rem",
                          color: "rgba(232, 232, 232, 0.8)",
                        }}
                      >
                        {project.year ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "0.9rem 0.5rem",
                          color: "rgba(232, 232, 232, 0.7)",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        {project.slug}
                      </td>
                      <td
                        style={{
                          padding: "0.9rem 0.5rem",
                          color: "rgba(232, 232, 232, 0.7)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {project.tools && project.tools.length > 0
                          ? project.tools.join(", ")
                          : "—"}
                      </td>
                      <td style={{ padding: "0.9rem 0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            style={{
                              background: "transparent",
                              border: "1px solid rgba(232, 232, 232, 0.2)",
                              borderRadius: 999,
                              color: "inherit",
                              padding: "0.45rem 0.8rem",
                              textDecoration: "none",
                              fontSize: "0.85rem",
                              display: "inline-block",
                            }}
                          >
                            Edit
                          </Link>
                          <DeleteProjectForm
                            projectId={project.id}
                            projectTitle={project.title}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
