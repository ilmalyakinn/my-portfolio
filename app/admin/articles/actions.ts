"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const validCategories = new Set(["education", "politics", "data-science"]);

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

function validateArticleValues(values: ArticleFormValues): string | null {
  if (!values.slug) return "Slug is required.";

  if (!values.category || !validCategories.has(values.category)) {
    return "Category must be education, politics, or data-science.";
  }

  const hasTitle = values.title_id || values.title_en;
  if (!hasTitle) return "At least one title field is required.";

  const hasContent = values.content_id || values.content_en;
  if (!hasContent) return "At least one content field is required.";

  if (values.published) {
    if (!values.published_at) {
      return "Publication date is required when the article is published.";
    }

    const parsedDate = new Date(values.published_at);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Publication date is invalid.";
    }
  }

  return null;
}

function getPublishedAt(value: ArticleFormValues): string | null {
  if (!value.published) return null;
  if (!value.published_at) return null;

  const parsedDate = new Date(value.published_at);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

export async function createArticleAction(
  _prevState: ArticleFormState | undefined,
  formData: FormData,
): Promise<ArticleFormState> {
  const values = getFormValues(formData);

  try {
    const supabase = await requireAdminSupabase();

    const validationError = validateArticleValues(values);
    if (validationError) return { error: validationError, values };

    const publishedAt = getPublishedAt(values);
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
      category: values.category,
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

    const publishedAt = getPublishedAt(values);
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
        category: values.category,
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
