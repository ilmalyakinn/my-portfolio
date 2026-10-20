import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ilmal Yakin Nurahman’s background in data science, machine learning, NLP, and analytics.",
};

const skillGroups = [
  {
    title: "Programming",
    items: ["Python", "SQL"],
  },
  {
    title: "Data Analysis",
    items: ["Pandas", "NumPy", "EDA", "Microsoft Excel", "Streamlit"],
  },
  {
    title: "Machine Learning & Deep Learning",
    items: ["Scikit-learn", "TensorFlow", "Keras", "MobileNetV2", "YOLOv8"],
  },
  {
    title: "NLP & Computer Vision",
    items: [
      "LSTM",
      "Bi-LSTM",
      "RoBERTa",
      "Lexicon-based Labeling",
      "OCR",
      "Object Detection",
    ],
  },
  {
    title: "Tools",
    items: ["Google Colab", "Git", "GitHub", "Visual Studio Code"],
  },
];

const featuredProjects = [
  {
    title: "DiaBites — Nutrition Analysis",
    tag: "AI nutrition app",
    summary:
      "A web application that analyzes packaged food and beverage products in Indonesia and provides personalized recommendations for healthier consumption decisions.",
    bullets: [
      "Processed and engineered features from 1,651 product records, expanding them to 11,557 rows after augmentation.",
      "Used YOLOv8, OCR, and interactive Streamlit dashboards to extract product nutrition information and present actionable insights.",
    ],
  },
  {
    title: "FruLens — Computer Vision",
    tag: "Mobile AI",
    summary:
      "An Android-based solution for detecting the nutritional content of Indonesian fruits and vegetables in real time.",
    bullets: [
      "Managed more than 4,000 images and developed a MobileNetV2-based classification model for real-time visual recognition.",
      "Built the computer vision pipeline in Python with TensorFlow and Keras for mobile deployment.",
    ],
  },
  {
    title: "Thesis Research — Sentiment Analysis",
    tag: "NLP research",
    summary:
      "A public sentiment study on the Free Nutritious Meals program on X using deep learning and hybrid labeling approaches.",
    bullets: [
      "Compared LSTM and Bi-LSTM models using Lexicon-based and RoBERTa-based labeling strategies.",
      "Applied NLP preprocessing and model evaluation for sentiment classification across public social-media discussions.",
    ],
  },
  {
    title: "School Operations & Digitalization",
    tag: "Data operations",
    summary:
      "Supported school data governance and digital operations by organizing student information, platform administration, and content documentation.",
    bullets: [
      "Managed student and new applicant data with Microsoft Excel to improve consistency and governance.",
      "Supported school digitalization and public communication efforts through Smartsis administration and social media management.",
    ],
  },
];

