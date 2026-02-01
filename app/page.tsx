import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/getProjects";
import { getArticles } from "@/lib/getArticles";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to my portfolio. Explore my data science projects and latest articles on machine learning and analytics.",
};

export default async function Home() {
  const allProjects = await getProjects();
  const allArticles = await getArticles();

  const featuredProjects = allProjects.slice(0, 2);
  const featuredArticles = allArticles.slice(0, 2);

  return (
    <>
      <section className="home-hero">
        <div className="hero-inner">
          <div className="hero-left reveal">
            <h1 className="reveal-subtle">
              Hi, I’m Ilmal.
              <br />
              <strong>Data Science &amp; Analysis</strong>
            </h1>

            <p className="reveal-subtle delay-1">
              As a freelance data scientist/analyst, I translate data into
              valuable and understandable insights. My goal is to provide
              insights, improve outcomes, and drive informed decisions.
            </p>

            <div className="cta-group reveal-subtle delay-2">
              <a
                href="https://github.com/ilmalyakin-n"
                className="btn btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/ilmalyakinn/"
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="hero-right reveal delay-1">
            <img
              src="/profile.WebP"
              alt="Professional photo wearing a black suit and tie with a red background"
              className="profile-img"
            />
          </div>
        </div>
      </section>

      <section className="services-section reveal delay-3">
        <div className="quote-container">
          <span className="quote-symbol">“</span>
          <p className="quote-text">
            I want to help people make the right decisions—decisions based on
            data.
          </p>
        </div>

        <span className="section-label">SERVICES</span>

        <div className="services-intro">
          <p>
            As a freelance data scientist/analyst, I translate data into
            valuable and understandable insights. My goal is to provide
            insights, improve outcomes, and drive informed decisions.
          </p>
          <p>
            I have experience with supervised algorithms, regression models,
            time series, and classification problems. My approach is hands-on,
            and I take responsibility for projects from start to finish.
          </p>
        </div>

        <div className="services-grid">
          {/* 1. Data Science */}
          <div className="service-item">
            <div className="service-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5a2.12 2.12 0 1 1 3 3" />
                <path d="M5.5 15.5a2.12 2.12 0 1 0 3-3" />
                <path d="M15.5 15.5a2.12 2.12 0 1 1-3-3" />
              </svg>
            </div>
            <div className="service-content">
              <h3 className="service-title">Data Science</h3>
              <p className="service-desc">
                Get more from data through predictive models and machine
                learning. I develop predictive models, program code bases from
                scratch, and improve existing models.
              </p>
              <p className="service-tools">
                <strong>Tools:</strong> Python, pandas, scikit-learn
              </p>
            </div>
          </div>

          {/* 2. Data Analysis */}
          <div className="service-item">
            <div className="service-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div className="service-content">
              <h3 className="service-title">Data Analysis</h3>
              <p className="service-desc">
                I specialize in data analysis. I present results and
                recommendations using clear visualizations and explain them to
                (non-)technical stakeholders.
              </p>
              <p className="service-tools">
                <strong>Tools:</strong> SQL, Python, BigQuery, Matplotlib
              </p>
            </div>
          </div>

          {/* 3. Dashboard Development */}
          <div className="service-item">
            <div className="service-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <div className="service-content">
              <h3 className="service-title">Dashboard Development</h3>
              <p className="service-desc">
                I develop interactive dashboards to monitor results or generate
                reports. These tools allow you to explore trends and patterns
                yourself.
              </p>
              <p className="service-tools">
                <strong>Tools:</strong> Power BI, Tableau, Streamlit
              </p>
            </div>
          </div>

          {/* 4. Front-End Web Development */}
          <div className="service-item">
            <div className="service-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="service-content">
              <h3 className="service-title">Front-End Web Development</h3>
              <p className="service-desc">
                As a web developer, I help design and build websites for
                startups and freelancers. These websites are responsive and
                optimized for desktop and smartphones.
              </p>
              <p className="service-tools">
                <strong>Tools:</strong> HTML, CSS, JavaScript, PHP
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2 className="section-title">Featured Projects</h2>
            {allProjects.length > 2 && (
              <Link href="/projects" className="view-all-link">
                View All
              </Link>
            )}
          </div>
          <ul className="featured-list">
            {featuredProjects.map((project) => (
              <li key={project.slug} className="featured-project-item">
                <h3 className="featured-project-title">{project.title}</h3>
                <div className="featured-project-meta">
                  {project.year && (
                    <span className="featured-project-year">
                      {project.year}
                    </span>
                  )}
                  {project.tech && project.tech.length > 0 && (
                    <div className="featured-project-tech">
                      {project.tech.map((tech) => (
                        <span key={tech} className="featured-project-badge">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {project.description && (
                  <p className="featured-project-desc">
                    {project.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Featured Writing */}
      {featuredArticles.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2 className="section-title">Latest Writing</h2>
            {allArticles.length > 2 && (
              <Link href="/writing" className="view-all-link">
                View All
              </Link>
            )}
          </div>
          <ul className="featured-list">
            {featuredArticles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/writing/${article.slug}`}
                  className="featured-article-item"
                >
                  <h3 className="featured-article-title">{article.title}</h3>
                  {article.date && (
                    <span className="featured-article-date">
                      {article.date}
                    </span>
                  )}
                  {article.summary && (
                    <p className="featured-article-summary">
                      {article.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
