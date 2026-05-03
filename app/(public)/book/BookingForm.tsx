"use client";

import { useState } from "react";
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
  label: string;
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
    const { error } = await supabase.from("bookings").insert({
      service_id: selectedId,
      customer_name: form.customer_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time,
      notes: form.notes.trim() || null,
      status: "pending",
    });

    if (error) {
      setSubmitError(
        "Something went wrong submitting your booking. Please try again or call us at (403) 992-2526."
      );
      setSubmitting(false);
      return;
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
                  From ${Number(selectedService.base_price).toFixed(2)} · {selectedService.duration_estimate}
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
                {s.icon} {s.name} — From ${Number(s.base_price).toFixed(2)}
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
