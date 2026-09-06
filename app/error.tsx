"use client";

import React from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-8 space-y-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 font-mono text-xl">
          !
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Atelier Error
          </h2>
          <p className="text-xs text-[#888888] leading-relaxed">
            {error.message || "An error occurred loading the requested view."}
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
