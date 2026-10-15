import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const normalizeSupabaseUrl = (url?: string) =>
  url
    ?.trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1\/?$/i, "") ?? url;

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";
  const isResetPasswordRoute =
    request.nextUrl.pathname === "/admin/reset-password";

  if (!isAdminRoute) {
    return response;
  }

  if (isLoginRoute || isResetPasswordRoute) {
    return response;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.info("[proxy] getUser", {
    hasUser: Boolean(user),
    hasUserError: Boolean(userError),
    userErrorMessage: userError?.message ?? null,
  });

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  console.info("[proxy] is_admin", {
    isAdmin: Boolean(isAdmin),
    hasAdminError: Boolean(adminError),
    adminErrorMessage: adminError?.message ?? null,
  });

  if (!isAdmin || adminError) {
    const loginUrl = new URL("/admin/login?error=not_admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
