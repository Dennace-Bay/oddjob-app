import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Junk Removal Calgary | Fast, Affordable & Same-Week",
  description:
    "Need junk removed in Calgary? OddJob Crews offers fast, affordable junk removal across all Calgary neighbourhoods. Book online or call (403) 992-2526.",
};

const WHAT_WE_HAUL = [
  "Old furniture (couches, beds, dressers)",
  "Appliances (fridges, washers, dryers)",
  "Yard waste & debris",
  "Construction & renovation waste",
  "Electronics & e-waste",
  "Boxes, bags & general clutter",
  "Hot tubs & swing sets",
  "Office furniture & equipment",
];

const NEIGHBOURHOODS = [
  "NW Calgary", "SW Calgary", "NE Calgary", "SE Calgary",
  "Downtown", "Beltline", "Bridgeland", "Kensington",
  "Varsity", "Signal Hill", "Mahogany", "Saddleridge",
  "Tuscany", "Silverado", "Panorama Hills", "McKenzie Towne",
];

const FAQS = [
  {
    q: "How much does junk removal cost in Calgary?",
    a: "Our junk removal starts at an affordable flat rate depending on the volume of junk. We give you a clear price before we start — no surprises. Use our free estimator to get an instant quote.",
  },
  {
    q: "How quickly can you come?",
    a: "We offer same-week booking across Calgary. In many cases we can arrange next-day service. Book online or call (403) 992-2526 and we'll find a time that works for you.",
  },
  {
    q: "What areas of Calgary do you serve?",
    a: "We serve all neighbourhoods across Calgary — NW, NE, SW, SE, and Downtown. If you're in the Calgary area, we've got you covered.",
  },
  {
    q: "Do you recycle or donate items?",
    a: "Yes, wherever possible we try to divert items from landfill by donating usable furniture and recycling eligible materials.",
  },
  {
    q: "Do I need to be home during the pickup?",
    a: "Not always. For straightforward exterior pickups, many customers simply leave items at the curb or in the garage. We'll confirm the details when you book.",
  },
];

export default function JunkRemovalCalgaryPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-indigo-600 px-6 py-28 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-200">
          Calgary&rsquo;s Affordable Junk Removal Service
        </p>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Junk Removal Calgary
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-indigo-100 sm:text-xl">
          Fast, affordable junk removal across all Calgary neighbourhoods. Our student crew hauls
          it away so you don&rsquo;t have to — same-week booking available.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/book?service=junk-removal"
            className="rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-600"
          >
            Book Junk Removal
          </Link>
          <Link
            href="/estimate"
            className="rounded-full bg-white/20 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/30"
          >
            Get a Free Estimate
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["All Calgary Areas ✓", "Same-Week Available ✓", "Upfront Pricing ✓", "No Hidden Fees ✓"].map((b) => (
            <span
              key={b}
              className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* What we haul */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            What We Haul Away
          </h2>
          <p className="mb-10 text-center text-gray-500">
            We take almost everything — if you can point to it, we can remove it.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {WHAT_WE_HAUL.map((item) => (
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
            Don&rsquo;t see your item?{" "}
            <a href="tel:4039922526" className="font-semibold text-indigo-600 hover:underline">
              Call us at (403) 992-2526
            </a>{" "}
            and we&rsquo;ll let you know.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            How Junk Removal Works
          </h2>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-0">
            {[
              {
                step: 1,
                title: "Book Online or Call",
                desc: "Choose a date and time that works for you. Same-week appointments available across Calgary.",
              },
              {
                step: 2,
                title: "We Show Up & Quote",
                desc: "Our crew arrives on time, confirms the scope, and gives you a final price before touching anything.",
              },
              {
                step: 3,
                title: "We Haul It Away",
                desc: "We load everything up and leave your space clean. Fast, professional, and hassle-free.",
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
            Why Calgary Chooses OddJob Crews
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: "💰",
                title: "Affordable Rates",
                desc: "We keep our prices fair and transparent. You see the price before we start — no hidden fees, ever.",
              },
              {
                icon: "⚡",
                title: "Fast & Reliable",
                desc: "Same-week availability across Calgary. Our crew shows up on time and gets the job done efficiently.",
              },
              {
                icon: "🌿",
                title: "Responsible Disposal",
                desc: "We donate usable items and recycle where we can, keeping as much as possible out of the landfill.",
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
            Junk Removal Across All of Calgary
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
        <h2 className="mb-4 text-3xl font-extrabold">Ready to Get Rid of Your Junk?</h2>
        <p className="mb-8 text-indigo-100">
          Book online in minutes or call us at{" "}
          <a href="tel:4039922526" className="font-bold underline hover:no-underline">
            (403) 992-2526
          </a>
          . Same-week availability across Calgary.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/book?service=junk-removal"
            className="rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-600"
          >
            Book Junk Removal Now
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
