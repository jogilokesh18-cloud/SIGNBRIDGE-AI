import React, { useEffect, useState } from 'react';
import { SpatialMirror } from '../components/mirror/SpatialMirror.js';
import { GenerativeTryonStudio } from '../components/mirror/GenerativeTryonStudio.js';
import { StylistHUD } from '../components/mirror/StylistHUD.js';
import { GarmentSelector } from '../components/mirror/GarmentSelector.js';
import { CheckoutModal } from '../components/commerce/CheckoutModal.js';
import { UploadGarmentModal } from '../components/commerce/UploadGarmentModal.js';
import { useAuraStore } from '../store/auraStore.js';
import { api } from '../services/api.js';
import { Sparkles, Camera, Image as ImageIcon } from 'lucide-react';

export const MirrorPage: React.FC = () => {
  const { setCatalog } = useAuraStore();
  const [experienceMode, setExperienceMode] = useState<'generative_studio' | 'live_camera'>('generative_studio');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const garments = await api.getCatalog();
        if (garments && garments.length > 0) {
          setCatalog(garments);
        }
      } catch (err) {
        console.warn('Initial data load notice:', err);
      }
    }
    loadInitialData();
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner / Experience Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AI Virtual Try-On Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload a person photo & product photo — AI will edit the person's photo to show them naturally wearing the product.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-xl">
          <button
            onClick={() => setExperienceMode('generative_studio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              experienceMode === 'generative_studio'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>AI Photo Synthesis Studio</span>
          </button>

          <button
            onClick={() => setExperienceMode('live_camera')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              experienceMode === 'live_camera'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Mirror</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Studio/Mirror Canvas (Left) + Stylist HUD (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          {experienceMode === 'generative_studio' ? (
            <GenerativeTryonStudio />
          ) : (
            <SpatialMirror />
          )}
        </div>

        <div className="lg:col-span-5">
          <StylistHUD />
        </div>
      </div>

      {/* Haute Couture Runway Drawer */}
      <div className="pt-2">
        <GarmentSelector />
      </div>

      {/* Checkout & Upload Modals */}
      <CheckoutModal />
      <UploadGarmentModal />
    </div>
  );
};
