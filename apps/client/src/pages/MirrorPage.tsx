import React, { useEffect } from 'react';
import { SpatialMirror } from '../components/mirror/SpatialMirror.js';
import { StylistHUD } from '../components/mirror/StylistHUD.js';
import { GarmentSelector } from '../components/mirror/GarmentSelector.js';
import { CheckoutModal } from '../components/commerce/CheckoutModal.js';
import { UploadGarmentModal } from '../components/commerce/UploadGarmentModal.js';
import { useAuraStore } from '../store/auraStore.js';
import { api } from '../services/api.js';

export const MirrorPage: React.FC = () => {
  const { setCatalog } = useAuraStore();

  useEffect(() => {
    async function loadInitialData() {
      try {
        const garments = await api.getCatalog();
        setCatalog(garments);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      }
    }
    loadInitialData();
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner / Spatial State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Spatial Commerce Mirror
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time generative virtual try-on, 3D body contouring, and Milanese luxury styling concierge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold border border-amber-400/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Live Latent Diffusion Engine
          </span>
        </div>
      </div>

      {/* Main Grid: Spatial Camera Mirror (Left) + Stylist HUD (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SpatialMirror />
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
