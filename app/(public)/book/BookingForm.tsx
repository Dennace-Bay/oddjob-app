"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TIME_SLOTS = [
  { value: "Morning 8am-12pm", label: "Morning (8am – 12pm)" },
  { value: "Afternoon 12pm-4pm", label: "Afternoon (12pm – 4pm)" },
  { value: "Evening 4pm-7pm", label: "Evening (4pm – 7pm)" },
];

const TODAY = new Date().toISOString().split("T")[0];

type Service = {
  id: string;
  name: string;
  icon: string;
  base_price: number;
  pricing_type: "flat" | "hourly";
  duration_estimate: string;
};

type FormData = {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
};

type Errors = Partial<Record<keyof FormData | "service", string>>;

function validate(form: FormData, serviceId: string | null): Errors {
  const errs: Errors = {};
  if (!serviceId) errs.service = "Please select a service.";
  if (!form.customer_name.trim()) errs.customer_name = "Full name is required.";
  if (!form.email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errs.email = "Enter a valid email address.";
  }
  if (!form.phone.trim()) errs.phone = "Phone number is required.";
  if (!form.address.trim()) errs.address = "Service address is required.";
  if (!form.preferred_date) errs.preferred_date = "Preferred date is required.";
  if (!form.preferred_time) errs.preferred_time = "Please select a time slot.";
  return errs;
}

function inputClass(hasError: boolean): string {
  return [
    "w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 outline-none transition",
    "placeholder:text-gray-400",
    "focus:ring-2 focus:border-transparent",
    hasError
      ? "border-red-400 bg-red-50 focus:ring-red-400"
      : "border-gray-200 bg-white hover:border-gray-300 focus:ring-indigo-500",
  ].join(" ");
}

function Field({
  label,
  error,
  children,
}: {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Image load failed")); };
    img.src = objectUrl;
  });
}

export default function BookingForm({
  services,
  preSelectedId,
  preSelectedName,
}: {
  services: Service[];
  preSelectedId: string | null;
  preSelectedName: string | null;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(preSelectedId);
  const [form, setForm] = useState<FormData>({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => { previewUrlsRef.current = previewUrls; }, [previewUrls]);
  useEffect(() => { return () => { previewUrlsRef.current.forEach(URL.revokeObjectURL); }; }, []);

  const selectedService = services.find((s) => s.id === selectedId) ?? null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []).slice(0, 3 - selectedFiles.length);
    if (incoming.length === 0) return;
    const newUrls = incoming.map(URL.createObjectURL);
    setSelectedFiles((prev) => [...prev, ...incoming].slice(0, 3));
    setPreviewUrls((prev) => [...prev, ...newUrls].slice(0, 3));
    e.target.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs = validate(form, selectedId);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        service_id: selectedId,
        customer_name: form.customer_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
        notes: form.notes.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      setSubmitError(
        "Something went wrong submitting your booking. Please try again or call us at (403) 992-2526."
      );
      setSubmitting(false);
      return;
    }

    // Upload photos — failure does not block the booking
    if (selectedFiles.length > 0) {
      const photoPaths: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        try {
          const blob = await compressImage(selectedFiles[i]);
          const path = `${inserted.id}/${i + 1}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("booking-photos")
            .upload(path, blob, { contentType: "image/jpeg" });
          if (!uploadError) photoPaths.push(path);
        } catch {
          // skip failed photo — booking still goes through
        }
      }
      if (photoPaths.length > 0) {
        await supabase.from("bookings").update({ photos: photoPaths }).eq("id", inserted.id);
      }
    }

    try {
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.customer_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          service_name: selectedService?.name ?? "Unknown service",
          address: form.address.trim(),
          preferred_date: form.preferred_date,
          preferred_time: form.preferred_time,
          notes: form.notes.trim() || null,
        }),
      });
    } catch {
      // email failure doesn't block the booking
    }

    router.push("/confirmation");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Service selector */}
      <Field label="Select a Service" error={errors.service}>
        {selectedService ? (
          <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedService.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedService.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedService.pricing_type === "hourly"
                    ? `$${Number(selectedService.base_price).toFixed(2)}/hr`
                    : `From $${Number(selectedService.base_price).toFixed(2)}`}{" "}
                  · {selectedService.duration_estimate}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedId(null); setErrors((p) => ({ ...p, service: undefined })); }}
              className="text-xs text-indigo-500 hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <select
            value={selectedId ?? ""}
            onChange={(e) => { setSelectedId(e.target.value || null); setErrors((p) => ({ ...p, service: undefined })); }}
            className={inputClass(!!errors.service)}
          >
            <option value="">— Choose a service —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name} —{" "}
                {s.pricing_type === "hourly"
                  ? `$${Number(s.base_price).toFixed(2)}/hr`
                  : `From $${Number(s.base_price).toFixed(2)}`}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Full Name" error={errors.customer_name}>
        <input
          type="text"
          name="customer_name"
          value={form.customer_name}
          onChange={handleChange}
          placeholder="Jane Smith"
          className={inputClass(!!errors.customer_name)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            className={inputClass(!!errors.email)}
          />
        </Field>

        <Field label="Phone" error={errors.phone}>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="(555) 000-0000"
            className={inputClass(!!errors.phone)}
          />
        </Field>
      </div>

      <Field label="Service Address" error={errors.address}>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="123 Main St, City, Province"
          className={inputClass(!!errors.address)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Preferred Date" error={errors.preferred_date}>
          <input
            type="date"
            name="preferred_date"
            value={form.preferred_date}
            onChange={handleChange}
            min={TODAY}
            className={inputClass(!!errors.preferred_date)}
          />
        </Field>

        <Field label="Preferred Time" error={errors.preferred_time}>
          <select
            name="preferred_time"
            value={form.preferred_time}
            onChange={handleChange}
            className={inputClass(!!errors.preferred_time)}
          >
            <option value="">Select a time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Additional Notes" error={errors.notes}>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Access instructions, specific requests, anything we should know…"
          className={inputClass(false) + " resize-none"}
        />
      </Field>

      {/* Photo upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Photos{" "}
          <span className="font-normal text-gray-400">(Optional — helps us prepare)</span>
        </label>

        <label
          htmlFor="photo-upload"
          className={[
            "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
            selectedFiles.length >= 3
              ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
              : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50",
          ].join(" ")}
        >
          <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
          <span className="text-sm text-gray-500">
            {selectedFiles.length === 0
              ? "Add photos of the work area (max 3)"
              : selectedFiles.length >= 3
              ? "3 photos selected"
              : `${selectedFiles.length} photo${selectedFiles.length !== 1 ? "s" : ""} added — tap to add more`}
          </span>
          <span className="text-xs text-gray-400">JPG · PNG · WebP</span>
        </label>

        <input
          id="photo-upload"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          disabled={selectedFiles.length >= 3}
          className="sr-only"
          onChange={handleFileChange}
        />

        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="Remove photo"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Submitting…
          </span>
        ) : (
          "Confirm Booking"
        )}
      </button>
    </form>
  );
}
