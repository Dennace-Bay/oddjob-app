"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReviewsPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("reviews").insert({
      customer_name: name,
      neighbourhood,
      rating,
      comment,
      approved: false,
    });

    setSubmitting(false);
    if (dbError) {
      setError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">⭐</div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            Thank you for your review!
          </h1>
          <p className="text-gray-500">
            It will appear on our site once approved.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">Leave a Review</h1>
        <p className="mb-10 text-center text-gray-500">
          Share your experience with OddJob Crews
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star rating */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={star <= (hovered || rating) ? "text-orange-400" : "text-gray-200"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Neighbourhood */}
          <div>
            <label htmlFor="neighbourhood" className="mb-2 block text-sm font-semibold text-gray-700">
              Calgary Neighbourhood <span className="text-red-400">*</span>
            </label>
            <input
              id="neighbourhood"
              type="text"
              required
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
              placeholder="e.g. Kensington, Beltline, Bridgeland"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-semibold text-gray-700">
              Your Review <span className="text-red-400">*</span>
            </label>
            <textarea
              id="comment"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us about your experience..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-orange-500 py-3 text-sm font-bold text-white shadow transition-colors hover:bg-orange-600 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </main>
  );
}
