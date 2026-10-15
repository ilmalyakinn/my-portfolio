"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginForm({
  errorMessage,
  successMessage,
}: {
  errorMessage?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorMessage ?? "");
  const [success, setSuccess] = useState(successMessage ?? "");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.info("[auth] submit start", { email: email.trim() });

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      console.info("[auth] signInWithPassword result", {
        hasUser: Boolean(data?.user),
        hasSession: Boolean(data?.session),
        hasError: Boolean(signInError),
      });

      if (signInError) {
        const message = signInError.message?.toLowerCase() ?? "";

        if (
          message.includes("invalid login credentials") ||
          message.includes("invalid credentials")
        ) {
          setError("Login failed: incorrect email or password.");
          return;
        }

        if (message.includes("email not confirmed")) {
          setError(
            "Login failed: please confirm your email before signing in.",
          );
          return;
        }

        if (
          message.includes("rate limit") ||
          message.includes("too many requests")
        ) {
          setError(
            "Too many login attempts. Please wait a moment and try again.",
          );
          return;
        }

        setError(`Login failed: ${signInError.message}`);
        return;
      }

      if (!data?.user) {
        setError(
          "Authentication succeeded but no user session was created. Please try again.",
        );
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.info("[auth] session check", {
        hasSession: Boolean(session),
        hasSessionError: Boolean(sessionError),
      });

      if (sessionError) {
        setError(`Session check failed: ${sessionError.message}`);
        return;
      }

      if (!session) {
        setError(
          "Authentication succeeded but the browser session could not be established. Please try again.",
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const lowerMessage = message.toLowerCase();

      console.error("[auth] unexpected login error", { message });

      if (
        lowerMessage.includes("fetch") ||
        lowerMessage.includes("network") ||
        lowerMessage.includes("failed to fetch")
      ) {
        setError(
          "Unable to reach the authentication service. Please try again.",
        );
      } else {
        setError(`Authentication error: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordMessage("Please enter your email.");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail.trim(),
        {
          redirectTo: "http://localhost:3000/admin/reset-password",
        },
      );

      if (resetError) {
        setForgotPasswordMessage(
          "If this email is registered, password reset instructions will be sent.",
        );
        return;
      }

      setForgotPasswordMessage(
        "If this email is registered, password reset instructions will be sent.",
      );
      setForgotPasswordEmail("");
      setShowForgotPassword(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("fetch") ||
        lowerMessage.includes("network") ||
        lowerMessage.includes("failed to fetch")
      ) {
        setForgotPasswordMessage(
          "Unable to reach the reset service right now. Please try again.",
        );
      } else {
        setForgotPasswordMessage(
          "Unable to send reset email right now. Please try again.",
        );
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  }

  return (
    <section className="container" style={{ maxWidth: 520 }}>
      <h1>Admin Login</h1>
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
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
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
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
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

        {success ? (
          <p style={{ color: "#86efac", margin: 0 }}>{success}</p>
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ marginTop: "1.25rem" }}>
        {!showForgotPassword ? (
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              opacity: 0.8,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Lupa Password?
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(event) => setForgotPasswordEmail(event.target.value)}
              placeholder="Email admin"
              autoComplete="email"
              style={{
                padding: "0.8rem 1rem",
                borderRadius: 8,
                border: "1px solid rgba(232,232,232,0.2)",
                background: "rgba(255,255,255,0.02)",
                color: "inherit",
              }}
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
              style={{
                padding: "0.7rem 1rem",
                borderRadius: 8,
                border: "1px solid rgba(232,232,232,0.2)",
                background: "transparent",
                color: "inherit",
                cursor: forgotPasswordLoading ? "not-allowed" : "pointer",
              }}
            >
              {forgotPasswordLoading ? "Mengirim..." : "Kirim link reset"}
            </button>
            {forgotPasswordMessage ? (
              <p style={{ color: "#86efac", margin: 0 }}>
                {forgotPasswordMessage}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
