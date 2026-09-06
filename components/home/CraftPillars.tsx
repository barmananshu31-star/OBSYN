import React from "react";
import { Shield, Sparkles, Truck, RefreshCw } from "lucide-react";

export function CraftPillars() {
  const pillars = [
    {
      icon: Shield,
      title: "Tactile Structural Weight",
      desc: "500 GSM loopback French terry and 280 GSM combed organic cotton engineered to never lose form.",
    },
    {
      icon: Sparkles,
      title: "Japanese Excella Hardware",
      desc: "Individually polished metal teeth and concealed reverse-coil zippers with raw blackened pulls.",
    },
    {
      icon: Truck,
      title: "Express Insured Transit",
      desc: "Complimentary global priority dispatch in matte black reinforced archival containers.",
    },
    {
      icon: RefreshCw,
      title: "Bespoke Production Queue",
      desc: "Each custom atelier piece is precision tailored and inspected before serial assignment.",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.08] bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-lg bg-[#0a0a0a] border border-white/[0.06] space-y-4 hover:border-white/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#d4ff00]">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#777777] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
