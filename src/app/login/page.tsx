"use client";

import { BrandMark } from "@/components/branding/BrandMark";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isAuthenticated, isLoading: authLoading, defaultRoute } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    const raw = searchParams.get("redirectTo") ?? "";
    const redirectTo =
      raw.startsWith("/") && !raw.startsWith("//") ? raw : defaultRoute;
    router.replace(redirectTo);
  }, [authLoading, isAuthenticated, router, searchParams, defaultRoute]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let landing = defaultRoute;
    try {
      landing = await signIn(email, password);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Sign in failed. Please try again.";
      setError(message);
      setIsLoading(false);
      return;
    }

    const raw = searchParams.get("redirectTo") ?? "";
    const redirectTo =
      raw.startsWith("/") && !raw.startsWith("//") ? raw : landing;
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
          <BrandMark variant="login" />
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#111827",
              margin: "16px 0 0",
            }}
          >
            Sign in
          </h1>
          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            Agentic trade surveillance analyst platform
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
              placeholder="analyst@ats.com"
            />
          </div>
          <p style={{ fontSize: 10, color: "#6B7280", marginTop: 8, lineHeight: 1.5 }}>
            Demo: analyst@ats.com (Analyst) · compliance@ats.com (Compliance officer)
          </p>

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
