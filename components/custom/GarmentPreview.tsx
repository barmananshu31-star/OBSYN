"use client";

import React from "react";
import Image from "next/image";
import { UploadCloud } from "lucide-react";

interface GarmentPreviewProps {
  garmentType: string;
  previewUrl: string | null;
  pattern: string;
  fabric: string;
}

export function GarmentPreview({
  garmentType,
  previewUrl,
  pattern,
  fabric,
}: GarmentPreviewProps) {
  // Select silhouette image based on garment type
  const garmentImages: Record<string, string> = {
    hoodie: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
    tee: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
    jacket: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop",
  };

  const currentGarmentImage = garmentImages[garmentType] || garmentImages.hoodie;

  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto rounded-xl bg-[#090909] border border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-hidden group">
      {/* Top Spec Badges */}
      <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#888888] z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d4ff00]" />
          <span className="text-white font-bold">ATELIER STAGE // 01</span>
        </div>
        <div className="text-[10px] tracking-wider text-[#666666]">
          {fabric.toUpperCase()}
        </div>
      </div>

      {/* Garment Visual & Centered Fixed Artwork Overlay */}
      <div className="relative flex-1 flex items-center justify-center my-2">
        {/* Base Garment Photo */}
        <div className="relative w-full h-full max-h-[420px]">
          <Image
            src={currentGarmentImage}
            alt="Custom Garment Base"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain filter grayscale contrast-125 brightness-95 transition-all duration-700"
          />

          {/* Fixed Centered Graphic Overlay Box */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded border border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-black/30 backdrop-blur-[2px]">
              {previewUrl ? (
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Custom Artwork Overlay"
                    className="max-w-full max-h-full object-contain filter contrast-125 drop-shadow-md"
                  />
                </div>
              ) : (
                <div className="text-center p-3 space-y-1.5 opacity-60">
                  <UploadCloud className="w-6 h-6 mx-auto text-[#888888]" />
                  <div className="text-[9px] font-mono tracking-widest text-[#aaaaaa] uppercase">
                    CENTER ARTWORK OVERLAY
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Silhouette Pill */}
      <div className="z-10 p-3 bg-black/70 backdrop-blur-md border border-white/10 rounded flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#666666]">PATTERN:</span>
          <span className="text-white font-semibold uppercase">{pattern}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#666666]">POSITION:</span>
          <span className="text-[#d4ff00] font-semibold">CENTER CHEST (FIXED)</span>
        </div>
      </div>
    </div>
  );
}
