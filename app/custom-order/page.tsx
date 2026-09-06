"use client";

import React, { useState } from "react";
import { GarmentPreview } from "@/components/custom/GarmentPreview";
import { ConfiguratorControls } from "@/components/custom/ConfiguratorControls";

export default function CustomOrderPage() {
  const [garmentType, setGarmentType] = useState<string>("hoodie");
  const [fabric, setFabric] = useState<string>("Heavyweight Japanese Cotton (450 GSM)");
  const [size, setSize] = useState<string>("L");
  const [pattern, setPattern] = useState<string>("Plain Obsidian");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-12">
      {/* Header */}
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
          <span>ATELIER</span>
          <span>//</span>
          <span>BESPOKE BUILDER</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-[-0.05em] text-white">
          CUSTOM GARMENT STUDIO.
        </h1>
        <p className="text-sm text-[#888888] font-light leading-relaxed">
          Configure an individual piece with tailored fabric weight, proportion size, archival dye pattern, and your uploaded artwork placed cleanly on the center chest.
        </p>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Garment Stage with Fixed Overlay */}
        <div className="lg:col-span-6 sticky top-28">
          <GarmentPreview
            garmentType={garmentType}
            previewUrl={previewUrl}
            pattern={pattern}
            fabric={fabric}
          />
        </div>

        {/* Right: Controls & Options */}
        <div className="lg:col-span-6">
          <ConfiguratorControls
            garmentType={garmentType}
            setGarmentType={setGarmentType}
            fabric={fabric}
            setFabric={setFabric}
            size={size}
            setSize={setSize}
            pattern={pattern}
            setPattern={setPattern}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
          />
        </div>
      </div>
    </div>
  );
}
