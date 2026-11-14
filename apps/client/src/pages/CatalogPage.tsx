import React, { useEffect, useState } from 'react';
import { GarmentItem } from '@signbridge/shared-types';
import { useAuraStore } from '../store/auraStore.js';
import { api } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { catalog, setCatalog, setActiveGarment } = useAuraStore();
  const [selectedVibe, setSelectedVibe] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const items = await api.getCatalog();
        if (items && items.length > 0) {
          setCatalog(items);
        }
      } catch (e) {
        console.warn('Using client store catalog:', e);
      }
    }
    load();
  }, []);

  const vibes = [
    'all',
    'quiet_luxury',
    'black_tie',
    'avant_garde',
    'cyber_tailored',
    'minimalist_chic',
    'resort_couture'
  ];

  const categories = [
    'all',
    'outerwear',
    'formalwear',
    'evening_wear',
    'knitwear'
  ];

  const filtered = catalog.filter((g) => {
    const matchesVibe = selectedVibe === 'all' || g.aesthetic_vibe === selectedVibe;
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesVibe && matchesCat;
  });

  const handleTryOn = (garment: GarmentItem) => {
    setActiveGarment(garment);
    navigate('/');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-white">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/10">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Couture Runway</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              {filtered.length} of {catalog.length} Silhouettes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore 14 haute couture garments engineered for real-time spatial generative try-on.
          </p>
        </div>

        {/* Vibe filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {vibes.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVibe(v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedVibe === v
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-amber-400/40 hover:text-white'
              }`}
            >
              {v.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Garments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((garment) => (
          <div
            key={garment.id}
            className="group rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-400/10 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[4/5] bg-slate-950 overflow-hidden">
              <img
                src={garment.image_url}
                alt={garment.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10">
                {garment.aesthetic_vibe.replace('_', ' ')}
              </div>
              {garment.fit_score && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-white border border-amber-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>{garment.fit_score}% Fit</span>
                </div>
              )}
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-300/80 tracking-wider">
                  {garment.designer}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  {garment.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">
                  {garment.description}
                </p>
              </div>

              {/* Material Badges */}
              <div className="flex flex-wrap gap-1 pt-1">
                {garment.materials.map((mat, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 font-mono"
                  >
                    {mat}
                  </span>
                ))}
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Curated Price</span>
                  <span className="text-lg font-black text-amber-400">
                    ${garment.price.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleTryOn(garment)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Spatial Try-On</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
