# Portfolio Project Context

> Dokumen ini adalah sumber konteks utama untuk AI Agent yang bekerja pada project portfolio ini.
>
> AI Agent WAJIB membaca dan memahami dokumen ini sebelum melakukan perubahan kode.
>
> Dokumen ini bukan prompt implementasi. Dokumen ini berfungsi sebagai project specification, architectural context, constraints, dan development rules.

---

# 1. Project Overview

Project ini adalah website portfolio pribadi milik Ilmal.

Website digunakan untuk:

- Personal branding
- Menampilkan project
- Menulis artikel
- Menampilkan kemampuan dan pengalaman
- Menjadi portfolio profesional untuk kebutuhan akademik maupun profesional

Website harus memiliki karakter:

- Minimal
- Modern
- Profesional
- Clean
- Cepat
- Mudah diakses
- Mudah dikelola
- Mudah dikembangkan
- Tidak over-engineered

Prioritas utama project:

> Simplicity, stability, maintainability, performance, dan usability.

Jangan menambahkan fitur hanya karena fitur tersebut memungkinkan dibuat.

Setiap fitur harus memiliki alasan yang jelas dan memberikan manfaat nyata.

---

# 2. Project Owner

Name:

Ilmal

Role / Positioning:

Information Systems Student with interests in:

- Data Science
- Data Analytics
- Machine Learning
- Artificial Intelligence
- Technology
- Writing

Website ini bukan website perusahaan.

Website ini adalah personal portfolio.

Karena itu, sistem administrasi harus dibuat sederhana dan hanya memenuhi kebutuhan personal content management.

---

# 3. Current Technology Stack

Project menggunakan:

- Next.js
- TypeScript
- React
- Next.js App Router
- Vercel
- CSS / global CSS
- Supabase

Styling saat ini menggunakan:

- `globals.css`
- CSS biasa
- CSS variables

JANGAN mengganti styling architecture ke:

- Tailwind CSS
- Bootstrap
- Material UI
- Chakra UI
- UI framework lain

kecuali ada instruksi eksplisit.

---

# 4. Deployment

Website di-host menggunakan:

Vercel

Production deployment harus tetap kompatibel dengan Vercel.

Setiap perubahan harus memperhatikan:

- Production build
- Server-side rendering
- Static generation
- Environment variables
- Vercel runtime
- Production security

Local development dan production harus diuji secara terpisah jika diperlukan.

---

# 5. Existing Public Navigation

Navbar publik harus berisi:

- Home
- Projects
- Writing
- About

Contact TIDAK boleh ditampilkan di navbar.

Navbar harus konsisten pada:

- Desktop
- Tablet
- Mobile

---

# 6. Contact Page

Halaman Contact TIDAK dihapus.

Route `/contact` tetap dipertahankan.

Yang dihapus hanya link Contact dari navbar.

Jangan menghapus:

```text
app/contact/
```

kecuali ada instruksi eksplisit di masa depan.

---

# 7. Public Website Structure

Public website memiliki route utama:

```text
/
├── /projects
│   └── /projects/[slug]
│
├── /writing
│   └── /writing/[slug]
│
├── /about
│
└── /contact
```

Home:

```text
/
```

Projects:

```text
/projects
/projects/[slug]
```

Writing:

```text
/writing
/writing/[slug]
```

About:

```text
/about
```

Contact:

```text
/contact
```

---

# 8. Admin System

Website memiliki private admin management system.

Admin system digunakan untuk mengelola:

1. Articles
2. Projects

Admin system TIDAK digunakan untuk:

- User management
- Public registration
- Role management
- Category management
- Analytics kompleks
- CMS enterprise features

---

# 9. Admin Routes

Admin menggunakan struktur:

```text
/admin/login

/admin

/admin/articles
/admin/articles/new
/admin/articles/[id]/edit

/admin/projects
/admin/projects/new
/admin/projects/[id]/edit
```

---

# 10. Authentication

Authentication menggunakan Supabase Auth.

Hanya admin yang dapat mengakses:

```text
/admin
/admin/articles
/admin/projects
```

User biasa tidak boleh mengakses halaman management.

Jika user belum authenticated dan mencoba membuka halaman admin:

```text
/admin/*
```

user harus diarahkan ke:

```text
/admin/login
```

Tidak perlu membuat public registration.

Tidak perlu membuat sistem multi-role.

Sistem ini hanya ditujukan untuk satu personal portfolio.

---

