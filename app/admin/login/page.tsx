import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LoginForm from "@/components/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; reset?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (isAdmin && !adminError) {
      redirect("/admin");
    }
  }

  const errorMessage =
    params.error === "not_admin"
      ? "This account is not authorized to access the admin area."
      : params.error === "invalid" || params.error === "auth_error"
        ? "Login failed. Please check your email and password."
        : "";

  const successMessage =
    params.reset === "success"
      ? "Password updated successfully. Please sign in with your new password."
      : "";

  return (
    <LoginForm errorMessage={errorMessage} successMessage={successMessage} />
  );
}
