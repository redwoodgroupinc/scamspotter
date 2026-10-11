"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-navy-950">Something went wrong</h1>
      <p className="mt-4 text-lg text-navy-700">
        This page hit an unexpected error. Nothing you entered was sent anywhere. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
