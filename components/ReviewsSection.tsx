"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  customer_name: string;
  neighbourhood: string;
  rating: number;
  comment: string;
};

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient();

      console.log("Fetching reviews...");

      const { data, error, count } = await supabase
        .from("reviews")
        .select("*", { count: "exact" });

      console.log("Reviews data:", data);
      console.log("Reviews error:", error);
      console.log("Reviews count:", count);
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

      setReviews(data ?? []);
      setLoading(false);
    }

    fetchReviews();
  }, []);

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">
          What Our Customers Say
        </h2>
        <p className="mb-10 text-center text-gray-500">
          Real reviews from Calgary residents
        </p>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-2 flex gap-0.5 text-xl">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < review.rating ? "text-orange-400" : "text-gray-200"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.customer_name}</p>
                  <p className="text-xs text-gray-400">{review.neighbourhood}, Calgary</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-gray-400">
              Reviews coming soon — book your first service today!
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/reviews"
            className="inline-block rounded-full border-2 border-orange-500 px-8 py-3 text-sm font-bold text-orange-500 transition-colors hover:bg-orange-500 hover:text-white"
          >
            Leave a Review
          </Link>
        </div>
      </div>
    </section>
  );
}