# 11. Admin Authentication Security

Jangan menyimpan password admin secara manual di database aplikasi.

Jangan membuat authentication sendiri.

Gunakan:

Supabase Auth.

Jangan expose:

- service role key
- secret key
- password
- private credentials

ke client-side code.

Environment variables harus digunakan untuk credentials.

---

# 12. Database

Database menggunakan:

Supabase PostgreSQL.

Database utama terdiri dari:

```text
articles
projects
```

Tidak perlu membuat database yang kompleks.

---

# 13. Article Database

Table:

```text
articles
```

Field yang direncanakan:

```text
id
slug

title_id
title_en

excerpt_id
excerpt_en

content_id
content_en

category

cover_image

published_at

created_at
updated_at
```

---

# 14. Article Categories

Article hanya memiliki 3 kategori.

Kategori bersifat FIXED.

Kategori:

```text
Pendidikan
Publikasi
Data Science
```

Nilai internal yang direkomendasikan:

```text
education
publications
data-science
```

Admin TIDAK dapat:

- Membuat kategori baru
- Menghapus kategori
- Mengubah daftar kategori

Admin hanya dapat memilih salah satu kategori ketika membuat artikel.

Contoh:

```text
Category:
[ Data Science ]
```

Jangan membuat:

```text
Add Category
Create Category
Manage Categories
```

di admin dashboard.

Jika kategori baru ingin ditambahkan di masa depan, perubahan dilakukan melalui source code dan database schema secara sengaja oleh developer.

---

# 15. Article "All" Filter

`All` bukan category database.

`All` adalah filter pada UI.

Contoh:

```text
All
Pendidikan
Politik
Data Science
```

Jika user memilih:

```text
All
```

maka semua artikel ditampilkan.

Jika memilih:

```text
Pendidikan
```

hanya artikel dengan category:

```text
education
```

yang ditampilkan.

---

# 16. Article Language

Artikel mendukung dua bahasa:

```text
Indonesia
English
```

Bahasa default:

```text
Indonesia
```

Setiap artikel dapat memiliki:

```text
title_id
title_en

excerpt_id
excerpt_en

content_id
content_en
```

User dapat memilih bahasa melalui language switcher.

Default:

```text
🇮🇩 Indonesia
```

User dapat memilih:

```text
🇬🇧 English
```

Jika versi English tidak tersedia, language switcher English tidak boleh menghasilkan halaman kosong.

---

# 17. Article Translation

JANGAN menggunakan automatic translation sebagai bagian wajib dari CMS.

Admin menulis:

- Indonesian version
- English version

secara manual.

Tujuannya:

- Kualitas tulisan lebih terkontrol
- Tidak bergantung pada translation API
- Tidak menambah biaya
- Tidak menambah kompleksitas
- Mengurangi kemungkinan translation bug

---

# 18. Article Images

Artikel harus mendukung image.

Image dapat berada:

- Di awal artikel
- Di tengah artikel
- Di akhir artikel

Tidak membatasi jumlah image.

Jangan membuat struktur database seperti:

```text
image_1
image_2
image_3
```

Content harus menggunakan format yang memungkinkan inline image.

Contoh konsep:

```text
Text

Image

Text

Image

Text
```

Image disimpan menggunakan Supabase Storage.

---

# 19. Article Cover Image

Artikel dapat memiliki cover image.

Cover image berbeda dengan inline image.

Cover image digunakan untuk:

- Article card
- Article header
- Social preview jika diperlukan

Inline image digunakan di dalam content.

---

# 20. Article Public Page

Route:

```text
/writing
```

Writing page harus memiliki:

```text
Search
Category Filter
Article List
```

Category filter:

```text
All
Pendidikan
Politik
Data Science
```

Search dan category filter harus dapat digunakan secara bersamaan.

Contoh:

```text
Category:
Data Science

Search:
machine learning
```

Hasil hanya menampilkan artikel Data Science yang sesuai dengan search query.

---

# 21. Writing Layout

Desktop:

```text
2 columns
```

Contoh:

```text
┌──────────────────┐ ┌──────────────────┐
│ Article          │ │ Article          │
│                  │ │                  │
│ Title            │ │ Title            │
│ Category         │ │ Category         │
│ Date             │ │ Date             │
│ Excerpt          │ │ Excerpt          │
└──────────────────┘ └──────────────────┘
```

Mobile:

```text
1 column
```

Jangan memaksakan dua kolom pada layar kecil.

