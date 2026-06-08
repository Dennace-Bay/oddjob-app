import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Yard Work Calgary | Affordable Lawn & Garden Help",
  description:
    "Need yard work done in Calgary? OddJob Crews offers affordable lawn care, garden cleanup, leaf raking, and more. Same-week booking. Call (403) 992-2526.",
};

const WHAT_WE_DO = [
  "Lawn mowing & edging",
  "Leaf raking & fall cleanup",
  "Garden weeding & bed cleanup",
  "Hedge & shrub trimming",
  "Spring yard cleanup",
  "Debris & yard waste removal",
  "Sod installation assistance",
  "General yard tidying",
];

const NEIGHBOURHOODS = [
  "NW Calgary", "SW Calgary", "NE Calgary", "SE Calgary",
  "Downtown", "Beltline", "Bridgeland", "Kensington",
  "Varsity", "Signal Hill", "Mahogany", "Saddleridge",
  "Tuscany", "Silverado", "Panorama Hills", "McKenzie Towne",
];

const FAQS = [
  {
    q: "How much does yard work cost in Calgary?",
    a: "Our yard work is billed hourly at an affordable student rate. We give you a clear estimate before we start so you know exactly what to expect — no surprise charges.",
  },
  {
    q: "Do you bring your own equipment?",
    a: "For most jobs we work with what's available on-site. If you need us to bring specific tools, just mention it when booking and we'll sort it out.",
  },
  {
    q: "What areas of Calgary do you serve?",
    a: "We cover all Calgary neighbourhoods — NW, NE, SW, SE, and Downtown. If you're in the Calgary area, we're available.",
  },
  {
    q: "How quickly can I get someone booked?",
    a: "Same-week booking is available across Calgary. In many cases we can arrange next-day service. Book online or call (403) 992-2526.",
  },
  {
    q: "Do you do one-time cleanups or recurring visits?",
    a: "Both! We're happy to do a one-time spring or fall cleanup, or set up regular visits throughout the season. Just let us know when you book.",
  },
];

export default function YardWorkCalgaryPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-indigo-600 px-6 py-28 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-200">
          Calgary&rsquo;s Affordable Yard Work Service
        </p>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Yard Work Calgary
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-indigo-100 sm:text-xl">
          Lawn mowing, garden cleanup, leaf raking, and more — handled by reliable local
          students at rates that won&rsquo;t break the bank. Same-week booking available.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/book?service=yard-work"
            className="rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-600"
          >
            Book Yard Work
          </Link>
          <Link
            href="/estimate"
            className="rounded-full bg-white/20 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/30"
          >
            Get a Free Estimate
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["All Calgary Areas ✓", "Same-Week Available ✓", "Affordable Hourly Rate ✓", "No Hidden Fees ✓"].map((b) => (
            <span
              key={b}
              className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            What We Can Do for Your Yard
          </h2>
          <p className="mb-10 text-center text-gray-500">
            From a quick tidy to a full seasonal cleanup — we handle it all.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WHAT_WE_DO.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                  ✓
                </span>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">
            Don&rsquo;t see your task?{" "}
            <a href="tel:4039922526" className="font-semibold text-indigo-600 hover:underline">
              Call us at (403) 992-2526
            </a>{" "}
            and we&rsquo;ll let you know if we can help.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-0">
            {[
              {
                step: 1,
                title: "Book Online or Call",
                desc: "Pick a date and time that works. Same-week appointments available all across Calgary.",
              },
              {
                step: 2,
                title: "We Show Up Ready to Work",
                desc: "Our crew arrives on time, confirms what needs to be done, and gets straight to it.",
              },
              {
                step: 3,
                title: "Enjoy Your Yard",
                desc: "We leave your yard looking great and clean up after ourselves before we go.",
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

      {/* Why choose us */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Why Calgary Homeowners Choose OddJob Crews
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: "💰",
                title: "Honest Pricing",
                desc: "Affordable hourly rates with a clear estimate upfront. You approve the price before we lift a finger.",
              },
              {
                icon: "📍",
                title: "Local to Calgary",
                desc: "We live and work right here in Calgary. We know the neighbourhoods and take pride in keeping them looking great.",
              },
              {
                icon: "🪖",
                title: "Hard-Working Crew",
                desc: "Our student workers come from technical training backgrounds — they show up on time and put in the effort.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-3xl">
                  {item.icon}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Areas served */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            Yard Work Across All of Calgary
          </h2>
          <p className="mb-10 text-center text-gray-500">
            We serve every corner of the city — here are some of the neighbourhoods we regularly work in.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {NEIGHBOURHOODS.map((n) => (
              <span
                key={n}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-gray-900">{q}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 px-6 py-20 text-center text-white">
        <h2 className="mb-4 text-3xl font-extrabold">Ready for a Yard You&rsquo;re Proud Of?</h2>
        <p className="mb-8 text-indigo-100">
          Book online in minutes or call us at{" "}
          <a href="tel:4039922526" className="font-bold underline hover:no-underline">
            (403) 992-2526
          </a>
          . Same-week availability across Calgary.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/book?service=yard-work"
            className="rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-600"
          >
            Book Yard Work Now
          </Link>
          <Link
            href="/estimate"
            className="rounded-full bg-white/20 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/30"
          >
            Get a Free Estimate
          </Link>
        </div>
      </section>
    </main>
  );
}
