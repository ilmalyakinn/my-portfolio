import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticle } from "@/lib/getArticle";
import { getArticles } from "@/lib/getArticles";
import { formatCategory } from "@/lib/categories";
import styles from "@/styles/writing.module.css";

export const revalidate = 60;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    lang?: string;
  }>;
};

/* ===== Static Params ===== */
export async function generateStaticParams() {
  try {
    const articles = await getArticles();
    return articles.map((a) => ({ slug: a.slug }));
  } catch (err) {
    console.error("Error generating static params for articles:", err);
    return [];
  }
}

/* ===== Metadata ===== */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const searchParams = (await props.searchParams) ?? {};
  const lang = searchParams.lang === "en" ? "en" : "id";
  const article = await getArticle(slug, { lang });

  if (!article) {
    return { title: "Article not found" };
  }

  const fm = article.frontmatter || {};
  const title = fm.title ?? slug;
  const description = fm.summary || fm.description || "";
  const articleUrl = `https://your-domain.com/writing/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: articleUrl,
      type: "article",
      publishedTime: fm.date,
      authors: ["Ilmal"],
      ...(fm.cover_image ? { images: [{ url: fm.cover_image }] } : {}),
    },
    twitter: {
      card: fm.cover_image ? "summary_large_image" : "summary",
      title,
      description,
      ...(fm.cover_image ? { images: [fm.cover_image] } : {}),
    },
  };
}

/* ===== Page ===== */
export default async function ArticlePage(props: PageProps) {
  const { slug } = await props.params;
  const searchParams = (await props.searchParams) ?? {};
  const activeLang = searchParams.lang === "en" ? "en" : "id";
  const article = await getArticle(slug, { lang: activeLang });

  if (!article) {
    notFound();
  }

  const fm = article.frontmatter || {};
  const isCmsArticle = article.source === "supabase";
  const isEnglishRequested = activeLang === "en";
  const isEnglishFallback =
    isEnglishRequested &&
    isCmsArticle &&
    !fm.content_en &&
    Boolean(fm.content_id);

  return (
    <article className={styles.articleContainer}>
      <Link href="/writing" className={styles.backLink}>
        ← Back to Writing
      </Link>

      <div className={styles.articleHeader}>
        {fm.category && (
          <span className={styles.articleCategory}>
            {formatCategory(fm.category)}
          </span>
        )}
        <h1>{fm.title || slug}</h1>
        {fm.date && <p className={styles.articleMeta}>{fm.date}</p>}

        {isCmsArticle && (
          <div className={styles.langSwitcher}>
            <span className={styles.langLabel}>Bahasa:</span>
            <Link
              href={`/writing/${slug}?lang=id`}
              className={`${styles.langBtn} ${activeLang === "id" ? styles.langBtnActive : ""}`}
              scroll={false}
              replace
            >
              🇮🇩 Indonesia
            </Link>
            <Link
              href={`/writing/${slug}?lang=en`}
              className={`${styles.langBtn} ${activeLang === "en" ? styles.langBtnActive : ""}`}
              scroll={false}
              replace
            >
              🇬🇧 English
            </Link>
          </div>
        )}

        {isEnglishFallback && (
          <div className={styles.langNotice}>
            Versi Bahasa Inggris belum tersedia. Menampilkan versi Bahasa Indonesia.
          </div>
        )}
      </div>

      {fm.cover_image && (
        <div className={styles.coverImageWrapper}>
          <img
            src={fm.cover_image}
            alt={fm.title || slug}
            className={styles.coverImage}
          />
        </div>
      )}

      <hr className={styles.divider} />

      {article.html && (
        <div
          className={styles.articleContent}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      )}
    </article>
  );
}
