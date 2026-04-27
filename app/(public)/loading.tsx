export default function Loading() {
  return (
    <div className="bg-white">
      {/* Hero skeleton */}
      <div className="bg-indigo-600 px-6 py-24 text-center">
        <div className="mx-auto mb-4 h-10 w-2/3 max-w-md animate-pulse rounded-xl bg-indigo-500" />
        <div className="mx-auto mb-8 h-5 w-1/2 max-w-sm animate-pulse rounded-xl bg-indigo-500" />
        <div className="mx-auto h-10 w-36 animate-pulse rounded-full bg-indigo-500" />
      </div>

      {/* Grid skeleton */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto mb-10 h-7 w-40 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-gray-100 p-6"
            >
              <div className="mb-4 h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
              <div className="mb-2 h-5 w-3/4 animate-pulse rounded-lg bg-gray-200" />
              <div className="mb-1.5 h-3.5 w-full animate-pulse rounded-lg bg-gray-100" />
              <div className="mb-5 h-3.5 w-2/3 animate-pulse rounded-lg bg-gray-100" />
              <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-3 w-16 animate-pulse rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
