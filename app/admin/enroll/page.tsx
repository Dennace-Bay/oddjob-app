"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type EnrollData = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export default function AdminEnrollPage() {
  const router = useRouter();
  const [enrollData, setEnrollData] = useState<EnrollData | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [initError, setInitError] = useState("");

  useEffect(() => {
    async function startEnrollment() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Admin Authenticator",
      });

      if (error || !data) {
        setInitError("Could not start MFA enrollment. Please try again.");
      } else {
        setEnrollData({
          factorId: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        });
      }
      setInitialising(false);
    }

    startEnrollment();
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollData) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: enrollData.factorId });

    if (challengeError || !challenge) {
      setError("Failed to create challenge. Please try again.");
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollData.factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError("Invalid code. Check your authenticator app and try again.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Set Up Authenticator
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Scan the QR code with Google Authenticator, Authy, or any TOTP
              app, then enter the code to confirm.
            </p>
          </div>

          {initialising && (
            <p className="py-10 text-center text-sm text-gray-400">
              Loading&hellip;
            </p>
          )}

          {initError && (
            <p className="py-10 text-center text-sm text-red-500">{initError}</p>
          )}

          {enrollData && (
            <>
              {/* QR Code */}
              <div className="mb-5 flex justify-center">
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                  {/* qr_code is an SVG data URI from Supabase */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={enrollData.qrCode}
                    alt="Authenticator QR code"
                    className="h-44 w-44"
                  />
                </div>
              </div>

              {/* Manual secret fallback */}
              <div className="mb-6 rounded-xl bg-gray-50 px-4 py-3">
                <p className="mb-1.5 text-center text-xs text-gray-400">
                  Can&rsquo;t scan? Enter this key manually:
                </p>
                <p className="break-all text-center font-mono text-xs tracking-wider text-gray-600">
                  {enrollData.secret}
                </p>
              </div>

              {/* Verify code */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-center text-sm font-medium text-gray-700">
                    Enter the 6-digit code to activate
                  </label>
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
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Activating…" : "Activate MFA"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
