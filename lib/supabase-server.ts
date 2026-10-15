import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const normalizeSupabaseUrl = (url?: string) =>
  url
    ?.trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1\/?$/i, "") ?? url;

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The server component cannot set cookies directly.
          }
        },
      },
    },
  );
}
