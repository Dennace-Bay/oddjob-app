import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase/server";

type Service = {
  id: string;
  name: string;
  description: string;
  icon: string;
  base_price: number;
  duration_estimate: string;
};

export default async function HomePage() {
  const supabase = createServerClient();
  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, description, icon, base_price, duration_estimate")
    .eq("active", true)
    .order("name");

  return (
    <main>
      {/* Hero */}
      <section className="bg-indigo-600 px-6 py-24 text-center text-white">
        <div className="mx-auto mb-6 flex justify-center">
          <Image
            src="/logo.jpeg"
            alt="OddJobs logo"
            width={160}
            height={160}
            className="rounded-2xl object-contain"
            priority
          />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Book a Student Worker Today
        </h1>
        <p className="mx-auto max-w-xl text-lg text-indigo-100 sm:text-xl">
          Affordable help for everyday tasks — from junk removal to moving —
          done by local students who show up and get it done.
        </p>
        <Link
          href="#services"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-600 shadow transition-colors hover:bg-indigo-50"
        >
          Browse Services
        </Link>
      </section>

      {/* Services grid */}
      <section id="services" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold text-gray-800">
          What We Offer
        </h2>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="font-medium text-red-600">
              Could not load services right now.
            </p>
            <p className="mt-1 text-sm text-red-400">
              Please refresh the page or call us at{" "}
              <a href="tel:4039922526" className="underline">
                (403) 992-2526
              </a>
              .
            </p>
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service: Service) => (
              <Link
                key={service.id}
                href={`/book?service=${service.id}`}
                className="group flex flex-col rounded-2xl border border-gray-200 p-6 transition-all duration-200 hover:border-indigo-400 hover:shadow-lg"
              >
                <span className="mb-4 text-5xl">{service.icon}</span>

                <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                  {service.name}
                </h3>

                <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-500">
                  {service.description}
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-base font-bold text-indigo-600">
                    From ${Number(service.base_price).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {service.duration_estimate}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            No services available right now. Check back soon.
          </p>
        )}
      </section>
    </main>
  );
}
