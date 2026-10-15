import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EditArticleForm from "./EditArticleForm";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) {
    redirect("/admin/articles?error=not_found");
  }

  return <EditArticleForm article={article} />;
}
