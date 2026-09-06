"use client";

import React, { useState, useMemo } from "react";
import { UploadCloud, Check, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";

interface ConfiguratorControlsProps {
  garmentType: string;
  setGarmentType: (t: string) => void;
  fabric: string;
  setFabric: (f: string) => void;
  size: string;
  setSize: (s: string) => void;
  pattern: string;
  setPattern: (p: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

export function ConfiguratorControls({
  garmentType,
  setGarmentType,
  fabric,
  setFabric,
  size,
  setSize,
  pattern,
  setPattern,
  uploadedFile,
  setUploadedFile,
  previewUrl,
  setPreviewUrl,
}: ConfiguratorControlsProps) {
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const addItem = useCartStore((state) => state.addItem);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available options
  const garmentOptions = [
    { id: "hoodie", name: "Heavyweight Hoodie", basePrice: 180 },
    { id: "tee", name: "Boxy Combed Tee", basePrice: 95 },
    { id: "jacket", name: "Technical Overshirt", basePrice: 240 },
  ];

  const fabricOptions = [
    { id: "Heavyweight Japanese Cotton (450 GSM)", name: "Heavyweight Cotton (450 GSM)", priceDelta: 0 },
    { id: "French Terry Fleece (500 GSM)", name: "French Terry Fleece (500 GSM)", priceDelta: 35 },
    { id: "Technical Ripstop Blend (320 GSM)", name: "Technical Ripstop Blend (320 GSM)", priceDelta: 45 },
  ];

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const patternOptions = [
    { id: "Plain Obsidian", name: "Plain Obsidian", priceDelta: 0 },
    { id: "Distressed Acid Mineral", name: "Distressed Acid Mineral", priceDelta: 25 },
    { id: "Subtle Monogram Pinstripe", name: "Subtle Monogram Pinstripe", priceDelta: 30 },
  ];

  // Dynamic Live Price Calculation
  const totalPrice = useMemo(() => {
    const base = garmentOptions.find((g) => g.id === garmentType)?.basePrice || 180;
    const fabricExtra = fabricOptions.find((f) => f.id === fabric)?.priceDelta || 0;
    const patternExtra = patternOptions.find((p) => p.id === pattern)?.priceDelta || 0;
    return base + fabricExtra + patternExtra;
  }, [garmentType, fabric, pattern]);

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }
  };

  // Add to Bag with server persistence
  const handleAddToBag = async () => {
    setErrorMessage(null);

    // Require Clerk authentication
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    setSaving(true);

    try {
      let remoteImageUrl = previewUrl || "";
      let designId = `design_${Date.now()}`;

      // If a file was uploaded, upload to Supabase via server route
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("fabric", fabric);
        formData.append("size", size);
        formData.append("pattern", pattern);

        const res = await fetch("/api/custom-designs", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to persist custom design to atelier.");
        }

        const data = await res.json();
        remoteImageUrl = data.imageUrl;
        designId = data.customDesign.id;
      }

      // Add custom line item to Zustand Cart
      const selectedGarmentObj = garmentOptions.find((g) => g.id === garmentType);
      const garmentTitle = selectedGarmentObj ? selectedGarmentObj.name : "Custom Garment";

      addItem({
        name: `Bespoke ${garmentTitle}`,
        price: totalPrice,
        quantity: 1,
        image: remoteImageUrl || "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop",
        fabric,
        size,
        pattern,
        is_custom: true,
        custom_design_id: designId,
        custom_image_url: remoteImageUrl,
      });
    } catch (err: any) {
      console.error("[Configurator Save Error]:", err);
      setErrorMessage(err.message || "Failed to add bespoke garment to bag.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 bg-[#0a0a0a] border border-white/10 p-8 rounded-xl text-white">
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
          <Sparkles className="w-3 h-3" />
          <span>BESPOKE BUILDER</span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
          CONFIGURE SILHOUETTE
        </h2>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/50 border border-red-500/40 rounded text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      {/* 1. Silhouette Selector */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-widest text-[#888888] block">
          Base Silhouette
        </label>
        <div className="grid grid-cols-3 gap-3">
          {garmentOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setGarmentType(opt.id)}
              className={`p-3 rounded text-center border transition-all ${
                garmentType === opt.id
                  ? "bg-white text-black border-white font-bold"
                  : "bg-[#121212] text-[#888888] border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="text-xs uppercase">{opt.name}</div>
              <div className="text-[10px] font-mono mt-1 opacity-75">${opt.basePrice}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Fabric Dropdown */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-widest text-[#888888] block">
          Fabric Specification
        </label>
        <select
          value={fabric}
          onChange={(e) => setFabric(e.target.value)}
          className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white transition-colors cursor-pointer"
        >
          {fabricOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} {opt.priceDelta > 0 ? `(+$${opt.priceDelta})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Size Dropdown */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-widest text-[#888888] block">
          Garment Size Proportions
        </label>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white transition-colors cursor-pointer"
        >
          {sizeOptions.map((s) => (
            <option key={s} value={s}>
              Size {s}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Pattern Dropdown */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-widest text-[#888888] block">
          Archival Dye & Finish
        </label>
        <select
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white transition-colors cursor-pointer"
        >
          {patternOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} {opt.priceDelta > 0 ? `(+$${opt.priceDelta})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Single Image Upload (Fixed Centered Overlay) */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-widest text-[#888888] block">
          Custom Design Graphic (Center Chest Overlay)
        </label>
        <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 rounded-lg hover:border-white/40 bg-[#0d0d0d] cursor-pointer transition-colors group">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="w-8 h-8 text-[#888888] group-hover:text-white transition-colors mb-2" />
          <div className="text-xs font-bold uppercase tracking-wider text-white">
            {uploadedFile ? uploadedFile.name : "Select Design Artwork"}
          </div>
          <p className="text-[10px] text-[#666666] tracking-widest mt-1">
            PNG / JPG / WEBP / SVG (MAX 10MB)
          </p>
        </label>
      </div>

      {/* Live Total & CTA */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-widest text-[#888888]">Calculated Atelier Total</div>
          <div className="text-2xl font-mono font-bold text-[#d4ff00]">
            {formatCurrency(totalPrice)}
          </div>
        </div>

        <button
          onClick={handleAddToBag}
          disabled={saving}
          className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Tailoring Specifications...</span>
            </>
          ) : (
            <>
              <span>Add Custom Garment to Bag</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {!isSignedIn && (
          <p className="text-[11px] text-center text-[#777777]">
            Google authentication will be requested upon saving your custom piece.
          </p>
        )}
      </div>
    </div>
  );
}
