export type ProjectMeta = {
  slug: string;
  title: string;
  category?: string | null;
  year?: string | number | null;
  short_description?: string | null;
  description?: string | null;
  tools?: string[];
  tech?: string[];
  image_url?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  source?: "supabase";
};

export type ProjectData = ProjectMeta & {
  html?: string;
  content?: string;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  year?: number | null;
  short_description?: string | null;
  description?: string | null;
  tools?: string[] | null;
  image_url?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
