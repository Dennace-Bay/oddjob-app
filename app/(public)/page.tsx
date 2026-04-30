import Link from "next/link";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase/server";
import ReviewsSection from "@/components/ReviewsSection";

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
      <section className="bg-indigo-600 px-6 py-32 text-center text-white">
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
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl">
          Book a Student Worker Today
        </h1>
        <p className="mx-auto max-w-xl text-lg text-indigo-100 sm:text-xl">
          Affordable help for everyday tasks — from junk removal to moving —
          by local students get it done.
        </p>
        <Link
          href="#services"
          className="mt-8 inline-block rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-600"
        >
          Browse Services
        </Link>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Calgary Based ✓", "Same Week Booking ✓", "Student Workers ✓"].map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Why Choose OddJob Crews?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🪖",
                title: "Work Ethic",
                desc: "Our crew comes from technical training backgrounds that demand precision, reliability and professionalism.",
              },
              {
                icon: "💰",
                title: "Flexible and Affordable",
                desc: "We keep our rates fair and transparent so you always know what you are paying before we start.",
              },
              {
                icon: "📍",
                title: "Calgary Local",
                desc: "We live and work right here in Calgary. We are your neighbours and we take pride in serving our community.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-3xl">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">How It Works</h2>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-0">
            {[
              {
                step: 1,
                title: "Choose Your Service",
                desc: "Browse our services and pick the one that fits your needs.",
              },
              {
                step: 2,
                title: "Pick a Date and Time",
                desc: "Select a date and time that works for you — same week available.",
              },
              {
                step: 3,
                title: "We Show Up and Get It Done",
                desc: "Your crew arrives ready to work and leaves your place looking great.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-1 flex-col items-center text-center">
                {i < 2 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-orange-200 sm:block" />
                )}
                <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-extrabold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section id="services" className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">What We Offer</h2>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
              <p className="font-medium text-red-600">Could not load services right now.</p>
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
                <div
                  key={service.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-4xl">
                    {service.icon}
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900">{service.name}</h3>

                  <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-500">
                    {service.description}
                  </p>

                  <div className="mb-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-lg font-extrabold text-indigo-600">
                      From ${Number(service.base_price).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">{service.duration_estimate}</span>
                  </div>

                  <Link
                    href={`/book?service=${service.id}`}
                    className="block rounded-full bg-orange-500 px-6 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-orange-600"
                  >
                    Book Now
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">
              No services available right now. Check back soon.
            </p>
          )}
        </div>
      </section>

      {/* Reviews — client component, fetches via browser Supabase client */}
      <ReviewsSection />
    </main>
  );
}