---

# 22. Article Detail

Route:

```text
/writing/[slug]
```

Article detail harus menampilkan:

- Back to Writing
- Category
- Title
- Date
- Language switcher
- Article content
- Images
- Proper typography

Existing article reading experience harus dipertahankan kecuali ada instruksi eksplisit untuk mengubahnya.

---

# 23. Article Publishing

Tidak menggunakan Draft system.

Tidak menggunakan Approval workflow.

Tidak menggunakan Scheduled publishing.

Setelah admin menyimpan artikel:

```text
Publish
```

artikel langsung tersedia pada public website.

---

# 24. Project Database

Table:

```text
projects
```

Field:

```text
id
slug
title
category
year
short_description
description
tools
image_url
github_url
live_url
created_at
updated_at
```

---

# 25. Project Categories

Project hanya memiliki 4 kategori FIXED:

```text
Data Science
Dashboard
Machine Learning
Creative Branding Project
```

Nilai internal yang direkomendasikan:

```text
data-science
dashboard
machine-learning
creative-branding
```

Admin tidak dapat membuat kategori baru.

Tidak perlu category management.

---

# 26. Project Public Page

Route:

```text
/projects
```

Halaman menampilkan:

- Project image
- Project title
- Category
- Tools
- Short description
- GitHub button
- Live project button

Filter:

```text
All
Data Science
Dashboard
Machine Learning
Creative Branding Project
```

---

# 27. Project Detail Page

Route:

```text
/projects/[slug]
```

Detail project menampilkan:

- Project image
- Title
- Category
- Year
- Tools
- Full description
- GitHub link
- Live project link

Jika GitHub URL tidak tersedia:

Jangan tampilkan tombol GitHub.

Jika Live Project URL tidak tersedia:

Jangan tampilkan tombol Live Project.

Jangan membuat dead button.

---

# 28. Project Admin

Admin dapat:

- Create project
- Edit project
- Delete project

Field:

```text
Title
Category
Year
Short Description
Description
Tools
Project Image
GitHub URL
Live Project URL
```

Setelah publish:

Project langsung muncul di public website.

---

# 29. Image Storage

Supabase Storage digunakan untuk image.

Direkomendasikan menggunakan bucket:

```text
portfolio-images
```

Struktur:

```text
portfolio-images/
├── articles/
└── projects/
```

Article images tidak boleh bercampur dengan project images jika tidak diperlukan.

---

# 30. Database Security

Supabase Row Level Security (RLS) WAJIB digunakan.

Public user:

```text
SELECT published articles
SELECT projects
```

Admin authenticated:

```text
SELECT
INSERT
UPDATE
DELETE
```

Jangan hanya mengandalkan frontend authentication.

Database harus tetap aman walaupun request dilakukan secara langsung.

---

# 31. Existing MDX Content

Project sebelumnya menggunakan MDX untuk articles/projects.

Existing MDX content TIDAK boleh langsung dihapus.

Migration harus dilakukan secara bertahap.

Contoh:

```text
content/articles/hello-world.mdx
```

harus tetap tersedia selama migration.

Setelah:

1. Supabase database berjalan
2. Article berhasil dimasukkan ke database
3. Public Writing berhasil membaca database
4. Article detail berhasil
5. Image berhasil
6. Production build berhasil

baru pertimbangkan menghapus atau menghentikan penggunaan MDX.

---

# 32. Migration Principle

JANGAN melakukan big-bang migration.

Gunakan:

```text
Existing System
       ↓
New System
       ↓
Validate
       ↓
Switch
       ↓
Remove Old System
```

Bukan:

```text
Delete old system
       ↓
Build new system
```

---

# 33. Existing UI Preservation

UI existing sudah memiliki:

- Dark visual
- Navbar
- Container
- Writing typography
- Project cards
- Home hero
- Responsive layout

JANGAN mengubah visual existing yang tidak berkaitan dengan task.

Jika task hanya:

```text
Add authentication
```

jangan mengubah:

- Hero
- Navbar styling
- Project card styling
- Typography

kecuali memang diperlukan.

---

# 34. Mobile Requirements

Semua fitur harus responsive.

Desktop:

```text
> 768px
```

Mobile:

```text
<= 768px
```

Article:

```text
Desktop → 2 columns
Mobile → 1 column
```

Project:

```text
Desktop → multi-column cards
Mobile → 1 column
```

Admin dashboard juga harus usable di mobile.

