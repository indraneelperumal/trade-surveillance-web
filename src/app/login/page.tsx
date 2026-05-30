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
    <div className="login-shell">
      <div className="login-card">
        <div style={{ marginBottom: 28 }}>
          <BrandMark variant="login" />
          <h1 className="login-card__heading">Sign in</h1>
          <p className="login-card__sub">Agentic trade surveillance analyst platform</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
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
                border: "1px solid var(--color-border-secondary)",
                borderRadius: 5,
                outline: "none",
                color: "var(--color-text-primary)",
                background: "var(--color-background-secondary)",
              }}
              placeholder="analyst@ats.com"
            />
          </div>
          <p style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 8, lineHeight: 1.5 }}>
            Demo: analyst@ats.com (Analyst) · compliance@ats.com (Compliance officer)
          </p>

          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-text-secondary)",
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
                border: "1px solid var(--color-border-secondary)",
                borderRadius: 5,
                outline: "none",
                color: "var(--color-text-primary)",
                background: "var(--color-background-secondary)",
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

          <button type="submit" disabled={isLoading} className="login-submit">
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            fontSize: 11,
            color: "var(--color-text-tertiary)",
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
