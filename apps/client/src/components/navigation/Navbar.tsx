import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Camera, Compass, LineChart, ShoppingBag, ShieldCheck, User, Radio } from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { audioStreaming, setAudioStreaming, orders } = useAuraStore();

  const navLinks = [
    { name: 'Spatial Mirror', path: '/', icon: Camera },
    { name: 'Couture Runway', path: '/runway', icon: Compass },
    { name: 'Merchant Pulse', path: '/merchant', icon: LineChart },
    { name: 'Taste DNA', path: '/profile', icon: User },
    { name: 'VIP Orders', path: '/orders', icon: ShoppingBag, badge: orders.length || undefined }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/10 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-white">
                  AURA<span className="text-amber-400 font-serif italic text-2xl font-normal">.ai</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Spatial Luxury CX
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Generative Stylist & Zero-Friction Commerce
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400/80" />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Voice Concierge Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAudioStreaming(!audioStreaming)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                audioStreaming
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-pulse'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-amber-400/40 hover:text-white'
              }`}
              title="Toggle Live Voice Concierge"
            >
              <Radio className={`w-3.5 h-3.5 ${audioStreaming ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {audioStreaming ? 'Concierge Mic: Active' : 'Enable Voice'}
              </span>
            </button>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
              SV
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
