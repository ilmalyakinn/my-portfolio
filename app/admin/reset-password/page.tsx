import { createSupabaseServerClient } from "@/lib/supabase-server";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function AdminResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const hasValidSession = Boolean(user && !error);

  return <ResetPasswordForm hasValidSession={hasValidSession} />;
}
