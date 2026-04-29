"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
          OddJob Crews
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/" className="transition-colors hover:text-indigo-600">
            Home
          </Link>
          <Link href="/#services" className="transition-colors hover:text-indigo-600">
            Services
          </Link>
          <Link href="/about" className="transition-colors hover:text-indigo-600">
            About
          </Link>
          <Link href="/reviews" className="transition-colors hover:text-indigo-600">
            Reviews
          </Link>
        </div>

        <Link
          href="/book"
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-orange-600"
        >
          Book Now
        </Link>
      </div>
    </nav>
  );
}
