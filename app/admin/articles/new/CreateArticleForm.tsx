"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createArticleAction, type ArticleFormState } from "../actions";

const defaultValues = {
  slug: "",
  title_id: "",
  title_en: "",
  excerpt_id: "",
  excerpt_en: "",
  content_id: "",
  content_en: "",
  category: "education",
  cover_image: "",
  published: false,
  published_at: "",
};

export default function CreateArticleForm() {
  const [timezoneOffset, setTimezoneOffset] = useState<number | "">("");

  useEffect(() => {
    setTimezoneOffset(new Date().getTimezoneOffset());
  }, []);

  const [state, formAction, isPending] = useActionState(createArticleAction, {
    values: defaultValues,
  } as ArticleFormState);

  const values = state.values ?? defaultValues;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 0 4rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p
          style={{
            margin: 0,
            color: "rgba(232, 232, 232, 0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.72rem",
          }}
        >
          Articles
        </p>
        <h1 style={{ margin: "0.35rem 0 0" }}>Create article</h1>
      </header>

      <section
        style={{
          border: "1px solid rgba(232, 232, 232, 0.12)",
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: 18,
          padding: "1.5rem",
        }}
      >
        {state.error ? (
          <p style={{ marginTop: 0, marginBottom: "1rem", color: "#fca5a5" }}>
            {state.error}
          </p>
        ) : null}

        <form action={formAction} style={{ display: "grid", gap: "1rem" }}>
          <input type="hidden" name="timezone_offset" value={timezoneOffset} />
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span>Slug</span>
            <input
              name="slug"
              required
              defaultValue={values.slug}
              disabled={isPending}
              style={inputStyle}
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Title (ID)</span>
              <input
                name="title_id"
                defaultValue={values.title_id}
                disabled={isPending}
                style={inputStyle}
              />
            </label>
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Title (EN)</span>
              <input
                name="title_en"
                defaultValue={values.title_en}
                disabled={isPending}
                style={inputStyle}
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Excerpt (ID)</span>
              <textarea
                name="excerpt_id"
                rows={3}
                defaultValue={values.excerpt_id}
                disabled={isPending}
                style={textareaStyle}
              />
            </label>
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Excerpt (EN)</span>
              <textarea
                name="excerpt_en"
                rows={3}
                defaultValue={values.excerpt_en}
                disabled={isPending}
                style={textareaStyle}
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Content (ID)</span>
              <textarea
                name="content_id"
                rows={6}
                defaultValue={values.content_id}
                disabled={isPending}
                style={textareaStyle}
              />
            </label>
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Content (EN)</span>
              <textarea
                name="content_en"
                rows={6}
                defaultValue={values.content_en}
                disabled={isPending}
                style={textareaStyle}
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Category</span>
              <select
                name="category"
                required
                defaultValue={values.category}
                disabled={isPending}
                style={inputStyle}
              >
                <option value="education">education</option>
                <option value="politics">politics</option>
                <option value="data-science">data-science</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: "0.5rem" }}>
              <span>Cover image URL</span>
              <input
                name="cover_image"
                type="url"
                defaultValue={values.cover_image}
                disabled={isPending}
                style={inputStyle}
              />
            </label>
          </div>

          <label
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <input
              name="published"
              type="checkbox"
              defaultChecked={values.published}
              disabled={isPending}
            />
            <span>Publish immediately</span>
          </label>

          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span>Publication date</span>
            <input
              name="published_at"
              type="datetime-local"
              defaultValue={values.published_at}
              disabled={isPending}
              style={inputStyle}
            />
            <span
              style={{
                fontSize: "0.8rem",
                color: "rgba(232, 232, 232, 0.6)",
              }}
            >
              Optional. Leave blank to publish immediately now. Set a date to
              schedule or backdate.
            </span>
          </label>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginTop: "0.75rem",
            }}
          >
            <button
              type="submit"
              disabled={isPending}
              style={{
                background: "#ffffff",
                color: "#111111",
                borderRadius: 999,
                border: "none",
                padding: "0.8rem 1rem",
                fontWeight: 600,
                cursor: isPending ? "wait" : "pointer",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? "Saving..." : "Save article"}
            </button>
            <Link
              href="/admin/articles"
              style={{
                background: "transparent",
                border: "1px solid rgba(232, 232, 232, 0.2)",
                borderRadius: 999,
                color: "inherit",
                padding: "0.8rem 1rem",
                display: "inline-block",
              }}
            >
              Back to articles
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.8rem 1rem",
  borderRadius: 10,
  border: "1px solid rgba(232, 232, 232, 0.2)",
  background: "rgba(255, 255, 255, 0.02)",
  color: "inherit",
  font: "inherit",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 120,
};
