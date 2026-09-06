"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Check, X, Loader2, Star } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 180,
    category: "Hoodies",
    images: "",
    fabric_options: "500 GSM French Terry, 450 GSM Heavy Cotton",
    size_options: "XS, S, M, L, XL, XXL",
    pattern_options: "Solid Obsidian, Distressed Acid Mineral",
    featured: false,
    stock: 25,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 180,
      category: "Hoodies",
      images: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000",
      fabric_options: "500 GSM French Terry, 450 GSM Heavy Cotton",
      size_options: "XS, S, M, L, XL, XXL",
      pattern_options: "Solid Obsidian, Distressed Acid Mineral",
      featured: false,
      stock: 25,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      category: product.category,
      images: (product.images || []).join(", "),
      fabric_options: (product.fabric_options || []).join(", "),
      size_options: (product.size_options || []).join(", "),
      pattern_options: (product.pattern_options || []).join(", "),
      featured: product.featured,
      stock: product.stock,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm deleting this product?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      images: formData.images.split(",").map((s) => s.trim()).filter(Boolean),
      fabric_options: formData.fabric_options.split(",").map((s) => s.trim()).filter(Boolean),
      size_options: formData.size_options.split(",").map((s) => s.trim()).filter(Boolean),
      pattern_options: formData.pattern_options.split(",").map((s) => s.trim()).filter(Boolean),
      featured: formData.featured,
      stock: Number(formData.stock),
    };

    try {
      if (editingProduct) {
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        if (res.ok) {
          setShowModal(false);
          fetchProducts();
        }
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setShowModal(false);
          fetchProducts();
        }
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-white">
            Product Catalogue Management
          </h2>
          <p className="text-xs text-[#777777]">
            Add, update inventory, toggle featured drops, and configure textile options.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Silhouette</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-[#888888]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs uppercase tracking-wider text-[#666666]">
            No products found. Add your first piece above.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e0e0e] text-[#777777] uppercase font-mono text-[10px] tracking-wider">
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#cccccc]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded bg-[#161616] overflow-hidden flex-shrink-0">
                        <Image
                          src={product.images?.[0] || "/placeholder-garment.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase line-clamp-1">{product.name}</div>
                        <div className="text-[10px] font-mono text-[#666666]">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 uppercase font-mono">{product.category}</td>
                  <td className="p-4 font-mono font-bold text-white">{formatCurrency(Number(product.price))}</td>
                  <td className="p-4 font-mono">
                    <span className={product.stock <= 5 ? "text-red-400 font-bold" : "text-white"}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    {product.featured ? (
                      <span className="inline-flex items-center gap-1 text-[#d4ff00] text-[10px] font-mono font-bold uppercase">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Yes</span>
                      </span>
                    ) : (
                      <span className="text-[#555555] text-[10px] font-mono uppercase">No</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 text-[#888888] hover:text-white transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 text-[#888888] hover:text-red-400 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0e0e0e] border border-white/15 rounded-xl p-6 space-y-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm uppercase tracking-widest font-bold">
                {editingProduct ? "Edit Product Silhouette" : "Add New Silhouette"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#888888] uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white"
                  >
                    <option value="Hoodies">Hoodies</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#888888] uppercase tracking-wider block mb-1">
                  Image URLs (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">
                    Fabric Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.fabric_options}
                    onChange={(e) => setFormData({ ...formData, fabric_options: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">
                    Size Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.size_options}
                    onChange={(e) => setFormData({ ...formData, size_options: e.target.value })}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded bg-[#161616] border-white/20 text-[#d4ff00] focus:ring-0"
                />
                <label htmlFor="featured-check" className="text-xs uppercase tracking-wider cursor-pointer">
                  Feature in Drop 01 Highlights on Home Page
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-[#888888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors"
                >
                  {editingProduct ? "Update Silhouette" : "Create Silhouette"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
