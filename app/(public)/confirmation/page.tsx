import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
          {/* Checkmark */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            You&rsquo;re all booked!
          </h1>
          <p className="mb-6 text-base text-gray-500">
            Thanks for choosing OddJobs. Your request has been received and
            we&rsquo;ll be in touch within{" "}
            <span className="font-semibold text-gray-700">24 hours</span> to
            confirm your booking.
          </p>

          <div className="my-6 border-t border-gray-100" />

          <p className="mb-1 text-sm text-gray-400">Questions? Give us a call:</p>
          <a
            href="tel:4039922526"
            className="text-xl font-semibold text-green-600 transition-colors hover:text-green-700"
          >
            (403) 992-2526
          </a>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-block w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow transition-colors hover:bg-indigo-700"
            >
              Book Another Service
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          A confirmation may be sent to your email once your booking is approved.
        </p>
      </div>
    </main>
  );
}
