"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Check whether MFA is required
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      // Fetch the enrolled TOTP factor and open a challenge
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];

      if (totpFactor) {
        const { data: challenge } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        });

        if (challenge) {
          // Pass IDs to the MFA page via sessionStorage (never leaves the browser)
          sessionStorage.setItem("mfa_factor_id", totpFactor.id);
          sessionStorage.setItem("mfa_challenge_id", challenge.id);
          router.push("/admin/mfa");
          return;
        }
      }
    }

    // No MFA enrolled — go straight to dashboard
    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <svg
                className="h-7 w-7 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V7a4.5 4.5 0 00-9 0v3.5M5 10.5h14a1 1 0 011 1V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-8.5a1 1 0 011-1z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Sign In</h1>
            <p className="mt-1 text-sm text-gray-400">Student Workers Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                required
                className={[
                  "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition",
                  "focus:border-transparent focus:ring-2",
                  error
                    ? "border-red-400 bg-red-50 focus:ring-red-400"
                    : "border-gray-200 focus:ring-indigo-500",
                ].join(" ")}
              />
              {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
