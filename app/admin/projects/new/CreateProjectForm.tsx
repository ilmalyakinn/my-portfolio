"use client";

import Link from "next/link";
import { useActionState, useState, useRef } from "react";
import { createProjectAction, type ProjectFormState } from "../actions";

const defaultValues = {
  title: "",
  slug: "",
  category: "data-science",
  year: new Date().getFullYear().toString(),
  short_description: "",
  description: "",
  tools: "",
  image_url: "",
  github_url: "",
  live_url: "",
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export default function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction, {
    values: defaultValues,
  } as ProjectFormState);

  const values = state.values ?? defaultValues;

  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // External URL state
  const [externalUrl, setExternalUrl] = useState(values.image_url);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
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
        <h1 style={{ margin: "0.35rem 0 0" }}>Tambah Proyek Baru</h1>
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
                placeholder="Contoh: Churn Prediction Analytics"
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
                placeholder="churn-prediction-analytics"
                style={inputStyle}
              />
              <span style={hintStyle}>
                Slug dibuat otomatis dari judul. Dapat disesuaikan manual.
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
              <span style={hintStyle}>
                Pilih bidang yang sesuai untuk filter proyek.
              </span>
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
                placeholder="2025"
                style={inputStyle}
              />
              <span style={hintStyle}>
                Tahun pengerjaan atau rilis proyek.
              </span>
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
              placeholder="Ringkasan 1-2 kalimat untuk kartu proyek pada halaman utama..."
              style={inputStyle}
            />
            <span style={hintStyle}>
              Tampil pada ringkasan kartu proyek di daftar proyek.
            </span>
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
            <span style={hintStyle}>
              Opsional, penjelasan mendalam proyek di halaman detail.
            </span>
          </label>

          {/* Upload Gambar Preview */}
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
                Unggah file gambar langsung (disimpan ke Supabase Storage) atau
                masukkan URL file gambar langsung.
              </p>
            </div>

            {/* Area File Upload */}
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
                  id="image_file_input"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileChange}
                  disabled={isPending}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="image_file_input"
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
                  📁 Pilih File Gambar...
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

              {/* Preview Gambar Upload */}
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
                    alt="Preview Unggahan"
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
                      ✓ File Siap Diunggah
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
                Atau Masukkan URL Gambar Eksternal:
              </span>
              <input
                name="image_url"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
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

              {/* Preview External URL jika tidak ada file lokal yang dipilih */}
              {!filePreview && externalUrl && !isShareGoogle && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    borderRadius: 8,
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <img
                    src={externalUrl}
                    alt="Preview External URL"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                    style={{
                      width: 120,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <span style={{ fontSize: "0.82rem", color: "rgba(232, 232, 232, 0.7)" }}>
                    Preview Gambar dari URL Eksternal
                  </span>
                </div>
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
              {isPending ? "Menyimpan Proyek..." : "Simpan Proyek"}
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
              Kembali ke Daftar Proyek
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
