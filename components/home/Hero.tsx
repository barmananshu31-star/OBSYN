"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import gsap from "gsap";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro timeline animation with crisp luxury curve
      const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.4 } });

      tl.fromTo(
        headlineRef.current,
        { y: 80, opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)" },
        { y: 0, opacity: 1, clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)" },
        0.2
      )
        .fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2 },
          0.6
        )
        .fromTo(
          ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0 },
          0.8
        )
        .fromTo(
          imageRef.current,
          { scale: 1.15, opacity: 0 },
          { scale: 1, opacity: 1, duration: 2 },
          0.3
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#050505] text-white pt-10 pb-6 px-6"
    >
      {/* Background Ambience & Gradient Spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-white/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#d4ff00]/[0.02] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]" />
      </div>

      {/* Top Meta Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#777777] z-10 pt-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#d4ff00] inline-block animate-ping" />
          <span>DROP 01 // AVAILABLE NOW</span>
        </div>
        <div className="hidden sm:block font-mono text-[#555555]">
          LAT: 35.6762° N // TOKYO — PARIS — NYC
        </div>
      </div>

      {/* Center Main Stage Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto z-10 py-12">
        {/* Left Column: Giant Typographic Monolith */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] tracking-[0.2em] uppercase text-[#d4ff00] font-semibold">
            <span>ARCHIVAL TECTONIC APPAREL</span>
          </div>

          <h1
            ref={headlineRef}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.06em] leading-[0.9] uppercase text-white"
          >
            SHADOW <br />
            <span className="text-[#555555] hover:text-white transition-colors duration-700">
              MEETS
            </span>{" "}
            STRUCTURE.
          </h1>

          <p
            ref={subtitleRef}
            className="text-sm sm:text-base text-[#999999] leading-relaxed max-w-xl font-light"
          >
            OBSYN engineers monolithic streetwear from 500 GSM loopback French terry and ballistic ripstop membranes. No transient micro-trends. Only heavy sculptural form.
          </p>

          {/* Action CTAs */}
          <div ref={ctaRef} className="flex flex-wrap items-center gap-5 pt-2">
            <Link
              href="/catalogue"
              className="group px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] hover:text-black transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              <span>Explore Drop 01</span>
              <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="/custom-order"
              className="px-8 py-4 bg-transparent border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] rounded hover:border-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <span>Atelier Configurator</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Visual Asset */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            ref={imageRef}
            className="relative w-full max-w-md aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl group"
          >
            <Image
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
              alt="OBSYN Heavyweight Silhouette"
              fill
              priority
              className="object-cover object-center grayscale contrast-125 filter group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

            {/* Spec Overlay Pill */}
            <div className="absolute bottom-5 left-5 right-5 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#777777]">SILHOUETTE 01</div>
                <div className="text-xs font-bold uppercase text-white">500 GSM HEAVYWEIGHT HOODIE</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-[#777777]">STATUS</div>
                <div className="text-xs font-mono font-bold text-[#d4ff00]">LIMITED ALLOCATION</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Technical Ticker */}
      <div className="w-full border-t border-white/[0.08] pt-4 overflow-hidden">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap text-[10px] font-mono tracking-[0.3em] uppercase text-[#666666]">
          <span>500 GSM LOOPBACK FRENCH TERRY</span>
          <span>•</span>
          <span>JAPANESE YKK EXCELLA HARDWARE</span>
          <span>•</span>
          <span>DOUBLE-LAYER ZERO-DRAWSTRING HOOD</span>
          <span>•</span>
          <span>BALLISTIC RIPSTOP MEMBRANE</span>
          <span>•</span>
          <span>LIMITED MONOLITH EDITION</span>
          <span>•</span>
          <span>500 GSM LOOPBACK FRENCH TERRY</span>
          <span>•</span>
          <span>JAPANESE YKK EXCELLA HARDWARE</span>
          <span>•</span>
          <span>DOUBLE-LAYER ZERO-DRAWSTRING HOOD</span>
        </div>
      </div>
    </section>
  );
}
