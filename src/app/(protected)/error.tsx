"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error("Critical System Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-4 text-red-600">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
      <p className="mt-2 max-w-md text-slate-500">
        An unexpected error occurred in the clinical system. This has been logged for review.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Retry Operation
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