---

# 35. Performance Requirements

Website harus tetap ringan.

Jangan menambahkan library besar tanpa alasan.

Prioritaskan:

- Next.js Image
- Server Components jika memungkinkan
- Minimal client components
- Optimized image sizes
- Lazy loading untuk image yang tidak berada di initial viewport

Jangan mengubah server component menjadi client component kecuali memang diperlukan.

---

# 36. Dependency Rules

Jangan menambahkan dependency baru hanya untuk menyelesaikan masalah sederhana.

Sebelum menambahkan package:

1. Periksa apakah Next.js/React sudah menyediakan solusi.
2. Periksa apakah project sudah memiliki dependency yang dapat digunakan.
3. Jika memang perlu package baru, jelaskan alasannya terlebih dahulu.

Jangan mengganti package yang sudah bekerja tanpa alasan.

---

# 37. API / Server Rules

Data yang membutuhkan secret credentials harus diproses server-side.

Jangan memasukkan:

```text
SUPABASE_SERVICE_ROLE_KEY
```

ke client.

Public Supabase key dapat digunakan sesuai arsitektur Supabase, tetapi RLS harus tetap aktif.

---

# 38. Environment Variables

Local environment:

```text
.env.local
```

Environment variables tidak boleh di-commit ke Git.

`.env.local` harus masuk `.gitignore`.

Production environment variables harus dikonfigurasi di Vercel.

---

# 39. Development Workflow

Project harus dikembangkan secara bertahap.

Setiap phase harus:

1. Memeriksa kondisi existing project.
2. Mengubah hanya file yang diperlukan.
3. Menjalankan type check/build yang relevan.
4. Memastikan route existing tidak rusak.
5. Melaporkan file yang berubah.
6. Menunggu validasi sebelum melanjutkan phase berikutnya.

---

# 40. Git Checkpoint

Sebelum perubahan besar:

```bash
git status
git add .
git commit -m "chore: checkpoint before cms migration"
git push
```

Setiap major phase sebaiknya memiliki commit sendiri.

Contoh:

```text
chore: checkpoint before supabase integration

feat: add supabase authentication

feat: add article management

feat: migrate writing to database

feat: add project management

feat: migrate projects to database

fix: remove contact from navbar
```

---

# 41. AI Agent Rules

AI Agent WAJIB:

- Membaca `PROJECT_CONTEXT.md`
- Memeriksa existing implementation sebelum mengedit
- Tidak mengasumsikan struktur file
- Tidak menghapus fitur existing tanpa instruksi
- Tidak melakukan refactor besar tanpa persetujuan
- Tidak mengubah architecture tanpa alasan
- Tidak mengerjakan phase berikutnya sebelum phase sekarang selesai
- Tidak mengubah styling unrelated
- Tidak membuat dependency baru tanpa alasan

---

# 42. Incremental Development

Jika task terlalu besar, AI Agent harus membaginya menjadi beberapa langkah.

Contoh:

Jangan:

```text
Build complete CMS.
```

Tetapi:

```text
1. Create Supabase client
2. Configure environment
3. Test connection
4. Create authentication
5. Protect admin route
6. Test authentication
```

Setiap langkah harus dapat diverifikasi.

---

# 43. Error Handling Rule

Jika terjadi error:

AI Agent TIDAK boleh:

- Menghapus fitur untuk menghilangkan error
- Mengganti architecture secara tiba-tiba
- Menambahkan banyak dependency
- Menulis ulang seluruh project

AI Agent harus:

1. Identifikasi error sebenarnya.
2. Jelaskan penyebab.
3. Tentukan file yang terkait.
4. Buat perubahan minimal.
5. Test kembali.

---

# 44. Build Requirement

Sebelum menyatakan phase selesai:

```bash
npm run build
```

harus berhasil jika phase tersebut mempengaruhi production build.

Jika build gagal:

JANGAN lanjut ke phase berikutnya.

---

# 45. Phase Roadmap

## Phase 0 — Safety Check

Tujuan:

Membuat checkpoint project sebelum perubahan besar.

Tasks:

- Check git status
- Commit current working state
- Push to GitHub
- Verify current production deployment

Status:

```text
NOT STARTED
```

---

## Phase 1 — Supabase Setup

Tujuan:

Menyiapkan infrastructure.

Tasks:

- Create Supabase project
- Configure database
- Configure Authentication
- Configure Storage
- Prepare environment variables
- Prepare RLS
- Verify connection

