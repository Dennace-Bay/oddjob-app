"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUSES = ["pending", "confirmed", "in-progress", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLES: Record<string, string> = {
  pending:      "border-yellow-200 bg-yellow-50  text-yellow-700",
  confirmed:    "border-blue-200   bg-blue-50    text-blue-700",
  "in-progress":"border-purple-200 bg-purple-50  text-purple-700",
  completed:    "border-green-200  bg-green-50   text-green-700",
  cancelled:    "border-red-200    bg-red-50     text-red-700",
};

type Booking = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  services: { name: string } | null;
};

const COLUMNS = [
  "Date Submitted",
  "Customer Name",
  "Phone",
  "Email",
  "Service",
  "Address",
  "Preferred Date",
  "Preferred Time",
  "Status",
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*, services(name)")
      .order("created_at", { ascending: false });

    if (error) {
      setFetchError("Failed to load bookings. Please refresh and try again.");
    } else {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(id: string, status: string) {
    // Optimistic update
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

    const supabase = createClient();
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) fetchBookings(); // revert by re-fetching on failure
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            {!loading && (
              <p className="mt-0.5 text-sm text-gray-400">
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col} className="whitespace-nowrap px-4 py-3">
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-36 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-40 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-gray-100" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 animate-pulse rounded-lg bg-gray-100" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        /* Empty */
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-32 text-center">
            <p className="text-sm text-gray-400">No bookings yet.</p>
          </div>

        /* Table */
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* Date Submitted */}
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Customer Name */}
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {booking.customer_name}
                    </td>

                    {/* Phone */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <a
                        href={`tel:${booking.phone.replace(/\D/g, "")}`}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        {booking.phone}
                      </a>
                    </td>

                    {/* Email */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <a
                        href={`mailto:${booking.email}`}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        {booking.email}
                      </a>
                    </td>

                    {/* Service */}
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {booking.services?.name ?? <span className="text-gray-300">—</span>}
                    </td>

                    {/* Address */}
                    <td
                      className="max-w-[200px] truncate px-4 py-3 text-gray-500"
                      title={booking.address}
                    >
                      {booking.address}
                    </td>

                    {/* Preferred Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {booking.preferred_date}
                    </td>

                    {/* Preferred Time */}
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {booking.preferred_time}
                    </td>

                    {/* Status dropdown */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                        className={[
                          "cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition",
                          "focus:ring-2 focus:ring-indigo-400 focus:border-transparent",
                          STATUS_STYLES[booking.status] ??
                            "border-gray-200 bg-gray-50 text-gray-600",
                        ].join(" ")}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  return <Dashboard />;
}
