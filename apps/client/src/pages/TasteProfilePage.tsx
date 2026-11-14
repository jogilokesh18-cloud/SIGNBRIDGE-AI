import React from 'react';
import { useAuraStore } from '../store/auraStore.js';
import { User, ShieldCheck, Sparkles, Sliders, Calendar, Palette } from 'lucide-react';

export const TasteProfilePage: React.FC = () => {
  const { bodyScan, activeVibe, setActiveVibe } = useAuraStore();

  const vibes = [
    { id: 'quiet_luxury', name: 'Quiet Luxury', desc: 'Understated Italian double-faced silk, cashmere, neutral minimalism' },
    { id: 'black_tie', name: 'Black Tie Couture', desc: 'Sculptural virgin wool, satin peak lapels, evening grandeur' },
    { id: 'avant_garde', name: 'Avant-Garde Architectural', desc: 'Aerodynamic drapes, asymmetric hemlines, washed lambskin' },
    { id: 'cyber_tailored', name: 'Cyber Tailored', desc: 'Reflective prism yarn, thermo-welded gore-tex, sharp street couture' }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-white max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Customer Taste DNA</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Your biometric tailoring parameters, colorimetry profile, and private wardrobe aesthetics.
        </p>
      </div>

      {/* Grid: 3D Body Biometrics (Left) + Colorimetry & Occasions (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: 3D Body Biometrics */}
        <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              3D Biometric Measurements
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Verified 60 FPS
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 font-sans">Shoulder Acromion Width:</span>
              <span className="text-amber-300 font-bold">{bodyScan?.shoulder_width_cm || 46.2} cm</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 font-sans">Chest-to-Waist Ratio:</span>
              <span className="text-amber-300 font-bold">{bodyScan?.chest_waist_ratio || 1.28}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 font-sans">Silhouette Classification:</span>
              <span className="text-white font-bold capitalize">{bodyScan?.silhouette.replace('_', ' ') || 'Broad Shouldered'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 font-sans">Standard Sizing Anchor:</span>
              <span className="text-emerald-400 font-bold">{bodyScan?.estimated_size || '38R / M'}</span>
            </div>
          </div>
        </div>

        {/* Right: Colorimetry & Undertone Analysis */}
        <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Colorimetry & Undertone Analysis
            </h3>
            <span className="flex items-center gap-1.5 text-xs text-amber-400">
              <Palette className="w-4 h-4" />
              Kelvin Calibrated
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400">Skin Undertone: </span>
              <strong className="text-white capitalize">{bodyScan?.skin_undertone.replace('_', ' ') || 'Neutral Olive'}</strong>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-slate-400">Harmonic Palette Recommendations:</span>
              <div className="flex items-center gap-2">
                {bodyScan?.color_palette_recommendation?.map((hex, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full h-10 rounded-xl border border-white/20 shadow-md"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aesthetic Vibe Selector */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Preferred Stylistic DNA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vibes.map((v) => (
            <div
              key={v.id}
              onClick={() => setActiveVibe(v.id as any)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                activeVibe === v.id
                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-amber-400/30 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{v.name}</span>
                {activeVibe === v.id && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
