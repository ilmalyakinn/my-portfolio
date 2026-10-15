import { createClient, SupabaseClient } from "@supabase/supabase-js";

const normalizeSupabaseUrl = (url?: string) =>
  url
    ?.trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1\/?$/i, "") ?? url;

let cachedClient: SupabaseClient | null = null;

export function setPublicSupabaseClientForTesting(
  client: SupabaseClient | null,
) {
  cachedClient = client;
}

export function getPublicSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const url = normalizeSupabaseUrl(rawUrl);
  const key = rawKey?.trim();

  if (!url || !key) {
    return null;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize public Supabase client:", err);
    return null;
  }
}
