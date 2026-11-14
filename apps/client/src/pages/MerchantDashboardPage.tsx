import React, { useEffect, useState } from 'react';
import { MerchantAnalytics } from '@signbridge/shared-types';
import { api } from '../services/api.js';
import { LineChart, TrendingDown, TrendingUp, DollarSign, Users, ShieldCheck, Activity } from 'lucide-react';

export const MerchantDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getMerchantAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  if (!analytics) return <div className="p-8 text-white">Loading Merchant Pulse...</div>;

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/10">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Merchant Style Pulse</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time executive telemetry: return reduction, conversion velocity, and aesthetic demand.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Enterprise Feed Connected</span>
        </div>
      </div>

      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Return Rate Reduction */}
        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Return Rate Reduction</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            -{analytics.return_rate_reduction}%
          </div>
          <p className="text-[11px] text-slate-400">
            Average return rate plunged from 48% to 7.5% via 3D sizing verification.
          </p>
        </div>

        {/* Conversion Velocity Lift */}
        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conversion Velocity Lift</span>
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-400">
            {analytics.conversion_lift_multiplier}x
          </div>
          <p className="text-[11px] text-slate-400">
            Shoppers using the spatial mirror purchase at 3.24x the industry baseline.
          </p>
        </div>

        {/* Retained Revenue */}
        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Retained Luxury Revenue</span>
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">
            ${analytics.retained_revenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Directly saved from avoided returns and autonomous concierge retention.
          </p>
        </div>

        {/* Total Spatial Try-Ons */}
        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Spatial Try-Ons</span>
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-blue-400">
            {analytics.total_spatial_tryons.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            {analytics.active_shopper_count} VIP shoppers currently active in mirror.
          </p>
        </div>
      </div>

      {/* Mid Grid: Silhouette Demand & Live Sentiment Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Silhouette Demand */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Silhouette Demand & Fit Velocity
          </h3>

          <div className="space-y-4">
            {analytics.top_silhouette_demand.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-semibold">{item.name}</span>
                  <span className="text-amber-400 font-mono font-bold">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Customer Sentiment Stream */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Live Spatial CX Sentiment Stream
          </h3>

          <div className="space-y-3">
            {analytics.live_sentiment_stream.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{ev.garment_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                      {ev.size}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{ev.action} • <span className="text-emerald-400 font-semibold">{ev.sentiment}</span></div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-amber-300 font-bold">{ev.impact}</div>
                  <div className="text-[10px] text-slate-500">{ev.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
