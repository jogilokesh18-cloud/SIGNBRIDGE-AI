import React, { useEffect } from 'react';
import { useAuraStore } from '../store/auraStore.js';
import { api } from '../services/api.js';
import { ShoppingBag, Truck, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const { orders, setOrders } = useAuraStore();

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getOrders();
        setOrders(list);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-white max-w-4xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-amber-500/10">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">VIP Orders & Courier Tracking</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time status of your white-glove dispatched luxury couture.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold">No Dispatched Orders Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try on haute couture pieces in the Spatial Mirror and authorize an instant order with Apple Pay.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase"
          >
            <span>Open Spatial Mirror</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-4 hover:border-amber-400/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                    <Truck className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      Tracking Code: {ord.tracking_code}
                    </span>
                    <h4 className="text-base font-bold text-white">{ord.garment.name}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {ord.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans block">Size:</span>
                  <span className="text-white font-bold">{ord.size} (3D Verified)</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">Courier ETA:</span>
                  <span className="text-emerald-400 font-bold">{ord.courier_eta}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">Total Billed:</span>
                  <span className="text-amber-400 font-bold">${ord.total_amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans block">Recipient:</span>
                  <span className="text-white">{ord.customer_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
