"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 m-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-xs max-w-2xl">
      <h2 className="text-sm font-bold text-red-500 mb-2">
        Runtime Error: {error?.message || "Something went wrong!"}
      </h2>
      <pre className="overflow-x-auto whitespace-pre-wrap mb-4 bg-black/40 p-3 rounded-lg text-[11px] text-red-300">
        {error?.stack || String(error)}
      </pre>
      <button
        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-white font-medium transition-all"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
