"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminMFAPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  useEffect(() => {
    const fid = sessionStorage.getItem("mfa_factor_id");
    const cid = sessionStorage.getItem("mfa_challenge_id");
    if (!fid || !cid) {
      router.replace("/admin/login");
      return;
    }
    setFactorId(fid);
    setChallengeId(cid);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (verifyError) {
      setError("Invalid code. Please try again.");
      setLoading(false);
      return;
    }

    sessionStorage.removeItem("mfa_factor_id");
    sessionStorage.removeItem("mfa_challenge_id");
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
                  d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Two-Factor Auth</h1>
            <p className="mt-1 text-sm text-gray-400">
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                placeholder="000000"
                autoFocus
                className={[
                  "w-full rounded-xl border px-4 py-3 text-center text-2xl font-mono tracking-[0.4em] outline-none transition",
                  "focus:border-transparent focus:ring-2",
                  error
                    ? "border-red-400 bg-red-50 focus:ring-red-400"
                    : "border-gray-200 focus:ring-indigo-500",
                ].join(" ")}
              />
              {error && (
                <p className="text-center text-xs text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying…" : "Verify"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/login")}
              className="w-full text-center text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              ← Back to sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
