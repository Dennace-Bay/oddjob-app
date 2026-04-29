import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand + contact */}
          <div>
            <p className="text-xl font-bold text-white">OddJob Crews</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Affordable student workers for Calgary
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-400">
              <p>
                <a href="tel:4039922526" className="transition-colors hover:text-white">
                  (403) 992-2526
                </a>
              </p>
              <p>
                <a
                  href="mailto:info@oddjobcrews.com"
                  className="transition-colors hover:text-white"
                >
                  info@oddjobcrews.com
                </a>
              </p>
              <p>Calgary, AB</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Quick Links
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              {[
                { label: "Home", href: "/" },
                { label: "Services", href: "/#services" },
                { label: "About", href: "/about" },
                { label: "Reviews", href: "/reviews" },
                { label: "Book a Service", href: "/book" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Follow Us
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-300 transition-colors hover:bg-indigo-600 hover:text-white"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-300 transition-colors hover:bg-pink-600 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 text-center text-xs text-slate-500">
          &copy; 2026 OddJob Crews. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
