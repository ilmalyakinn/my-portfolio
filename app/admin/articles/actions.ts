"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const validCategories = new Set(["education", "publications", "data-science"]);

export type ArticleFormValues = {
  slug: string;
  title_id: string;
  title_en: string;
  excerpt_id: string;
  excerpt_en: string;
  content_id: string;
  content_en: string;
  category: string;
  cover_image: string;
  published: boolean;
  published_at: string;
};

export type ArticleFormState = {
  error?: string;
  values?: ArticleFormValues;
};

async function requireAdminSupabase() {
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

  return supabase;
}

function getFormValues(formData: FormData): ArticleFormValues {
  return {
    slug: ((formData.get("slug") as string | null)?.trim() ?? "") as string,
    title_id: ((formData.get("title_id") as string | null)?.trim() ??
      "") as string,
    title_en: ((formData.get("title_en") as string | null)?.trim() ??
      "") as string,
    excerpt_id: ((formData.get("excerpt_id") as string | null)?.trim() ??
      "") as string,
    excerpt_en: ((formData.get("excerpt_en") as string | null)?.trim() ??
      "") as string,
    content_id: ((formData.get("content_id") as string | null)?.trim() ??
      "") as string,
    content_en: ((formData.get("content_en") as string | null)?.trim() ??
      "") as string,
    category: ((formData.get("category") as string | null)?.trim() ??
      "") as string,
    cover_image: ((formData.get("cover_image") as string | null)?.trim() ??
      "") as string,
    published:
      formData.get("published") === "on" ||
      formData.get("published") === "true",
    published_at: ((formData.get("published_at") as string | null)?.trim() ??
      "") as string,
  };
}

function normalizeStoredArticleCategory(category: string): string {
  const normalized = category.trim().toLowerCase();

  if (
    normalized === "politics" ||
    normalized === "public policy" ||
    normalized === "public-policy" ||
    normalized === "publication" ||
    normalized === "publications" ||
    normalized === "publikasi"
  ) {
    return "publications";
  }

  return normalized;
}

function validateArticleValues(values: ArticleFormValues): string | null {
  const normalizedCategory = normalizeStoredArticleCategory(values.category);
  values.category = normalizedCategory;

  if (!values.slug) return "Slug is required.";

  if (!values.category || !validCategories.has(values.category)) {
    return "Category must be education, publications, or data-science.";
  }

  const hasTitle = values.title_id || values.title_en;
  if (!hasTitle) return "At least one title field is required.";

  const hasContent = values.content_id || values.content_en;
  if (!hasContent) return "At least one content field is required.";

  if (values.published && values.published_at) {
    const parsedDate = new Date(values.published_at);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Publication date is invalid.";
    }
  }

  return null;
}

function getPublishedAt(
  values: ArticleFormValues,
  timezoneOffset?: number | null,
): string | null {
  if (!values.published) return null;

  // If published is true and no custom date provided, publish immediately at current UTC time
  if (!values.published_at || values.published_at.trim() === "") {
    return new Date().toISOString();
  }

  const dateStr = values.published_at.trim();

  // If client provided its timezone offset (in minutes), convert local datetime-local string to true UTC
  if (
    typeof timezoneOffset === "number" &&
    !Number.isNaN(timezoneOffset) &&
    dateStr.length >= 10 &&
    !dateStr.endsWith("Z") &&
    !dateStr.includes("+")
  ) {
    const localUtcMs = new Date(dateStr + "Z").getTime();
    if (!Number.isNaN(localUtcMs)) {
      const trueUtcMs = localUtcMs + timezoneOffset * 60 * 1000;
      return new Date(trueUtcMs).toISOString();
    }
  }

  const parsedDate = new Date(dateStr);
  return Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : parsedDate.toISOString();
}

