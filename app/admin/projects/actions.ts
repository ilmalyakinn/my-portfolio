"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const validCategories = new Set([
  "data-science",
  "dashboard",
  "website",
  "creative-branding",
]);

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type ProjectFormValues = {
  title: string;
  slug: string;
  category: string;
  year: string;
  short_description: string;
  description: string;
  tools: string;
  image_url: string;
  github_url: string;
  live_url: string;
};

export type ProjectFormState = {
  error?: string;
  values?: ProjectFormValues;
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

function getFormValues(formData: FormData): ProjectFormValues {
  return {
    title: ((formData.get("title") as string | null)?.trim() ?? "") as string,
    slug: ((formData.get("slug") as string | null)?.trim() ?? "") as string,
    category: ((formData.get("category") as string | null)?.trim() ??
      "") as string,
    year: ((formData.get("year") as string | null)?.trim() ?? "") as string,
    short_description: ((
      formData.get("short_description") as string | null
    )?.trim() ?? "") as string,
    description: ((formData.get("description") as string | null)?.trim() ??
      "") as string,
    tools: ((formData.get("tools") as string | null)?.trim() ?? "") as string,
    image_url: ((formData.get("image_url") as string | null)?.trim() ??
      "") as string,
    github_url: ((formData.get("github_url") as string | null)?.trim() ??
      "") as string,
    live_url: ((formData.get("live_url") as string | null)?.trim() ??
      "") as string,
  };
}

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isGoogleShareUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString.toLowerCase());
    return (
      url.hostname.includes("share.google") ||
      url.hostname.includes("drive.google.com") ||
      url.hostname.includes("photos.app.goo.gl") ||
      url.hostname.includes("photos.google.com")
    );
  } catch {
    return false;
  }
}

function validateProjectValues(values: ProjectFormValues): string | null {
  if (!values.title) {
    return "Judul proyek wajib diisi.";
  }

  if (!values.slug) {
    return "Slug wajib diisi.";
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    return "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).";
  }

  if (!values.category || !validCategories.has(values.category)) {
    return "Kategori harus dipilih dari: data-science, dashboard, website, atau creative-branding.";
  }

  if (values.year) {
    const parsedYear = parseInt(values.year, 10);
    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      return "Tahun harus berupa angka tahun yang valid (antara 1900 - 2100).";
    }
  }

  if (!values.short_description) {
    return "Deskripsi singkat wajib diisi.";
  }

  if (values.image_url) {
    if (!isValidUrl(values.image_url)) {
      return "URL gambar tidak valid. Gunakan format URL lengkap (http:// atau https://).";
    }
    if (isGoogleShareUrl(values.image_url)) {
      return "URL gambar tidak boleh berupa link halaman berbagi (seperti share.google atau Google Drive) karena bukan tautan langsung ke file gambar. Silakan unggah file gambar langsung melalui tombol yang tersedia.";
    }
  }

  if (values.github_url && !isValidUrl(values.github_url)) {
    return "URL GitHub tidak valid. Gunakan format URL lengkap (http:// atau https://).";
  }

  if (values.live_url && !isValidUrl(values.live_url)) {
    return "URL live demo tidak valid. Gunakan format URL lengkap (http:// atau https://).";
  }

  return null;
}

async function uploadProjectImage(
  supabase: any,
  file: File | null,
  slug: string,
): Promise<{ url?: string; error?: string }> {
  if (!file || !(file instanceof File) || file.size === 0) {
    return {};
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      error: `Format file "${file.type || "tidak dikenal"}" tidak didukung. Harap unggah gambar JPEG, PNG, WebP, atau AVIF.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      error: `Ukuran file gambar terlalu besar (${sizeMb} MB). Batas maksimum file adalah 5 MB.`,
    };
  }

  const validExts: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
  const ext = validExts[file.type] || rawExt || "jpg";
  const cleanSlug =
    slug
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30) || "project";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const filePath = `projects/${cleanSlug}-${uniqueSuffix}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        error: `Gagal mengunggah file gambar ke Supabase Storage: ${uploadError.message}. Pastikan izin bucket "portfolio-images" telah diatur.`,
      };
    }

    const { data: urlData } = supabase.storage
      .from("portfolio-images")
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan upload";
    return { error: `Gagal memproses unggahan gambar: ${message}` };
  }
}

