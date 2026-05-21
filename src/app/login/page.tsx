"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Sign in failed. Please try again.";
      setError(message);
      setIsLoading(false);
      return;
    }

    const raw = searchParams.get("redirectTo") ?? "";
    const redirectTo =
      raw.startsWith("/") && !raw.startsWith("//") ? raw : "/overview";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background-primary, #F9FAFB)",
      }}
    >
      <div
        style={{
          width: 360,
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          padding: "32px 28px",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#1A6640",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#6B7280",
              }}
            >
              Sentinel
            </span>
          </div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            Sign in
          </h1>
          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            Trade surveillance analyst platform
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                fontSize: 13,
                border: "1px solid #D1D5DB",
                borderRadius: 5,
                outline: "none",
                color: "#111827",
              }}
              placeholder="analyst@yourfirm.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                fontSize: 13,
                border: "1px solid #D1D5DB",
                borderRadius: 5,
                outline: "none",
                color: "#111827",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 5,
                border: "1px solid #F4C7C7",
                background: "#FDECEC",
                fontSize: 12,
                color: "#A32D2D",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: 4,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: isLoading ? "#9CA3AF" : "#111827",
              border: "none",
              borderRadius: 5,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            fontSize: 11,
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          Access is restricted to authorised personnel.
          <br />
          Contact your compliance admin to request access.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
