"use client";

import { deleteArticleAction } from "./actions";

export default function DeleteArticleForm({
  articleId,
}: {
  articleId: string;
}) {
  return (
    <form
      action={deleteArticleAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Delete this article? This action cannot be undone.",
        );
        if (!confirmed) {
          event.preventDefault();
        }
      }}
      style={{ margin: 0 }}
    >
      <input type="hidden" name="id" value={articleId} />
      <button
        type="submit"
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(248, 113, 113, 0.4)",
          borderRadius: 999,
          color: "#fca5a5",
          padding: "0.45rem 0.8rem",
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </form>
  );
}