export async function createProjectAction(
  _prevState: ProjectFormState | undefined,
  formData: FormData,
): Promise<ProjectFormState> {
  const values = getFormValues(formData);
  const imageFile = formData.get("image_file") as File | null;

  try {
    const supabase = await requireAdminSupabase();

    const validationError = validateProjectValues(values);
    if (validationError) return { error: validationError, values };

    // Format tools: convert comma-separated string to string[]
    const toolsArray = values.tools
      ? values.tools
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const parsedYear = values.year ? parseInt(values.year, 10) : null;

    let finalImageUrl: string | null = values.image_url || null;

    // Handle file upload if provided
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const uploadResult = await uploadProjectImage(
        supabase,
        imageFile,
        values.slug,
      );
      if (uploadResult.error) {
        return { error: uploadResult.error, values };
      }
      if (uploadResult.url) {
        finalImageUrl = uploadResult.url;
        values.image_url = uploadResult.url;
      }
    }

    const payload = {
      title: values.title,
      slug: values.slug,
      category: values.category,
      year: parsedYear,
      short_description: values.short_description,
      description: values.description || null,
      tools: toolsArray,
      image_url: finalImageUrl,
      github_url: values.github_url || null,
      live_url: values.live_url || null,
    };

    const { error: insertError } = await supabase
      .from("projects")
      .insert([payload]);

    if (insertError) {
      const lowered = insertError.message.toLowerCase();
      if (lowered.includes("duplicate") || lowered.includes("unique")) {
        return {
          error: "Slug ini sudah digunakan. Silakan pilih slug lain yang unik.",
          values,
        };
      }

      return {
        error:
          insertError.message || "Gagal menyimpan proyek. Silakan coba lagi.",
        values,
      };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/projects/[slug]", "page");
    redirect("/admin/projects?success=created");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    if (message === "NEXT_REDIRECT") throw error;
    return { error: message, values };
  }
}

export async function updateProjectAction(
  _prevState: ProjectFormState | undefined,
  formData: FormData,
): Promise<ProjectFormState> {
  const values = getFormValues(formData);
  const id = (formData.get("id") as string | null)?.trim();
  const removeImage = formData.get("remove_image") === "true";
  const imageFile = formData.get("image_file") as File | null;

  if (!id) {
    return { error: "ID proyek tidak ditemukan.", values };
  }

  try {
    const supabase = await requireAdminSupabase();

    const existing = await supabase
      .from("projects")
      .select("id, slug, image_url")
      .eq("id", id)
      .maybeSingle();

    if (!existing.data) {
      return { error: "Proyek tidak ditemukan.", values };
    }

    const validationError = validateProjectValues(values);
    if (validationError) return { error: validationError, values };

    // Check slug collision with other projects
    const { data: duplicate, error: duplicateError } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", values.slug)
      .neq("id", id)
      .maybeSingle();

    if (duplicateError && duplicateError.code !== "PGRST116") {
      return { error: duplicateError.message, values };
    }

    if (duplicate) {
      return {
        error:
          "Slug ini sudah digunakan oleh proyek lain. Silakan pilih slug yang unik.",
        values,
      };
    }

    const toolsArray = values.tools
      ? values.tools
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const parsedYear = values.year ? parseInt(values.year, 10) : null;

    let finalImageUrl: string | null = existing.data.image_url ?? null;

    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      // New image file uploaded
      const uploadResult = await uploadProjectImage(
        supabase,
        imageFile,
        values.slug,
      );
      if (uploadResult.error) {
        return { error: uploadResult.error, values };
      }
      if (uploadResult.url) {
        finalImageUrl = uploadResult.url;
        values.image_url = uploadResult.url;
      }
    } else if (removeImage) {
      // Admin explicitly requested to remove the image
      finalImageUrl = null;
      values.image_url = "";
    } else if (
      values.image_url &&
      values.image_url !== existing.data.image_url
    ) {
      // Admin changed the external image URL
      finalImageUrl = values.image_url;
    } else if (!values.image_url && !existing.data.image_url) {
      finalImageUrl = null;
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        title: values.title,
        slug: values.slug,
        category: values.category,
        year: parsedYear,
        short_description: values.short_description,
        description: values.description || null,
        tools: toolsArray,
        image_url: finalImageUrl,
        github_url: values.github_url || null,
        live_url: values.live_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      const lowered = updateError.message.toLowerCase();
      if (lowered.includes("duplicate") || lowered.includes("unique")) {
        return {
          error: "Slug ini sudah digunakan. Silakan pilih slug lain yang unik.",
          values,
        };
      }

      return {
        error:
          updateError.message || "Gagal memperbarui proyek. Silakan coba lagi.",
        values,
      };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    if (existing?.data?.slug && existing.data.slug !== values.slug) {
      revalidatePath(`/projects/${existing.data.slug}`);
    }
    revalidatePath(`/projects/${values.slug}`);
    revalidatePath("/projects/[slug]", "page");
    redirect("/admin/projects?success=updated");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    if (message === "NEXT_REDIRECT") throw error;
    return { error: message, values };
  }
}

export async function deleteProjectAction(formData: FormData) {
  const id = (formData.get("id") as string | null)?.trim();
  if (!id) {
    redirect(
      "/admin/projects?error=" +
        encodeURIComponent("ID proyek tidak ditemukan"),
    );
  }

  try {
    const supabase = await requireAdminSupabase();

    const { data: existing, error: selectError } = await supabase
      .from("projects")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (selectError || !existing) {
      redirect(
        "/admin/projects?error=" + encodeURIComponent("Proyek tidak ditemukan"),
      );
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      redirect(
        "/admin/projects?error=" +
          encodeURIComponent(error.message || "Gagal menghapus proyek"),
      );
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects");
    if (existing?.slug) {
      revalidatePath(`/projects/${existing.slug}`);
    }
    revalidatePath("/projects/[slug]", "page");
    redirect("/admin/projects?success=deleted");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    if (message === "NEXT_REDIRECT") throw error;
    redirect("/admin/projects?error=" + encodeURIComponent(message));
  }
}
