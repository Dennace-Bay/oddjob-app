import Link from "next/link";

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-indigo-600 px-6 py-24 text-center text-white">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl">
          About OddJob Crews
        </h1>
        <p className="mx-auto max-w-xl text-lg text-indigo-100">
          Calgary students. Professional standards. Every job.
        </p>
      </section>

      {/* Our Story */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Story</h2>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              OddJob Crews was born out of a simple observation. Dennis Bayubay, a current Aircraft
              Maintenance Engineer (AME) student, noticed that many of his classmates were struggling
              to find flexible work that fit around their demanding course schedules. With over a decade
              of experience in the oil and gas industry and now pursuing a career in aviation, Dennis
              understood the value of hard work, precision, and showing up ready to get the job done.
            </p>
            <p>
              Together with his classmate and co-founder Prince Esto, Dennis started OddJob Crews to
              solve two problems at once — provide Calgary residents affordable and reliable help with
              everyday tasks, and hardworking students a flexible way to earn while they study.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="bg-indigo-50 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-xl leading-relaxed text-indigo-700">
            &ldquo;To provide Calgary residents with affordable, reliable help for everyday tasks —
            powered by motivated local students who bring real work ethic and professional standards
            to every job.&rdquo;
          </p>
        </div>
      </section>

      {/* Why Choose Our Crew */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Why Choose Our Crew</h2>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              Our student workers are not just looking for any job — they are technically trained
              individuals who take pride in precision, safety and attention to detail. Aviation and
              trades programs demand a high standard of professionalism every single day. We bring that
              same commitment and work ethic to every odd job we take on — no matter how big or small.
            </p>
            <p>
              When an OddJob Crew member shows up at your door you are getting someone who has been
              held to professional standards in a demanding technical program. That means you can trust
              us to treat your home and property with care and respect.
            </p>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            What Sets Us Apart
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: "🪖",
                title: "Work Ethic",
                desc: "Our crew comes from technical training backgrounds that demand precision, reliability and professionalism. We bring that same attitude to your home.",
              },
              {
                icon: "💰",
                title: "Flexible and Affordable",
                desc: "As students ourselves we understand budgets. We keep our rates fair and transparent so you always know what you are paying before we start.",
              },
              {
                icon: "📍",
                title: "Calgary Local",
                desc: "We live and study right here in Calgary. We are not a faceless company — we are your neighbours and we take pride in serving our community.",
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

      {/* Meet the Founders */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Meet the Founders
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {[
              {
                name: "Dennis Bayubay",
                title: "Co-Founder",
                initial: "D",
                desc: "AME student with 10+ years of experience in the oil and gas industry. Dennis brings discipline, reliability and real world expertise to everything OddJob Crews does.",
              },
              {
                name: "Prince Esto",
                title: "Co-Founder",
                initial: "P",
                desc: "Fellow AME student and the co-founder who helps keep OddJob Crews running smoothly for every customer and crew member across Calgary.",
              },
            ].map((founder) => (
              <div
                key={founder.name}
                className="flex flex-col items-center rounded-2xl border border-gray-200 p-8 text-center shadow-sm"
              >
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-400">
                  {founder.initial}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{founder.name}</h3>
                <p className="mb-3 text-sm font-medium text-indigo-600">{founder.title}</p>
                <p className="text-sm leading-relaxed text-gray-500">{founder.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 px-6 py-16 text-center text-white">
        <h2 className="mb-4 text-3xl font-bold">Ready to Get Something Done?</h2>
        <p className="mb-8 text-indigo-100">
          Our crew is ready to help — book your service today and see the OddJob difference.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-orange-600"
        >
          Book a Service
        </Link>
      </section>
    </main>
  );
}
