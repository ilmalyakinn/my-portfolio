import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CreateArticleForm from "./CreateArticleForm";

export default async function NewArticlePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (!isAdmin || adminError) {
    redirect("/admin/login?error=not_admin");
  }

  return <CreateArticleForm />;
}
