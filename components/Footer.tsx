export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold text-indigo-600">OddJobs</p>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              Affordable student workers for everyday tasks — we show up and get
              it done.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-gray-700">Contact Us</p>
            <p>
              <a
                href="tel:4039922526"
                className="text-gray-500 transition-colors hover:text-indigo-600"
              >
                (403) 992-2526
              </a>
            </p>
            <p>
              <a
                href="mailto:hello@oddjobs.com"
                className="text-gray-500 transition-colors hover:text-indigo-600"
              >
                hello@oddjobs.com
              </a>
            </p>
            <p className="text-gray-400">Calgary, AB</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} OddJobs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
