import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Zap,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';
import { api } from '../../services/api.js';
import { GarmentCategory, AestheticVibe, GarmentItem } from '@signbridge/shared-types';

export const UploadGarmentModal: React.FC = () => {
  const {
    uploadModalOpen,
    setUploadModalOpen,
    addGarment,
    setActiveGarment,
    bodyScan,
    addMessage
  } = useAuraStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [garmentName, setGarmentName] = useState<string>('');
  const [designer, setDesigner] = useState<string>('');
  const [category, setCategory] = useState<GarmentCategory>('outerwear');
  const [vibe, setVibe] = useState<AestheticVibe>('quiet_luxury');
  const [price, setPrice] = useState<number>(1450);
  const [detectedColor, setDetectedColor] = useState<string>('#b45309');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');

  if (!uploadModalOpen) return null;

  // Extract dominant color from image
  const analyzeImageColor = (imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = 40;
        c.height = 40;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 40, 40);
          const data = ctx.getImageData(10, 10, 20, 20).data;
          let r = 0, g = 0, b = 0;
          const count = data.length / 4;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          setDetectedColor(hex);
        }
      } catch (e) {
        console.warn('Color extraction fallback:', e);
      }
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        analyzeImageColor(result);
        if (!garmentName) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setGarmentName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setImagePreview(urlInput.trim());
      analyzeImageColor(urlInput.trim());
      if (!garmentName) {
        setGarmentName('Curated Runway Piece');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;

    setIsSubmitting(true);

    try {
      const payload: Partial<GarmentItem> = {
        name: garmentName.trim() || 'Custom Bespoke Piece',
        designer: designer.trim() || 'Bespoke Atelier Upload',
        category,
        aesthetic_vibe: vibe,
        price: Number(price) || 1200,
        currency: 'USD',
        description: `Client-uploaded ${vibe.replace('_', ' ')} piece calibrated for live spatial virtual try-on.`,
        materials: ['Custom Client Fabric Spec', 'Tailored Silk Lining'],
        image_url: imagePreview,
        vton_overlay_url: imagePreview,
        color_hex: detectedColor,
        available_sizes: ['XS', 'S', 'M', 'L', 'XL'],
        fit_score: 97,
        match_reason: `Contoured to your shoulder posture and ${bodyScan?.skin_undertone.replace('_', ' ') || 'warm'} undertones.`,
        in_stock: true,
        featured: true
      };

      let newGarment: GarmentItem;
      try {
        newGarment = await api.uploadCustomGarment(payload);
      } catch {
        // Local fallback
        newGarment = {
          ...payload,
          id: `custom-${Date.now().toString(36)}`
        } as GarmentItem;
      }

      addGarment(newGarment);
      setActiveGarment(newGarment);

      // Concierge feedback message
      addMessage({
        id: `stylist-${Date.now()}`,
        sender: 'stylist',
        text: `I have ingested your bespoke piece "${newGarment.name}" and mapped it to your live biometric frame. The ${detectedColor} tone creates refined harmony with your ${bodyScan?.skin_undertone.replace('_', ' ') || 'natural'} undertones. You can now adjust shoulder span and collar height in the mirror controls.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_prompts: [
          'How does this piece flatter my shoulder ratio?',
          'What accessories or trousers pair best with this?',
          'Recommend a color contrast for evening lighting'
        ]
      });

      setUploadModalOpen(false);
    } catch (err) {
      console.error('Failed to upload garment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Upload Custom Product for Spatial Try-On
              </h3>
              <p className="text-[11px] text-slate-400">
                Upload any shirt, jacket, suit or gown to see it draped on your live camera silhouette.
              </p>
            </div>
          </div>

          <button
            onClick={() => setUploadModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Product Image (PNG / JPEG / WebP / Transparent)
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-amber-400/40 bg-slate-950 aspect-[16/9] flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setUrlInput('');
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-white hover:bg-rose-600 transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/80 text-[10px] text-amber-300 font-mono">
                  <span
                    className="w-3 h-3 rounded-full border border-white/30"
                    style={{ backgroundColor: detectedColor }}
                  />
                  <span>Detected Color: {detectedColor}</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-white/20 hover:border-amber-400/50 p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/5 hover:bg-white/8 group"
              >
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-400 transition-colors mb-2" />
                <p className="text-xs font-bold text-white mb-0.5">
                  Click to browse or drag & drop garment photo
                </p>
                <p className="text-[10px] text-slate-400">
                  Works with flat-lay clothing, editorial photos, or catalog cutouts
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Alternative: Image URL Input */}
            {!imagePreview && (
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="url"
                    placeholder="Or paste an image web link (https://...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors"
                >
                  Load URL
                </button>
              </div>
            )}
          </div>

          {/* Product Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Garment Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vintage Leather Trench Coat"
                value={garmentName}
                onChange={(e) => setGarmentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Designer / Brand
              </label>
              <input
                type="text"
                placeholder="e.g. Maison Margiela / Custom"
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Category & Vibe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
              >
                <option value="outerwear">Outerwear & Coats</option>
                <option value="formalwear">Formalwear & Suits</option>
                <option value="evening_wear">Evening Gowns & Dresses</option>
                <option value="knitwear">Knitwear & Shirts</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Aesthetic Vibe
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value as AestheticVibe)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
              >
                <option value="quiet_luxury">Quiet Luxury</option>
                <option value="black_tie">Black Tie Formal</option>
                <option value="avant_garde">Avant-Garde</option>
                <option value="cyber_tailored">Cyber-Tailored</option>
                <option value="minimalist_chic">Minimalist Chic</option>
                <option value="resort_couture">Resort Couture</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!imagePreview || isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Calibrating Biometric Drape...' : 'Upload & Try On Live in Mirror'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
