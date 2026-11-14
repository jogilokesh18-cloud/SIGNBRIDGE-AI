import React, { useEffect, useState } from 'react';
import { GarmentItem, AestheticVibe } from '@signbridge/shared-types';
import { useAuraStore } from '../store/auraStore.js';
import { api } from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { catalog, setCatalog, setActiveGarment } = useAuraStore();
  const [selectedVibe, setSelectedVibe] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const items = await api.getCatalog();
        setCatalog(items);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const vibes = ['all', 'quiet_luxury', 'black_tie', 'avant_garde', 'cyber_tailored', 'minimalist_chic'];

  const filtered = selectedVibe === 'all'
    ? catalog
    : catalog.filter((g) => g.aesthetic_vibe === selectedVibe);

  const handleTryOn = (garment: GarmentItem) => {
    setActiveGarment(garment);
    navigate('/');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/10">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Couture Runway</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore haute couture silhouettes engineered for real-time spatial virtual try-on.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10">
                {garment.aesthetic_vibe.replace('_', ' ')}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {garment.designer}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  {garment.name}
                </h3>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {garment.description}
              </p>

              {/* Material Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {garment.materials.map((mat, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10"
                  >
                    {mat}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="text-lg font-black text-amber-400">
                  ${garment.price.toLocaleString()}
                </div>

                <button
                  onClick={() => handleTryOn(garment)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Drape in Mirror</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
