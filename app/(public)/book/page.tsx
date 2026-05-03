import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
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

  const supabase = createServerClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, icon, base_price, duration_estimate")
    .eq("active", true)
    .order("name");

  const allServices: Service[] = services ?? [];
  const preSelected = allServices.find((s) => s.id === serviceId) ?? null;

  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="mb-8 inline-block text-sm text-indigo-600 hover:underline">
          ← Back to services
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <BookingForm
            services={allServices}
            preSelectedId={preSelected?.id ?? null}
            preSelectedName={preSelected?.name ?? null}
          />
        </div>
      </div>
    </main>
  );
}