export async function createArticleAction(
  _prevState: ArticleFormState | undefined,
  formData: FormData,
): Promise<ArticleFormState> {
  const values = getFormValues(formData);
  const timezoneOffsetStr = formData.get("timezone_offset") as string | null;
  const timezoneOffset = timezoneOffsetStr
    ? parseInt(timezoneOffsetStr, 10)
    : null;

  try {
    const supabase = await requireAdminSupabase();

    const validationError = validateArticleValues(values);
    if (validationError) return { error: validationError, values };

    const publishedAt = getPublishedAt(values, timezoneOffset);
    if (values.published && publishedAt === null) {
      return { error: "Publication date is invalid.", values };
    }

    const payload = {
      slug: values.slug,
      title_id: values.title_id || null,
      title_en: values.title_en || null,
      excerpt_id: values.excerpt_id || null,
      excerpt_en: values.excerpt_en || null,
      content_id: values.content_id || null,
      content_en: values.content_en || null,
      category: normalizeStoredArticleCategory(values.category),
      cover_image: values.cover_image || null,
      published_at: publishedAt,
    };

    const { error: insertError } = await supabase
      .from("articles")
      .insert([payload]);

    if (insertError) {
      const lowered = insertError.message.toLowerCase();
      if (lowered.includes("duplicate") || lowered.includes("unique")) {
        return {
          error: "This slug already exists. Please choose a unique slug.",
          values,
        };
      }

      return {
        error:
          insertError.message || "Unable to save article. Please try again.",
        values,
      };
    }

    revalidatePath("/");
    revalidatePath("/writing");
    revalidatePath(`/writing/${values.slug}`);
    revalidatePath("/writing/[slug]", "page");
    redirect("/admin/articles?success=created");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "NEXT_REDIRECT") throw error;
    return { error: message, values };
  }
}

export async function updateArticleAction(
  _prevState: ArticleFormState | undefined,
  formData: FormData,
): Promise<ArticleFormState> {
  const values = getFormValues(formData);
  const id = (formData.get("id") as string | null)?.trim();
  const timezoneOffsetStr = formData.get("timezone_offset") as string | null;
  const timezoneOffset = timezoneOffsetStr
    ? parseInt(timezoneOffsetStr, 10)
    : null;

  if (!id) {
    return { error: "Article ID is missing.", values };
  }

  try {
    const supabase = await requireAdminSupabase();

    const existing = await supabase
      .from("articles")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (!existing.data) {
      return { error: "Article not found.", values };
    }

    const validationError = validateArticleValues(values);
    if (validationError) return { error: validationError, values };

    const publishedAt = getPublishedAt(values, timezoneOffset);
    if (values.published && publishedAt === null) {
      return { error: "Publication date is invalid.", values };
    }

    const { data: duplicate, error: duplicateError } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", values.slug)
      .neq("id", id)
      .maybeSingle();

    if (duplicateError && duplicateError.code !== "PGRST116") {
      return { error: duplicateError.message, values };
    }

    if (duplicate) {
      return {
        error: "This slug already exists. Please choose a unique slug.",
        values,
      };
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        slug: values.slug,
        title_id: values.title_id || null,
        title_en: values.title_en || null,
        excerpt_id: values.excerpt_id || null,
        excerpt_en: values.excerpt_en || null,
        content_id: values.content_id || null,
        content_en: values.content_en || null,
        category: normalizeStoredArticleCategory(values.category),
        cover_image: values.cover_image || null,
        published_at: publishedAt,
      })
      .eq("id", id);

    if (updateError) {
      return {
        error: updateError.message || "Unable to update article.",
        values,
      };
    }

    revalidatePath("/");
    revalidatePath("/writing");
    revalidatePath(`/writing/${values.slug}`);
    if (existing.data?.slug && existing.data.slug !== values.slug) {
      revalidatePath(`/writing/${existing.data.slug}`);
    }
    revalidatePath("/writing/[slug]", "page");
    redirect("/admin/articles?success=updated");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "NEXT_REDIRECT") throw error;
    return { error: message, values };
  }
}

export async function deleteArticleAction(formData: FormData) {
  const id = (formData.get("id") as string | null)?.trim();

  if (!id) {
    redirect("/admin/articles?error=not_found");
  }

  try {
    const supabase = await requireAdminSupabase();

    const { data: existingArticle, error: selectError } = await supabase
      .from("articles")
      .select("id, slug")
      .eq("id", id)
      .single();

    if (selectError) {
      redirect("/admin/articles?error=not_found");
    }

    const { error: deleteError } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (deleteError) {
      redirect(
        `/admin/articles?error=${encodeURIComponent(deleteError.message)}`,
      );
    }

    revalidatePath("/");
    revalidatePath("/writing");
    if (existingArticle?.slug) {
      revalidatePath(`/writing/${existingArticle.slug}`);
    }
    revalidatePath("/writing/[slug]", "page");
    redirect("/admin/articles?success=deleted");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "NEXT_REDIRECT") throw error;
    redirect(`/admin/articles?error=${encodeURIComponent(message)}`);
  }
}
