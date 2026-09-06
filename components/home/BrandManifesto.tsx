"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function BrandManifesto() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { opacity: 0.15, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 px-6 bg-[#070707] border-y border-white/[0.06] text-white relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex items-center gap-4">
          <span className="w-8 h-[1px] bg-[#d4ff00]" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#888888] font-mono">
            PHILOSOPHY // 001
          </span>
        </div>

        <p
          ref={textRef}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.04em] leading-[1.25] text-[#dcdcdc]"
        >
          WE REJECT THE DISPOSABLE APPAREL CYCLE. OBSYN CREATES SILHOUETTES THAT EXIST AS{" "}
          <span className="text-white underline decoration-[#d4ff00] decoration-2 underline-offset-8">
            TACTILE MONOLITHS
          </span>{" "}
          — OVERSIZED DRAPE, ARCHIVAL WEIGHT, AND METICULOUS MINIMALISM DESIGNED TO SURVIVE SEASONS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/[0.08]">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#d4ff00] font-bold">01 // 500 GSM WEIGHT</span>
            <p className="text-xs text-[#777777] leading-relaxed">
              Substantial tactile heft designed to hold architectural shape independently without collapsing.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#d4ff00] font-bold">02 // NO LOGO NOISE</span>
            <p className="text-xs text-[#777777] leading-relaxed">
              Quiet confidence. Branding is recessed into blind tonal embroidery and matte blackened hardware.
            </p>
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#d4ff00] font-bold">03 // BESPOKE ATELIER</span>
            <p className="text-xs text-[#777777] leading-relaxed">
              Custom mill order configurations allowing unique weight, size, and archival prints on demand.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