Beberapa langkah dilakukan MANUAL oleh project owner.

Status:

```text
NOT STARTED
```

---

## Phase 2 — Authentication

Tujuan:

Membuat admin login.

Tasks:

- Supabase client
- Admin login
- Session handling
- Protected admin routes
- Logout
- Error states

Status:

```text
NOT STARTED
```

---

## Phase 3 — Admin Dashboard

Tujuan:

Membuat admin interface.

Tasks:

- Dashboard
- Admin navigation
- Articles management page
- Projects management page

Status:

```text
NOT STARTED
```

---

## Phase 4 — Article CMS

Tasks:

- Create article
- Edit article
- Delete article
- Category selection
- Indonesian content
- English content
- Image upload
- Inline images
- Publish

Status:

```text
NOT STARTED
```

---

## Phase 5 — Writing Database Migration

Tasks:

- Read articles from Supabase
- Preserve article detail route
- Preserve search
- Add category filtering
- Add language switch
- Verify old MDX article migration

Status:

```text
NOT STARTED
```

---

## Phase 6 — Project CMS

Tasks:

- Create project
- Edit project
- Delete project
- Category selection
- Image upload
- GitHub URL
- Live URL

Status:

```text
NOT STARTED
```

---

## Phase 7 — Projects Database Migration

Tasks:

- Read projects from Supabase
- Project cards
- Category filter
- Project detail
- External links

Status:

```text
NOT STARTED
```

---

## Phase 8 — Navbar Cleanup

Tasks:

- Remove Contact from desktop navbar
- Remove Contact from mobile navbar
- Preserve `/contact`

Status:

```text
NOT STARTED
```

---

## Phase 9 — Responsive & UX Audit

Check:

- Desktop
- Tablet
- Mobile
- Admin mobile
- Article reading
- Image display
- Search
- Filters
- Language switcher
- Project links

Status:

```text
NOT STARTED
```

---

## Phase 10 — Production QA

Tasks:

```text
npm run build
```

Then:

- Git commit
- Git push
- Vercel deployment
- Production test
- Authentication test
- Article CRUD test
- Project CRUD test
- Image upload test

Status:

```text
NOT STARTED
```

---

# 46. Manual Tasks vs AI Tasks

## Project Owner MUST do manually

These actions require account access or secret credentials:

- Create Supabase account/project
- Create admin authentication account
- Configure Supabase project credentials
- Copy environment variables
- Configure Vercel environment variables
- Execute/verify SQL in Supabase
- Verify Supabase Storage
- Verify RLS policies
- Push/deploy when requested

Never send passwords or secret keys to an AI agent.

---

## AI Agent CAN handle

AI Agent dapat menangani:

- Next.js code
- React components
- TypeScript
- CSS
- Supabase client integration
- Authentication UI
- Protected routes
- Database queries
- CRUD logic
- Article editor
- Project editor
- Image upload implementation
- Search
- Filters
- Language switcher
- Responsive UI
- Error handling
- Validation
- Build verification

---

# 47. Definition of Done

A phase dianggap selesai hanya jika:

- Implementation selesai
- Existing functionality tidak rusak
- Relevant routes dapat dibuka
- TypeScript tidak memiliki error terkait implementation
- `npm run build` berhasil jika relevan
- No unnecessary dependency
- No unrelated refactor
- Security requirement terpenuhi
- AI Agent menjelaskan perubahan
- Project owner sudah memverifikasi hasil

Jangan menyatakan phase selesai hanya karena kode telah ditulis.

---

# 48. Most Important Rule

> DO NOT BREAK EXISTING FUNCTIONALITY.

Setiap perubahan harus bersifat:

```text
Incremental
Minimal
Testable
Reversible
Maintainable
```

Jika sebuah perubahan membutuhkan perubahan architecture yang besar, AI Agent harus menjelaskan alasannya terlebih dahulu sebelum melanjutkan.

---

# 49. Final Project Philosophy

Website ini bukan CMS besar.

Website ini adalah:

> A simple, professional, maintainable personal portfolio with a lightweight private content management system.

Prioritas:

```text
1. Stability
2. Security
3. Simplicity
4. Maintainability
5. Performance
6. UX
7. Visual polish
```

Jika terdapat dua solusi:

```text
Solution A = complex but feature-rich
Solution B = simple and reliable
```

Prioritaskan:

```text
Solution B
```

selama kebutuhan project tetap terpenuhi.
