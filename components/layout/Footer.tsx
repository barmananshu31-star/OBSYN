import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#030303] border-t border-white/[0.08] pt-24 pb-16 text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Manifesto / Newsletter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20 border-b border-white/[0.06]">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#d4ff00] font-semibold">
              Archival Monolith // Drop 01
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] leading-tight">
              OBSYN IS AN EXPLORATION OF SHADOW, TECTONIC DRAPE, AND ARCHIVAL STREETWEAR.
            </h3>
            <p className="text-sm text-[#888888] leading-relaxed max-w-lg">
              Crafted in limited drops with bespoke mill-finished fabrics. Every silhouette is engineered with zero compromise on tactile weight and structural presence.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-end space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.2em] text-[#888888]">
                Private Dispatch
              </span>
              <p className="text-sm text-[#555555]">
                Receive private access to future capsule releases and archival re-issues.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="flex items-center max-w-md">
              <input
                type="email"
                placeholder="ENTER EMAIL ADDRESS"
                className="w-full bg-[#0d0d0d] border border-white/10 px-4 py-3.5 text-xs text-white placeholder-[#555555] tracking-widest uppercase focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#d4ff00] hover:text-black transition-colors whitespace-nowrap"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Navigation columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16 text-xs tracking-widest uppercase">
          <div className="space-y-4">
            <div className="text-white font-bold text-sm tracking-normal">Collections</div>
            <ul className="space-y-3 text-[#777777]">
              <li><Link href="/catalogue?category=Hoodies" className="hover:text-white transition-colors">Heavy Hoodies</Link></li>
              <li><Link href="/catalogue?category=Outerwear" className="hover:text-white transition-colors">Technical Trench</Link></li>
              <li><Link href="/catalogue?category=T-Shirts" className="hover:text-white transition-colors">Boxy Tees</Link></li>
              <li><Link href="/catalogue?category=Bottoms" className="hover:text-white transition-colors">Cargo Trousers</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="text-white font-bold text-sm tracking-normal">Studio</div>
            <ul className="space-y-3 text-[#777777]">
              <li><Link href="/custom-order" className="hover:text-white transition-colors">Custom Order Atelier</Link></li>
              <li><span className="cursor-default">Fabric Spec Matrix</span></li>
              <li><span className="cursor-default">Care & Maintenance</span></li>
              <li><span className="cursor-default">Sustainability</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="text-white font-bold text-sm tracking-normal">Client Services</div>
            <ul className="space-y-3 text-[#777777]">
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><span className="cursor-default">Complimentary Shipping</span></li>
              <li><span className="cursor-default">Returns & Exchanges</span></li>
              <li><span className="cursor-default">Concierge Assistance</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="text-white font-bold text-sm tracking-normal">Presence</div>
            <ul className="space-y-3 text-[#777777]">
              <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <span>Instagram</span> <ArrowUpRight className="w-3 h-3" />
              </li>
              <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <span>Discord Atelier</span> <ArrowUpRight className="w-3 h-3" />
              </li>
              <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <span>Tokyo Showroom</span>
              </li>
              <li className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                <span>Paris Studio</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-10 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between text-[11px] text-[#555555] tracking-wider uppercase gap-4">
          <div>
            © {new Date().getFullYear()} OBSYN MONOLITH INC. ALL RIGHTS RESERVED.
          </div>
          <div className="flex space-x-6">
            <span className="hover:text-[#888888] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#888888] cursor-pointer">Privacy Charter</span>
            <span className="hover:text-[#888888] cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
