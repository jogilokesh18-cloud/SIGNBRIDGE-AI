import { create } from 'zustand';
import {
  GarmentItem,
  BodyAnalysisResult,
  AffectiveSentiment,
  StylistMessage,
  OrderRecord,
  MerchantAnalytics,
  AestheticVibe
} from '@signbridge/shared-types';

interface AuraState {
  isCameraActive: boolean;
  isModelReady: boolean;
  bodyScan: BodyAnalysisResult | null;
  activeGarment: GarmentItem | null;
  catalog: GarmentItem[];
  selectedSize: string;
  vtonMode: 'live_overlay' | 'silhouette' | 'minimal';
  audioStreaming: boolean;
  sentiment: AffectiveSentiment;
  conversation: StylistMessage[];
  isConsulting: boolean;
  orders: OrderRecord[];
  merchantAnalytics: MerchantAnalytics | null;
  checkoutModalOpen: boolean;
  activeVibe: AestheticVibe;

  setCameraActive: (active: boolean) => void;
  setModelReady: (ready: boolean) => void;
  setBodyScan: (scan: BodyAnalysisResult) => void;
  setActiveGarment: (garment: GarmentItem | null) => void;
  setCatalog: (catalog: GarmentItem[]) => void;
  setSelectedSize: (size: string) => void;
  setVtonMode: (mode: 'live_overlay' | 'silhouette' | 'minimal') => void;
  setAudioStreaming: (streaming: boolean) => void;
  setSentiment: (sentiment: AffectiveSentiment) => void;
  addMessage: (message: StylistMessage) => void;
  setConsulting: (consulting: boolean) => void;
  setOrders: (orders: OrderRecord[]) => void;
  addOrder: (order: OrderRecord) => void;
  setMerchantAnalytics: (analytics: MerchantAnalytics) => void;
  setCheckoutModalOpen: (open: boolean) => void;
  setActiveVibe: (vibe: AestheticVibe) => void;
}

export const useAuraStore = create<AuraState>((set) => ({
  isCameraActive: false,
  isModelReady: false,
  bodyScan: {
    detected: true,
    shoulder_width_cm: 46.2,
    chest_waist_ratio: 1.28,
    estimated_size: 'M',
    confidence: 0.984,
    silhouette: 'broad_shouldered',
    skin_undertone: 'neutral_olive',
    lighting_kelvin: 3200,
    color_palette_recommendation: ['#0b0f19', '#064e3b', '#d6c7b2', '#78350f']
  },
  activeGarment: null,
  catalog: [],
  selectedSize: 'M',
  vtonMode: 'live_overlay',
  audioStreaming: false,
  sentiment: {
    mood: 'confident',
    energy_score: 0.88,
    hesitation_score: 0.12,
    empathy_adjustment: 'High Urgency Luxury Concierge'
  },
  conversation: [
    {
      id: 'welcome-1',
      sender: 'stylist',
      text: 'Good evening. I have calibrated your 3D body geometry and ambient lighting. Select any couture piece or speak naturally—I will drape the garment over your live silhouette in real time.',
      timestamp: '12:00 PM',
      suggested_prompts: [
        'Style me for a black-tie gallery gala in Soho',
        'Show me double-faced cashmere outerwear',
        'Recommend an ensemble for my skin undertone'
      ]
    }
  ],
  isConsulting: false,
  orders: [],
  merchantAnalytics: null,
  checkoutModalOpen: false,
  activeVibe: 'quiet_luxury',

  setCameraActive: (active) => set({ isCameraActive: active }),
  setModelReady: (ready) => set({ isModelReady: ready }),
  setBodyScan: (bodyScan) => set({
    bodyScan,
    selectedSize: bodyScan.estimated_size === 'Custom Couture' ? 'M' : bodyScan.estimated_size
  }),
  setActiveGarment: (activeGarment) => set({ activeGarment }),
  setCatalog: (catalog) => set({
    catalog,
    activeGarment: catalog[0] || null
  }),
  setSelectedSize: (selectedSize) => set({ selectedSize }),
  setVtonMode: (vtonMode) => set({ vtonMode }),
  setAudioStreaming: (audioStreaming) => set({ audioStreaming }),
  setSentiment: (sentiment) => set({ sentiment }),
  addMessage: (message) => set((state) => ({ conversation: [...state.conversation, message] })),
  setConsulting: (isConsulting) => set({ isConsulting }),
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  setMerchantAnalytics: (merchantAnalytics) => set({ merchantAnalytics }),
  setCheckoutModalOpen: (checkoutModalOpen) => set({ checkoutModalOpen }),
  setActiveVibe: (activeVibe) => set({ activeVibe })
}));
