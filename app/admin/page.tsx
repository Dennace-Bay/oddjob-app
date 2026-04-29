"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

const STATUSES = ["pending", "confirmed", "in-progress", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLES: Record<string, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  "in-progress": "border-purple-200 bg-purple-50 text-purple-700",
  completed: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
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

type Review = {
  id: string;
  customer_name: string;
  neighbourhood: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
};

const BOOKING_COLUMNS = [
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

// ─── Bookings Dashboard ────────────────────────────────────────────────────────

function BookingsDashboard() {
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
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    const supabase = createClient();
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) fetchBookings();
  }

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {BOOKING_COLUMNS.map((col) => (
                <th key={col} className="whitespace-nowrap px-4 py-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {BOOKING_COLUMNS.map((col) => (
                  <td key={col} className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {fetchError}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 py-32 text-center">
        <p className="text-sm text-gray-400">No bookings yet.</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-400">
        {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
      </p>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {BOOKING_COLUMNS.map((col) => (
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
              <tr key={booking.id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {new Date(booking.created_at).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                  {booking.customer_name}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <a
                    href={`tel:${booking.phone.replace(/\D/g, "")}`}
                    className="text-gray-500 transition-colors hover:text-indigo-600"
                  >
                    {booking.phone}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <a
                    href={`mailto:${booking.email}`}
                    className="text-gray-500 transition-colors hover:text-indigo-600"
                  >
                    {booking.email}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {booking.services?.name ?? <span className="text-gray-300">—</span>}
                </td>
                <td
                  className="max-w-[200px] truncate px-4 py-3 text-gray-500"
                  title={booking.address}
                >
                  {booking.address}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {booking.preferred_date}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {booking.preferred_time}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    value={booking.status}
                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                    className={[
                      "cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition",
                      "focus:border-transparent focus:ring-2 focus:ring-indigo-400",
                      STATUS_STYLES[booking.status] ?? "border-gray-200 bg-gray-50 text-gray-600",
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
    </>
  );
}

// ─── Reviews Dashboard ────────────────────────────────────────────────────────

function ReviewsDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setFetchError("Failed to load reviews. Please refresh and try again.");
    } else {
      setReviews(data as Review[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function approveReview(id: string) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)));
    const supabase = createClient();
    const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", id);
    if (error) fetchReviews();
  }

  async function deleteReview(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    const supabase = createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) fetchReviews();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {fetchError}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 py-32 text-center">
        <p className="text-sm text-gray-400">No reviews yet.</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-400">
        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">{review.customer_name}</span>
                <span className="text-sm text-gray-400">{review.neighbourhood}, Calgary</span>
                <span className="text-sm text-gray-300">·</span>
                <span className="text-sm text-gray-400">
                  {new Date(review.created_at).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < review.rating ? "text-orange-400" : "text-gray-200"}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-600">&ldquo;{review.comment}&rdquo;</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {review.approved ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Approved
                </span>
              ) : (
                <button
                  onClick={() => approveReview(review.id)}
                  className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => deleteReview(review.id)}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews">("bookings");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {(["bookings", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        {activeTab === "bookings" ? <BookingsDashboard /> : <ReviewsDashboard />}
      </div>
    </main>
  );
}
