import React from 'react';
import { GarmentItem } from '@signbridge/shared-types';
import { useAuraStore } from '../../store/auraStore.js';
import { Check, Sparkles } from 'lucide-react';

export const GarmentSelector: React.FC = () => {
  const { catalog, activeGarment, setActiveGarment, setCheckoutModalOpen } = useAuraStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Available Haute Couture Runway
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {catalog.length} Curated Silhouettes
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {catalog.map((garment) => {
          const isActive = activeGarment?.id === garment.id;

          return (
            <div
              key={garment.id}
              onClick={() => setActiveGarment(garment)}
              className={`group relative rounded-2xl p-2.5 cursor-pointer transition-all border ${
                isActive
                  ? 'bg-amber-400/10 border-amber-400 shadow-xl shadow-amber-400/10 scale-102 ring-1 ring-amber-400'
                  : 'bg-white/5 border-white/10 hover:border-amber-400/40 hover:bg-white/8'
              }`}
            >
              {/* Image Preview with overlay badge */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-slate-900">
                <img
                  src={garment.image_url}
                  alt={garment.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                {garment.fit_score && (
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-white/10">
                    {garment.fit_score}% Fit Match
                  </div>
                )}
              </div>

              {/* Garment Details */}
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {garment.name}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">{garment.designer}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black text-amber-400">
                    ${garment.price.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                    {garment.available_sizes.join(' ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
