import CostEstimator from "@/components/CostEstimator";

export default function EstimatePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-indigo-600 px-6 py-16 text-center text-white">
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Get a Free Estimate
        </h1>
        <p className="mx-auto max-w-xl text-indigo-200">
          Pick your service, tell us about the job, and get an instant price estimate — no sign-up needed.
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <CostEstimator />
      </div>
    </main>
  );
}
