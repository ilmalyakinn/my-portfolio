"use client";

import { deleteProjectAction } from "./actions";

export default function DeleteProjectForm({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  return (
    <form
      action={deleteProjectAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Hapus proyek "${projectTitle}"? Tindakan ini tidak dapat dibatalkan.`,
        );
        if (!confirmed) {
          event.preventDefault();
        }
      }}
      style={{ margin: 0 }}
    >
      <input type="hidden" name="id" value={projectId} />
      <button
        type="submit"
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(248, 113, 113, 0.4)",
          borderRadius: 999,
          color: "#fca5a5",
          padding: "0.45rem 0.8rem",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        Hapus
      </button>
    </form>
  );
}
