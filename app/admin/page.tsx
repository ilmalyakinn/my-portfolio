import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminPage() {
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

  const navLinkStyle: React.CSSProperties = {
    color: "rgba(232, 232, 232, 0.8)",
    border: "1px solid rgba(232, 232, 232, 0.12)",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: 999,
    padding: "0.7rem 1rem",
    fontSize: "0.92rem",
    transition: "all 0.2s ease",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid rgba(232, 232, 232, 0.12)",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: 18,
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "2rem 0 4rem",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid rgba(232, 232, 232, 0.12)",
          marginBottom: "2rem",
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
            Portfolio admin
          </p>
          <h1 style={{ margin: "0.35rem 0 0" }}>Dashboard</h1>
        </div>

        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "1px solid rgba(232, 232, 232, 0.2)",
              color: "inherit",
              borderRadius: 999,
              padding: "0.75rem 1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </form>
      </header>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <Link href="/admin" style={navLinkStyle}>
          Overview
        </Link>
        <Link href="/admin/articles" style={navLinkStyle}>
          Articles
        </Link>
        <Link href="/admin/projects" style={navLinkStyle}>
          Projects
        </Link>
      </nav>

      <section
        style={{
          ...cardStyle,
          background: "rgba(255, 255, 255, 0.04)",
          marginBottom: "2rem",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "rgba(232, 232, 232, 0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.7rem",
          }}
        >
          Status
        </p>
        <h2 style={{ margin: 0, fontSize: "1.8rem" }}>
          Ready for the next update
        </h2>
        <p style={{ margin: 0, color: "rgba(232, 232, 232, 0.8)" }}>
          Use this dashboard as the control center for the next article or
          project update. The content workflow is intentionally minimal and
          designed to be easy to maintain.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <article style={cardStyle}>
          <p
            style={{
              margin: 0,
              color: "rgba(232, 232, 232, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.7rem",
            }}
          >
            Publishing queue
          </p>
          <h3 style={{ margin: 0 }}>Waiting for the next content</h3>
          <p style={{ margin: 0, color: "rgba(232, 232, 232, 0.8)" }}>
            No article is currently queued for publication. This section will be
            filled as soon as new content is prepared.
          </p>
        </article>

        <article style={cardStyle}>
          <p
            style={{
              margin: 0,
              color: "rgba(232, 232, 232, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.7rem",
            }}
          >
            Project updates
          </p>
          <h3 style={{ margin: 0 }}>No active refresh planned</h3>
          <p style={{ margin: 0, color: "rgba(232, 232, 232, 0.8)" }}>
            There are no project changes scheduled yet. This view stays open for
            the next portfolio update.
          </p>
        </article>

        <article style={cardStyle}>
          <p
            style={{
              margin: 0,
              color: "rgba(232, 232, 232, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "0.7rem",
            }}
          >
            Site health
          </p>
          <h3 style={{ margin: 0 }}>Stable and protected</h3>
          <p style={{ margin: 0, color: "rgba(232, 232, 232, 0.8)" }}>
            Authentication, route protection, and logout flow are in place and
            currently working for the admin area.
          </p>
        </article>
      </section>

      <section
        style={{
          ...cardStyle,
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
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
                fontSize: "0.7rem",
              }}
            >
              Quick actions
            </p>
            <h2 style={{ margin: "0.35rem 0 0" }}>Manage content</h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <Link
            href="/admin/articles"
            style={{
              ...cardStyle,
              minHeight: 150,
              justifyContent: "space-between",
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
                Articles
              </p>
              <h3 style={{ margin: "0.65rem 0 0" }}>Open article manager</h3>
            </div>
            <span style={{ color: "rgba(232, 232, 232, 0.8)" }}>
              Review and prepare new writing.
            </span>
          </Link>

          <Link
            href="/admin/projects"
            style={{
              ...cardStyle,
              minHeight: 150,
              justifyContent: "space-between",
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
                Projects
              </p>
              <h3 style={{ margin: "0.65rem 0 0" }}>Open project manager</h3>
            </div>
            <span style={{ color: "rgba(232, 232, 232, 0.8)" }}>
              Review portfolio highlights and updates.
            </span>
          </Link>
        </div>
      </section>

      <section style={cardStyle}>
        <p
          style={{
            margin: 0,
            color: "rgba(232, 232, 232, 0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.7rem",
          }}
        >
          Current focus
        </p>
        <h2 style={{ margin: 0 }}>Next step</h2>
        <p style={{ margin: 0, color: "rgba(232, 232, 232, 0.8)" }}>
          This admin dashboard is the stable foundation for the content
          management workflow. Article and project creation screens will be
          added as their management flows are implemented and validated.
        </p>
      </section>
    </div>
  );
}
