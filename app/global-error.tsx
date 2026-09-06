"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050505] text-white min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#0e0e0e] border border-white/10 rounded-xl p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 font-mono text-xl">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Application Configuration Error
            </h2>
            <p className="text-xs text-[#888888] leading-relaxed">
              {error.message || "An unexpected error occurred during page rendering."}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