const certifications = [
  "Advanced Learning Algorithms — DeepLearning.AI",
  "Prompt Design in Vertex AI Skill Badge — Google Cloud",
  "Introduction to TensorFlow for Artificial Intelligence, Machine Learning, and Deep Learning — DeepLearning.AI",
  "Belajar Matematika untuk Data Science — Dicoding",
  "Generative AI for Everyone — DeepLearning.AI",
];

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>About Me</span>
            <h1 className={styles.title}>
              I turn <span className={styles.titleAccent}>data</span> into
              <br /> practical decisions.
            </h1>
            <p className={styles.lead}>
              I am a Bachelor of Information Systems graduate from Universitas
              Al-Ghifari with a strong interest in Data Science and Data
              Analysis, Machine Learning and Deep Learning, Natural Language
              Processing (NLP), and Computer Vision and OCR. I enjoy turning raw
              information into clear insights that can support better decision-
              making, whether through exploratory analysis, predictive modeling,
              or AI-powered applications.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/projects" className={styles.primaryButton}>
                Explore projects
              </Link>
              <Link href="/writing" className={styles.secondaryButton}>
                Read writing
              </Link>
            </div>
          </div>

          <aside
            className={styles.summaryCard}
            aria-label="Quick profile summary"
          >
            <div className={styles.summaryTitle}>Focus Areas</div>
            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} />
                <span>Data Science &amp; Data Analysis</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} />
                <span>Machine Learning &amp; Deep Learning</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} />
                <span>Natural Language Processing</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} />
                <span>Computer Vision &amp; OCR</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>My Journey</h2>
        </div>

        <div className={styles.journeyList}>
          <article className={styles.journeyItem}>
            <div className={styles.journeyPeriod}>Feb 2026 – Jul 2026</div>
            <div className={styles.journeyBody}>
              <h3>Coding Camp powered by DBS Foundation</h3>
              <p>
                Completed the intensive Data Science training program and earned
                the Distinction Graduate recognition. This learning path helped
                strengthen my understanding of end-to-end Data Science work,
                including exploratory data analysis, preprocessing, feature
                engineering, model development, and the communication of data
                insights through practical applications.
              </p>
            </div>
          </article>

          <article className={styles.journeyItem}>
            <div className={styles.journeyPeriod}>Sep 2024 – Jan 2025</div>
            <div className={styles.journeyBody}>
              <h3>Bangkit Academy — Machine Learning Track</h3>
              <p>
                Joined the Machine Learning track where I developed a stronger
                foundation in building ML pipelines from data preparation to
                model training and application integration. The experience
                sharpened my ability to work with real datasets, optimize model
                performance, and collaborate across technical teams in
                product-oriented AI projects.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Featured Experience &amp; Projects</h2>
        </div>

        <div className={styles.experienceGrid}>
          {featuredProjects.map((project) => (
            <article key={project.title} className={styles.projectCard}>
              <span className={styles.projectTag}>{project.tag}</span>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Technical Skills</h2>
        </div>

        <div className={styles.skillGrid}>
          {skillGroups.map((group) => (
            <div key={group.title} className={styles.skillGroup}>
              <h3>{group.title}</h3>
              <div className={styles.tagList}>
                {group.items.map((item) => (
                  <span key={item} className={styles.tag}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Leadership &amp; Collaboration</h2>
        </div>

        <ul className={styles.leadershipList}>
          <li>
            Served as Head of Education Division at HIMASI Universitas
            Al-Ghifari, coordinating programs and improving student engagement
            through structured learning initiatives and educational events.
          </li>
          <li>
            Mentored new students in the GENESIS FTI program, helping them adapt
            to academic expectations and develop teamwork, communication, and
            problem-solving habits.
          </li>
          <li>
            These experiences strengthened my ability to lead teams, organize
            initiatives, communicate clearly, and work through complex problems
            with a collaborative mindset.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Education &amp; Recognition</h2>
        </div>

        <div className={styles.educationGrid}>
          <div className={styles.educationCard}>
            <h3>Bachelor of Information Systems</h3>
            <p>Universitas Al-Ghifari</p>
            <p>September 2022 – September 2026</p>
            <p>GPA: 3.85 / 4.00</p>
          </div>

          <div className={styles.recognitionCard}>
            <h3>Recognition</h3>
            <ul>
              <li>
                Distinction Graduate — Coding Camp 2026 powered by DBS
                Foundation
              </li>
              <li>
                Selected training and certification highlights relevant to AI
                and data work
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.sectionHeader} style={{ marginTop: "1.5rem" }}>
          <h3>Relevant Certifications</h3>
        </div>

        <div className={styles.recognitionCard}>
          <ul>
            {certifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.ctaPanel}>
          <p className={styles.ctaText}>
            <strong>Let’s connect.</strong> I am open to data science, machine
            learning, and analytics opportunities where I can contribute through
            technical depth and thoughtful problem-solving.
          </p>

          <div className={styles.ctaRow}>
            <a
              href="https://github.com/ilmalyakin-n"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryButton}
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ilmalyakinn/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryButton}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
