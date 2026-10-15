"use client";

import Link from "next/link";
import { useActionState, useState, useRef } from "react";
import {
  updateProjectAction,
  type ProjectFormState,
  type ProjectFormValues,
} from "../../actions";
import type { ProjectRow } from "@/types/project";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getDefaultValues(project: ProjectRow): ProjectFormValues {
  return {
    title: project.title ?? "",
    slug: project.slug ?? "",
    category: project.category ?? "data-science",
    year: project.year != null ? String(project.year) : "",
    short_description: project.short_description ?? "",
    description: project.description ?? "",
    tools: Array.isArray(project.tools) ? project.tools.join(", ") : "",
    image_url: project.image_url ?? "",
    github_url: project.github_url ?? "",
    live_url: project.live_url ?? "",
  };
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

export default function EditProjectForm({ project }: { project: ProjectRow }) {
  const initialValues = getDefaultValues(project);
  const [state, formAction, isPending] = useActionState(updateProjectAction, {
    values: initialValues,
  } as ProjectFormState);

  const values = state.values ?? initialValues;

  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Existing image state
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [externalUrl, setExternalUrl] = useState(values.image_url);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError(
        "Format gambar tidak didukung. Harap pilih file JPEG, PNG, WebP, atau AVIF.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(
        `Ukuran file terlalu besar (${sizeMb} MB). Batas maksimum file adalah 5 MB.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
    setRemoveExistingImage(false);
  };

  const handleClearFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
  };

  const isShareGoogle = isGoogleShareUrl(externalUrl);
  const currentImageUrl = project.image_url;
  const hasExistingImage = Boolean(currentImageUrl && !removeExistingImage);

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
          Proyek
        </p>
        <h1 style={{ margin: "0.35rem 0 0" }}>Edit Proyek: {project.title}</h1>
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
          <p
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: "#fca5a5",
              background: "rgba(239, 68, 68, 0.1)",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {state.error}
          </p>
        ) : null}

        <form
          action={formAction}
          encType="multipart/form-data"
          style={{ display: "grid", gap: "1.2rem" }}
        >
          <input type="hidden" name="id" value={project.id} />
          {removeExistingImage && (
            <input type="hidden" name="remove_image" value="true" />
          )}

          {/* Judul & Slug */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span style={labelStyle}>
                Judul Proyek <span style={{ color: "#f87171" }}>*</span>
              </span>
              <input
                name="title"
                value={title}
                onChange={handleTitleChange}
                required
                disabled={isPending}
                style={inputStyle}
              />
              <span style={hintStyle}>Nama utama proyek.</span>
            </label>

            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span style={labelStyle}>
                Slug URL <span style={{ color: "#f87171" }}>*</span>
              </span>
              <input
                name="slug"
                value={slug}
                onChange={handleSlugChange}
                required
                disabled={isPending}
                style={inputStyle}
              />
              <span style={hintStyle}>
                Hanya huruf kecil, angka, dan tanda hubung (-).
              </span>
            </label>
          </div>

          {/* Kategori & Tahun */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span style={labelStyle}>
                Kategori <span style={{ color: "#f87171" }}>*</span>
              </span>
              <select
                name="category"
                defaultValue={values.category}
                disabled={isPending}
                style={selectStyle}
              >
                <option value="data-science">Data Science</option>
                <option value="dashboard">Dashboard</option>
                <option value="website">Website</option>
                <option value="creative-branding">Creative Branding</option>
              </select>
              <span style={hintStyle}>Bidang proyek.</span>
            </label>

            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span style={labelStyle}>Tahun Pembuatan</span>
              <input
                name="year"
                type="number"
                min="1900"
                max="2100"
                defaultValue={values.year}
                disabled={isPending}
                style={inputStyle}
              />
              <span style={hintStyle}>Tahun pengerjaan.</span>
            </label>
          </div>

          {/* Deskripsi Singkat */}
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span style={labelStyle}>
              Deskripsi Singkat <span style={{ color: "#f87171" }}>*</span>
            </span>
            <input
              name="short_description"
              defaultValue={values.short_description}
              required
              disabled={isPending}
              style={inputStyle}
            />
            <span style={hintStyle}>Tampil pada kartu proyek di halaman utama.</span>
          </label>

          {/* Deskripsi Lengkap */}
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span style={labelStyle}>Deskripsi Lengkap</span>
            <textarea
              name="description"
              defaultValue={values.description}
              disabled={isPending}
              placeholder="Penjelasan detail tentang latar belakang, metodologi, dan hasil proyek... (Mendukung Markdown)"
              style={textareaStyle}
            />
            <span style={hintStyle}>Opsional, penjelasan mendalam proyek.</span>
          </label>

          {/* Pengaturan Gambar Preview Proyek */}
          <div
            style={{
              border: "1px solid rgba(232, 232, 232, 0.15)",
              borderRadius: 14,
              padding: "1.25rem",
              background: "rgba(255, 255, 255, 0.015)",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div>
              <span style={{ ...labelStyle, fontSize: "0.95rem" }}>
                Gambar Preview Proyek
              </span>
              <p
                style={{
                  ...hintStyle,
                  fontSize: "0.8rem",
                  margin: "0.25rem 0 0",
                }}
              >
                Ganti gambar dengan mengunggah file baru ke Supabase Storage, atau pertahankan gambar yang sedang digunakan.
              </p>
            </div>

            {/* Gambar yang Saat Ini Digunakan */}
            {hasExistingImage && (
              <div
                style={{
                  padding: "1rem",
                  borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <img
                  src={currentImageUrl!}
                  alt={project.title}
                  style={{
                    width: 140,
                    height: 90,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(59, 130, 246, 0.2)",
                      color: "#93c5fd",
                      borderRadius: 4,
                      padding: "0.15rem 0.5rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      marginBottom: "0.3rem",
                    }}
                  >
                    Gambar Saat Ini
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.82rem",
                      color: "rgba(232, 232, 232, 0.7)",
                      wordBreak: "break-all",
                    }}
                  >
                    {currentImageUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRemoveExistingImage(true);
                    setExternalUrl("");
                  }}
                  disabled={isPending}
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                    borderRadius: 6,
                    padding: "0.45rem 0.85rem",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Hapus Gambar
                </button>
              </div>
            )}

            {removeExistingImage && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#fca5a5" }}>
                  Gambar saat ini ditandai untuk dihapus saat disimpan.
                </span>
                <button
                  type="button"
                  onClick={() => setRemoveExistingImage(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "inherit",
                    borderRadius: 6,
                    padding: "0.3rem 0.7rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Batal Hapus
                </button>
              </div>
            )}

            {/* Input File Baru */}
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image_file"
                  id="edit_image_file_input"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileChange}
                  disabled={isPending}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="edit_image_file_input"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 8,
                    padding: "0.65rem 1.2rem",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    cursor: isPending ? "not-allowed" : "pointer",
                    color: "inherit",
                    transition: "all 0.2s ease",
                  }}
                >
                  📁 {hasExistingImage ? "Ganti dengan File Gambar Baru..." : "Pilih File Gambar..."}
                </label>
                <span style={{ fontSize: "0.82rem", color: "rgba(232, 232, 232, 0.6)" }}>
                  JPEG, PNG, WebP, AVIF (maks. 5 MB)
                </span>
              </div>

              {fileError && (
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "0.82rem",
                    margin: 0,
                    background: "rgba(239, 68, 68, 0.1)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: 6,
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  ⚠️ {fileError}
                </p>
              )}

              {/* Preview Gambar Baru yang Dipilih */}
              {filePreview && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "1rem",
                    borderRadius: 10,
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={filePreview}
                    alt="Preview Gambar Baru"
                    style={{
                      width: 140,
                      height: 90,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "#a7f3d0",
                      }}
                    >
                      ✓ Gambar Baru Siap Diunggah
                    </p>
                    <p
                      style={{
                        margin: "0.25rem 0 0",
                        fontSize: "0.82rem",
                        color: "rgba(232, 232, 232, 0.8)",
                      }}
                    >
                      {selectedFile?.name} (
                      {selectedFile
                        ? (selectedFile.size / 1024).toFixed(0) + " KB"
                        : ""}
                      )
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    disabled={isPending}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#fca5a5",
                      borderRadius: 6,
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    Batal Pilih
                  </button>
                </div>
              )}
            </div>

            {/* Alternatif: Input URL Gambar Eksternal */}
            <div
              style={{
                borderTop: "1px solid rgba(232, 232, 232, 0.1)",
                paddingTop: "0.8rem",
                display: "grid",
                gap: "0.4rem",
              }}
            >
              <span style={{ ...labelStyle, fontSize: "0.82rem" }}>
                Atau Masukkan / Perbarui URL Gambar Eksternal:
              </span>
              <input
                name="image_url"
                type="url"
                value={externalUrl}
                onChange={(e) => {
                  setExternalUrl(e.target.value);
                  if (removeExistingImage) setRemoveExistingImage(false);
                }}
                disabled={isPending}
                placeholder="https://example.com/project-cover.jpg"
                style={inputStyle}
              />
              <span style={hintStyle}>
                Harus berupa URL langsung ke file gambar (.jpg, .png, .webp).
                Bukan halaman berbagi seperti Google Drive atau share.google.
              </span>

              {isShareGoogle && (
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "0.82rem",
                    margin: "0.25rem 0 0",
                    background: "rgba(239, 68, 68, 0.1)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: 6,
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  ⚠️ URL yang Anda masukkan adalah tautan berbagi Google Drive / share.google. Tautan tersebut bukan direct image dan tidak akan tampil. Silakan unduh gambar dan unggah file langsung melalui tombol di atas.
                </p>
              )}
            </div>
          </div>

          {/* Tools & GitHub & Live URL */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span style={labelStyle}>Tools / Teknologi</span>
              <input
                name="tools"
                defaultValue={values.tools}
                disabled={isPending}
                placeholder="Python, Pandas, Scikit-Learn, Streamlit"
                style={inputStyle}
              />
              <span style={hintStyle}>
                Pisahkan dengan tanda koma (contoh: Python, Next.js, PyTorch).
              </span>
            </label>

            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span style={labelStyle}>URL Repositori GitHub</span>
              <input
                name="github_url"
                type="url"
                defaultValue={values.github_url}
                disabled={isPending}
                placeholder="https://github.com/username/project"
                style={inputStyle}
              />
              <span style={hintStyle}>Opsional, tautan source code.</span>
            </label>
          </div>

          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span style={labelStyle}>URL Live Demo / Website</span>
            <input
              name="live_url"
              type="url"
              defaultValue={values.live_url}
              disabled={isPending}
              placeholder="https://myproject.vercel.app"
              style={inputStyle}
            />
            <span style={hintStyle}>Opsional, tautan aplikasi yang berjalan.</span>
          </label>

          {/* Tombol Aksi */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginTop: "1rem",
              alignItems: "center",
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
                padding: "0.8rem 1.4rem",
                fontWeight: 600,
                cursor: isPending ? "wait" : "pointer",
                opacity: isPending ? 0.7 : 1,
                fontSize: "0.95rem",
              }}
            >
              {isPending ? "Memperbarui Proyek..." : "Simpan Perubahan"}
            </button>
            <Link
              href="/admin/projects"
              style={{
                background: "transparent",
                border: "1px solid rgba(232, 232, 232, 0.2)",
                borderRadius: 999,
                color: "inherit",
                padding: "0.8rem 1.4rem",
                display: "inline-block",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Batal
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.88rem",
  fontWeight: 500,
  color: "rgba(232, 232, 232, 0.9)",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "rgba(232, 232, 232, 0.5)",
  marginTop: "0.15rem",
};

const inputStyle: React.CSSProperties = {
  padding: "0.8rem 1rem",
  borderRadius: 10,
  border: "1px solid rgba(232, 232, 232, 0.2)",
  background: "rgba(255, 255, 255, 0.02)",
  color: "inherit",
  font: "inherit",
  fontSize: "0.95rem",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: "#18181b",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 120,
};
