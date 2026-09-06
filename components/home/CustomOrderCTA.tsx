import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Sliders, Layers, Palette } from "lucide-react";

export function CustomOrderCTA() {
  return (
    <section className="py-28 px-6 bg-[#080808] border-t border-white/[0.08] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4ff00]/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left narrative */}
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] uppercase tracking-widest text-[#d4ff00] font-mono">
            <Sparkles className="w-3 h-3" />
            <span>ATELIER BESPOKE STUDIO</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-[-0.05em] leading-[0.95] text-white">
            YOUR VISION. <br />
            <span className="text-[#666666]">OBSYN CRAFT.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#888888] leading-relaxed max-w-lg font-light">
            Construct bespoke garments through our live configurator. Select your preferred heavyweight mill-finish fabric, custom size proportions, archival dye pattern, and upload personal artwork for a centered garment print.
          </p>

          {/* Key configurator feature badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded bg-[#0f0f0f] border border-white/5 space-y-2">
              <Layers className="w-4 h-4 text-[#d4ff00]" />
              <div className="text-xs font-bold uppercase text-white">Fabric Weight</div>
              <p className="text-[11px] text-[#666666]">Choose 450 to 500 GSM loopback cotton or technical ripstop.</p>
            </div>
            <div className="p-4 rounded bg-[#0f0f0f] border border-white/5 space-y-2">
              <Palette className="w-4 h-4 text-[#d4ff00]" />
              <div className="text-xs font-bold uppercase text-white">Archival Dye</div>
              <p className="text-[11px] text-[#666666]">Obsidian black, acid mineral wash, or raw carbon stripe.</p>
            </div>
            <div className="p-4 rounded bg-[#0f0f0f] border border-white/5 space-y-2">
              <Sliders className="w-4 h-4 text-[#d4ff00]" />
              <div className="text-xs font-bold uppercase text-white">Live Pricing</div>
              <p className="text-[11px] text-[#666666]">Real-time transparent pricing recalculated on the fly.</p>
            </div>
          </div>

          <div>
            <Link
              href="/custom-order"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] transition-colors shadow-[0_0_25px_rgba(255,255,255,0.1)]"
            >
              <span>Launch Atelier Configurator</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Preview Interactive Mockup Visual */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-lg aspect-square rounded-xl bg-[#0e0e0e] border border-white/10 p-8 flex flex-col justify-between shadow-2xl">
            {/* Visual Header */}
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#777777]">
              <span>PREVIEW // BESPOKE SILHOUETTE</span>
              <span className="text-[#d4ff00]">500 GSM FRENCH TERRY</span>
            </div>

            {/* Silhouette Illustration */}
            <div className="relative flex-1 flex items-center justify-center my-4">
              <div className="relative w-72 h-72">
                <Image
                  src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop"
                  alt="Custom Hoodie Mockup"
                  fill
                  className="object-contain filter grayscale contrast-125 brightness-90"
                />
                {/* Simulated Centered Artwork Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 border border-dashed border-[#d4ff00]/60 rounded flex items-center justify-center bg-black/40 backdrop-blur-xs">
                    <span className="text-[9px] font-mono text-[#d4ff00] text-center tracking-widest uppercase p-1">
                      ARTWORK OVERLAY
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Options Ticker Pill */}
            <div className="p-3 bg-black/60 border border-white/10 rounded flex items-center justify-between text-xs font-mono">
              <div className="flex gap-2">
                <span className="text-[#888888]">FABRIC:</span>
                <span className="text-white">FRENCH TERRY</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#888888]">SIZE:</span>
                <span className="text-white">LARGE</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#888888]">BASE:</span>
                <span className="text-[#d4ff00] font-bold">$220.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
