"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/",          label: "Home"     },
  { href: "/#services", label: "Services" },
  { href: "/estimate",  label: "Estimate" },
  { href: "/about",     label: "About"    },
  { href: "/reviews",   label: "Reviews"  },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change (click)
  function closeMenu() { setMenuOpen(false); }

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" onClick={closeMenu} className="text-xl font-bold tracking-tight text-indigo-600">
          OddJob Crews
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-indigo-600">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/book"
            onClick={closeMenu}
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-orange-600"
          >
            Book Now
          </Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 sm:hidden"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 pb-4 sm:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={closeMenu}
              className="block py-3 text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
