import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-10 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-indigo-600"
        >
          OddJobs
        </Link>

        <Link
          href="/#services"
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Book a Service
        </Link>
      </div>
    </nav>
  );
}
