/**
 * AURA AI — Shared TypeScript Type Definitions
 * Real-Time Spatial Commerce & Generative Luxury Styling Concierge
 */

export type GarmentCategory =
  | 'outerwear'
  | 'formalwear'
  | 'evening_wear'
  | 'knitwear'
  | 'accessories'
  | 'footwear';

export type AestheticVibe =
  | 'avant_garde'
  | 'quiet_luxury'
  | 'minimalist_chic'
  | 'black_tie'
  | 'resort_couture'
  | 'cyber_tailored';

export type BodySilhouette =
  | 'athletic'
  | 'slender'
  | 'hourglass'
  | 'rectangle'
  | 'inverted_triangle'
  | 'broad_shouldered';

export type SkinUndertone =
  | 'warm_golden'
  | 'cool_rosy'
  | 'neutral_olive'
  | 'deep_espresso'
  | 'porcelain_fair';

export interface GarmentItem {
  id: string;
  name: string;
  designer: string;
  price: number;
  currency: string;
  category: GarmentCategory;
  aesthetic_vibe: AestheticVibe;
  description: string;
  materials: string[];
  image_url: string;
  vton_overlay_url: string;
  color_hex: string;
  available_sizes: string[];
  fit_score?: number;
  match_reason?: string;
  in_stock: boolean;
  featured?: boolean;
}

export interface BodyLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface BodyAnalysisResult {
  detected: boolean;
  shoulder_width_cm: number;
  chest_waist_ratio: number;
  estimated_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom Couture';
  confidence: number;
  silhouette: BodySilhouette;
  skin_undertone: SkinUndertone;
  lighting_kelvin: number;
  landmarks?: BodyLandmark[];
  color_palette_recommendation?: string[];
}

export interface AffectiveSentiment {
  mood: 'confident' | 'hesitant' | 'excited' | 'skeptical' | 'neutral';
  energy_score: number;
  hesitation_score: number;
  empathy_adjustment: string;
}

export interface StylistMessage {
  id: string;
  sender: 'stylist' | 'user';
  text: string;
  audio_url?: string;
  timestamp: string;
  recommended_garments?: GarmentItem[];
  suggested_prompts?: string[];
  active_tryon_id?: string;
}

export interface CheckoutPayload {
  garment_id: string;
  selected_size: string;
  payment_method: 'apple_pay' | 'card' | 'concierge_billing';
  delivery_tier: 'same_day_courier' | 'express_concierge' | 'boutique_pickup';
  shipping_address: string;
  customer_name: string;
  customer_email: string;
}

export interface OrderRecord {
  id: string;
  garment: GarmentItem;
  size: string;
  total_amount: number;
  currency: string;
  status: 'dispatched' | 'preparing' | 'in_transit' | 'delivered';
  courier_eta: string;
  tracking_code: string;
  delivery_tier: string;
  created_at: string;
  customer_name: string;
}

export interface MerchantAnalytics {
  return_rate_reduction: number;
  conversion_lift_multiplier: number;
  total_spatial_tryons: number;
  retained_revenue: number;
  active_shopper_count: number;
  top_silhouette_demand: Array<{ name: string; percentage: number }>;
  size_distribution: Array<{ size: string; percentage: number }>;
  live_sentiment_stream: Array<{
    id: string;
    timestamp: string;
    sentiment: string;
    garment_name: string;
    size: string;
    action: string;
    impact: string;
  }>;
}

export interface TasteProfile {
  user_id: string;
  aesthetic_vibe: AestheticVibe;
  preferred_palettes: string[];
  favorite_designers: string[];
  sizes: {
    top: string;
    bottom: string;
    footwear: string;
  };
  upcoming_occasions: Array<{
    name: string;
    date: string;
    formality: string;
  }>;
}
