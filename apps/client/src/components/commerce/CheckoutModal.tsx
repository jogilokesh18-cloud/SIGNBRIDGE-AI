import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Zap, Truck, CreditCard } from 'lucide-react';
import { useAuraStore } from '../../store/auraStore.js';
import { api } from '../../services/api.js';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    activeGarment,
    selectedSize,
    setSelectedSize,
    bodyScan,
    addOrder
  } = useAuraStore();

  const [deliveryTier, setDeliveryTier] = useState<'same_day_courier' | 'express_concierge' | 'boutique_pickup'>('same_day_courier');
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card' | 'concierge_billing'>('apple_pay');
  const [address, setAddress] = useState('450 West 14th St, Penthouse B, Soho, New York, NY');
  const [customerName, setCustomerName] = useState('Sophia Vance');
  const [customerEmail, setCustomerEmail] = useState('sophia.vance@soho-private.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  if (!checkoutModalOpen || !activeGarment) return null;

  const handleAuthorize = async () => {
    setIsSubmitting(true);
    try {
      const order = await api.checkout({
        garment_id: activeGarment.id,
        selected_size: selectedSize,
        payment_method: paymentMethod,
        delivery_tier: deliveryTier,
        shipping_address: address,
        customer_name: customerName,
        customer_email: customerEmail
      });

      addOrder(order);
      setCompletedOrder(order);
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setCheckoutModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl shadow-amber-500/20 text-white space-y-6">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="text-center space-y-5 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 mx-auto flex items-center justify-center shadow-lg shadow-amber-400/30">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-widest">
                Zero-Friction Order Confirmed
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Couture Dispatched</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your private courier has been assigned and is collecting your garment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tracking Code:</span>
                <span className="text-amber-300 font-bold">{completedOrder.tracking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Garment:</span>
                <span className="text-white">{completedOrder.garment.name} ({completedOrder.size})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Courier ETA:</span>
                <span className="text-emerald-400 font-bold">{completedOrder.courier_eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Billed:</span>
                <span className="text-amber-400 font-bold">${completedOrder.total_amount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Return to Spatial Mirror
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Aura Private Commerce
              </span>
              <h3 className="text-xl font-black tracking-tight mt-0.5">Instant Concierge Checkout</h3>
            </div>

            {/* Garment Preview Summary */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <img
                src={activeGarment.image_url}
                alt={activeGarment.name}
                className="w-16 h-20 rounded-xl object-cover"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{activeGarment.name}</h4>
                <p className="text-xs text-slate-400">{activeGarment.designer}</p>
                <div className="text-base font-black text-amber-400">
                  ${activeGarment.price.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Sizing Selection with 3D Body Verification */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Select Size:</span>
                <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>3D Measured Fit: <strong>{bodyScan?.estimated_size || 'M'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeGarment.available_sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === sz
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Tier */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">White-Glove Delivery Tier:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setDeliveryTier('same_day_courier')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryTier === 'same_day_courier'
                      ? 'bg-amber-400/15 border-amber-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    Same-Day VIP
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Arrives within 3 Hours</div>
                </button>

                <button
                  onClick={() => setDeliveryTier('boutique_pickup')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    deliveryTier === 'boutique_pickup'
                      ? 'bg-amber-400/15 border-amber-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-white">Private Suite Pickup</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">5th Ave Flagship Boutique</div>
                </button>
              </div>
            </div>

            {/* One-Click Payment CTA */}
            <button
              onClick={handleAuthorize}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-400 hover:to-yellow-200 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-xl shadow-amber-400/20 active:scale-98 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Authorizing with Concierge...' : `Authorize Apple Pay • $${activeGarment.price.toLocaleString()}`}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
