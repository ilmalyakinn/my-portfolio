"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordForm({
  hasValidSession,
}: {
  hasValidSession: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!password.trim()) {
      setError("Password cannot be empty.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!hasValidSession) {
      setError("This password reset link is invalid or expired.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError("Unable to update password. Please request a new reset link.");
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully.");
    setLoading(false);
    router.push("/admin/login?reset=success");
  }

  if (!hasValidSession) {
    return (
      <section className="container" style={{ maxWidth: 520 }}>
        <h1>Reset Password</h1>
        <p style={{ marginTop: "1rem" }}>
          This password reset link is invalid or expired.
        </p>
        <p>
          <Link href="/admin/login">Return to login</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="container" style={{ maxWidth: 520 }}>
      <h1>Reset Password</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span>New password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            style={{
              padding: "0.8rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(232,232,232,0.2)",
              background: "rgba(255,255,255,0.02)",
              color: "inherit",
            }}
          />
        </label>

        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <span>Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
            style={{
              padding: "0.8rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(232,232,232,0.2)",
              background: "rgba(255,255,255,0.02)",
              color: "inherit",
            }}
          />
        </label>

        {error ? <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p> : null}

        {message ? (
          <p style={{ color: "#86efac", margin: 0 }}>{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.8rem 1rem",
            borderRadius: 8,
            border: "none",
            background: "#ffffff",
            color: "#111111",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Updating password..." : "Update password"}
        </button>
      </form>
    </section>
  );
}
