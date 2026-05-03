"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

const STATUSES = ["pending", "confirmed", "in-progress", "completed", "cancelled"] as const;

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
  notes: string | null;
  status: string;
  photos: string[] | null;
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

type Service = {
  id: string;
  name: string;
  description: string;
  icon: string;
  base_price: number;
  pricing_type: "flat" | "hourly";
  duration_estimate: string;
  active: boolean;
};

type ServiceDraft = Omit<Service, "id">;

const BLANK_DRAFT: ServiceDraft = {
  name: "",
  description: "",
  icon: "",
  base_price: 0,
  pricing_type: "flat",
  duration_estimate: "",
  active: true,
};

const BOOKING_COLUMNS = [
  "Date Submitted", "Customer Name", "Phone", "Email",
  "Service", "Address", "Preferred Date", "Preferred Time", "Photos", "Status",
];

// ─── Photo Modal ──────────────────────────────────────────────────────────────

function PhotoModal({ paths, onClose }: { paths: string[]; onClose: () => void }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.storage
        .from("booking-photos")
        .createSignedUrls(paths, 3600);
      setUrls(data?.map((d) => d.signedUrl).filter((u): u is string => u !== null) ?? []);
      setLoading(false);
    }
    load();
  }, [paths]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Booking Photos ({paths.length})
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
          </div>
        ) : urls.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Could not load photos.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {urls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="aspect-square w-full rounded-xl object-cover transition hover:opacity-80"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bookings Dashboard ────────────────────────────────────────────────────────

function BookingsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewingPhotos, setViewingPhotos] = useState<string[] | null>(null);

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

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

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
            <tr>{BOOKING_COLUMNS.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-3">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              </th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>{BOOKING_COLUMNS.map((col) => (
                <td key={col} className="px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                </td>
              ))}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (fetchError) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{fetchError}</div>
  );

  if (bookings.length === 0) return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-32 text-center">
      <p className="text-sm text-gray-400">No bookings yet.</p>
    </div>
  );

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
                <th key={col} scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((booking) => (
              <tr key={booking.id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {new Date(booking.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{booking.customer_name}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <a href={`tel:${booking.phone.replace(/\D/g, "")}`} className="text-gray-500 transition-colors hover:text-indigo-600">{booking.phone}</a>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <a href={`mailto:${booking.email}`} className="text-gray-500 transition-colors hover:text-indigo-600">{booking.email}</a>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {booking.services?.name ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-gray-500" title={booking.address}>{booking.address}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">{booking.preferred_date}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">{booking.preferred_time}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {booking.photos && booking.photos.length > 0 ? (
                    <button
                      onClick={() => setViewingPhotos(booking.photos!)}
                      className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-indigo-100 hover:text-indigo-700"
                    >
                      📷 {booking.photos.length}
                    </button>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
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
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewingPhotos && (
        <PhotoModal paths={viewingPhotos} onClose={() => setViewingPhotos(null)} />
      )}
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
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (error) {
      setFetchError("Failed to load reviews. Please refresh and try again.");
    } else {
      setReviews(data as Review[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

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

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  );

  if (fetchError) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{fetchError}</div>
  );

  if (reviews.length === 0) return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-32 text-center">
      <p className="text-sm text-gray-400">No reviews yet.</p>
    </div>
  );

  return (
    <>
      <p className="mb-4 text-sm text-gray-400">
        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">{review.customer_name}</span>
                <span className="text-sm text-gray-400">{review.neighbourhood}, Calgary</span>
                <span className="text-sm text-gray-300">·</span>
                <span className="text-sm text-gray-400">
                  {new Date(review.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < review.rating ? "text-orange-400" : "text-gray-200"}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-600">&ldquo;{review.comment}&rdquo;</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {review.approved ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Approved</span>
              ) : (
                <button onClick={() => approveReview(review.id)}
                  className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600">
                  Approve
                </button>
              )}
              <button onClick={() => deleteReview(review.id)}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Services Dashboard ───────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function ServiceForm({
  draft,
  saving,
  saveError,
  onChange,
  onSave,
  onCancel,
  submitLabel,
}: {
  draft: ServiceDraft;
  saving: boolean;
  saveError: string | null;
  onChange: (field: keyof ServiceDraft, value: string | number | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Service Name</label>
          <input className={inputCls} value={draft.name} onChange={(e) => onChange("name", e.target.value)} placeholder="e.g. Junk Removal" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Icon (emoji)</label>
          <input className={inputCls} value={draft.icon} onChange={(e) => onChange("icon", e.target.value)} placeholder="e.g. 🗑️" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">
            {draft.pricing_type === "hourly" ? "Hourly Rate ($)" : "Starting Price ($)"}
          </label>
          <div className="flex gap-2">
            <input className={inputCls} type="number" min="0" step="0.01" value={draft.base_price}
              onChange={(e) => onChange("base_price", parseFloat(e.target.value) || 0)} />
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-gray-200 text-xs font-semibold">
              <button type="button"
                onClick={() => onChange("pricing_type", "flat")}
                className={`px-3 py-2 transition-colors ${draft.pricing_type === "flat" ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                Flat
              </button>
              <button type="button"
                onClick={() => onChange("pricing_type", "hourly")}
                className={`px-3 py-2 transition-colors ${draft.pricing_type === "hourly" ? "bg-indigo-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                /hr
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Duration Estimate</label>
          <input className={inputCls} value={draft.duration_estimate} onChange={(e) => onChange("duration_estimate", e.target.value)} placeholder="e.g. 2–4 hrs" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">Description</label>
        <textarea className={inputCls + " resize-none"} rows={3} value={draft.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Short description shown on the service card" />
      </div>
      <div className="flex items-center gap-2">
        <button type="button"
          onClick={() => onChange("active", !draft.active)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${draft.active ? "bg-indigo-600" : "bg-gray-200"}`}>
          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${draft.active ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className="text-sm text-gray-600">{draft.active ? "Active — visible to customers" : "Inactive — hidden from customers"}</span>
      </div>
      {saveError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
      )}
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
          {saving ? "Saving..." : submitLabel}
        </button>
        <button onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ServicesDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ServiceDraft>(BLANK_DRAFT);
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState<ServiceDraft>(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const supabase = createClient();
    const { data, error } = await supabase.from("services").select("*").order("name");
    if (error) {
      setFetchError("Failed to load services.");
    } else {
      setServices(data as Service[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditDraft({ name: service.name, description: service.description, icon: service.icon, base_price: service.base_price, pricing_type: service.pricing_type, duration_estimate: service.duration_estimate, active: service.active });
    setSaveError(null);
    setAddingNew(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setSaveError(null);
  }

  function startAdd() {
    setNewDraft(BLANK_DRAFT);
    setAddingNew(true);
    setSaveError(null);
    setEditingId(null);
  }

  function cancelAdd() {
    setAddingNew(false);
    setSaveError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    if (!editDraft.name.trim()) { setSaveError("Service name is required."); return; }
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase.from("services").update({
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      icon: editDraft.icon.trim(),
      base_price: editDraft.base_price,
      pricing_type: editDraft.pricing_type,
      duration_estimate: editDraft.duration_estimate.trim(),
      active: editDraft.active,
    }).eq("id", editingId);
    setSaving(false);
    if (error) {
      setSaveError("Failed to save. Please try again.");
    } else {
      setEditingId(null);
      fetchServices();
    }
  }

  async function saveNew() {
    if (!newDraft.name.trim()) { setSaveError("Service name is required."); return; }
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase.from("services").insert({
      name: newDraft.name.trim(),
      description: newDraft.description.trim(),
      icon: newDraft.icon.trim(),
      base_price: newDraft.base_price,
      pricing_type: newDraft.pricing_type,
      duration_estimate: newDraft.duration_estimate.trim(),
      active: newDraft.active,
    });
    setSaving(false);
    if (error) {
      setSaveError("Failed to add service. Please try again.");
    } else {
      setAddingNew(false);
      fetchServices();
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  );

  if (fetchError) return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{fetchError}</div>
  );

  return (
    <div className="space-y-4">
      {/* Add new service button */}
      {!addingNew && (
        <div className="flex justify-end">
          <button onClick={startAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
            + Add Service
          </button>
        </div>
      )}

      {/* New service form */}
      {addingNew && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6">
          <h3 className="mb-4 text-sm font-bold text-indigo-700">New Service</h3>
          <ServiceForm
            draft={newDraft}
            saving={saving}
            saveError={saveError}
            onChange={(field, value) => setNewDraft((prev) => ({ ...prev, [field]: value }))}
            onSave={saveNew}
            onCancel={cancelAdd}
            submitLabel="Add Service"
          />
        </div>
      )}

      {/* Existing services */}
      {services.map((service) => (
        <div key={service.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {editingId === service.id ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">{service.icon}</span>
                <h3 className="text-sm font-bold text-gray-700">Editing: {service.name}</h3>
              </div>
              <ServiceForm
                draft={editDraft}
                saving={saving}
                saveError={saveError}
                onChange={(field, value) => setEditDraft((prev) => ({ ...prev, [field]: value }))}
                onSave={saveEdit}
                onCancel={cancelEdit}
                submitLabel="Save Changes"
              />
            </>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                  {service.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${service.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                      {service.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{service.description}</p>
                  <div className="mt-1.5 flex gap-4 text-xs text-gray-400">
                    <span>
                      <strong className="text-indigo-600">
                        {service.pricing_type === "hourly"
                          ? `$${Number(service.base_price).toFixed(2)}/hr`
                          : `From $${Number(service.base_price).toFixed(2)}`}
                      </strong>
                    </span>
                    <span>{service.duration_estimate}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => startEdit(service)}
                className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50">
                Edit
              </button>
            </div>
          )}
        </div>
      ))}

      {services.length === 0 && !addingNew && (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">No services yet. Add one above.</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews" | "services">("bookings");

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
            {(["bookings", "reviews", "services"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={handleSignOut}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50">
            Sign out
          </button>
        </div>

        {activeTab === "bookings" && <BookingsDashboard />}
        {activeTab === "reviews" && <ReviewsDashboard />}
        {activeTab === "services" && <ServicesDashboard />}
      </div>
    </main>
  );
}
