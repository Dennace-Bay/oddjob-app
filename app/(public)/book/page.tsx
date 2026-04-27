import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import BookingForm from "./BookingForm";

type Props = {
  searchParams: { service?: string };
};

type Service = {
  id: string;
  name: string;
  icon: string;
  base_price: number;
  duration_estimate: string;
};

export default async function BookPage({ searchParams }: Props) {
  const serviceId = searchParams.service ?? null;

  let service: Service | null = null;
  let fetchError = false;

  if (serviceId) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, name, icon, base_price, duration_estimate")
      .eq("id", serviceId)
      .eq("active", true)
      .single();

    if (error && error.code !== "PGRST116") fetchError = true;
    else service = data;
  }

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-indigo-600 hover:underline"
        >
          ← Back to services
        </Link>

        {/* Fetch error */}
        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Could not load service details. You can still fill out the form
            below.
          </div>
        )}

        {/* Selected service banner */}
        {service ? (
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <span className="text-5xl">{service.icon}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
                You&rsquo;re booking
              </p>
              <h1 className="text-xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-sm text-gray-500">
                From ${Number(service.base_price).toFixed(2)} &middot;{" "}
                {service.duration_estimate}
              </p>
            </div>
          </div>
        ) : (
          !fetchError && (
            <h1 className="mb-8 text-2xl font-bold text-gray-900">
              Book a Service
            </h1>
          )
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <BookingForm serviceId={serviceId} />
        </div>
      </div>
    </main>
  );
}
