import {
  GarmentItem,
  BodyAnalysisResult,
  CheckoutPayload,
  OrderRecord,
  MerchantAnalytics
} from '@signbridge/shared-types';
import { LUXURY_CATALOG } from './seed-data.js';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

class AuraDbRepository {
  private inMemoryGarments: GarmentItem[] = [...LUXURY_CATALOG];
  private inMemoryScans: BodyAnalysisResult[] = [];
  private inMemoryOrders: OrderRecord[] = [
    {
      id: 'ord-9021',
      garment: LUXURY_CATALOG[0],
      size: 'M',
      total_amount: 2650,
      currency: 'USD',
      status: 'in_transit',
      courier_eta: 'Today by 4:30 PM (Private Courier)',
      tracking_code: 'AURA-EXP-9021-NY',
      delivery_tier: 'same_day_courier',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      customer_name: 'Sophia Vance'
    },
    {
      id: 'ord-8842',
      garment: LUXURY_CATALOG[1],
      size: 'S',
      total_amount: 3200,
      currency: 'USD',
      status: 'delivered',
      courier_eta: 'Delivered',
      tracking_code: 'AURA-EXP-8842-LDN',
      delivery_tier: 'express_concierge',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      customer_name: 'Julian Mercer'
    }
  ];

  async getGarments(filter?: {
    category?: string;
    vibe?: string;
    featured?: boolean;
  }): Promise<GarmentItem[]> {
    let list = [...this.inMemoryGarments];
    if (filter?.category) {
      list = list.filter((g) => g.category === filter.category);
    }
    if (filter?.vibe) {
      list = list.filter((g) => g.aesthetic_vibe === filter.vibe);
    }
    if (filter?.featured !== undefined) {
      list = list.filter((g) => Boolean(g.featured) === filter.featured);
    }
    return list;
  }

  async getGarmentById(id: string): Promise<GarmentItem | null> {
    const item = this.inMemoryGarments.find((g) => g.id === id);
    return item || null;
  }

  async addCustomGarment(item: Partial<GarmentItem>): Promise<GarmentItem> {
    const newGarment: GarmentItem = {
      id: item.id || `custom-${Date.now().toString(36)}`,
      name: item.name || 'Custom Bespoke Silhouette',
      designer: item.designer || 'Client Atelier Upload',
      price: item.price || 1450,
      currency: item.currency || 'USD',
      category: item.category || 'formalwear',
      aesthetic_vibe: item.aesthetic_vibe || 'quiet_luxury',
      description: item.description || 'Client-uploaded garment custom mapped to live biometric body geometry.',
      materials: item.materials?.length ? item.materials : ['Bespoke Custom Fabric Spec'],
      image_url: item.image_url || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      vton_overlay_url: item.vton_overlay_url || item.image_url || '',
      color_hex: item.color_hex || '#0b0f19',
      available_sizes: item.available_sizes?.length ? item.available_sizes : ['XS', 'S', 'M', 'L', 'XL'],
      fit_score: item.fit_score || 96,
      match_reason: item.match_reason || 'Custom uploaded piece dynamically draped over upper torso posture.',
      in_stock: true,
      featured: true
    };
    this.inMemoryGarments.unshift(newGarment);
    logger.info({ id: newGarment.id, name: newGarment.name }, 'Custom garment uploaded');
    return newGarment;
  }

  async recordBodyScan(scan: BodyAnalysisResult): Promise<BodyAnalysisResult> {
    this.inMemoryScans.push(scan);
    logger.info({ size: scan.estimated_size, silhouette: scan.silhouette }, '3D body scan registered');
    return scan;
  }

  async createOrder(payload: CheckoutPayload): Promise<OrderRecord> {
    const garment = await this.getGarmentById(payload.garment_id);
    if (!garment) {
      throw new Error(`Garment not found with id ${payload.garment_id}`);
    }

    const orderId = `ord-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const trackingCode = `AURA-VIP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const order: OrderRecord = {
      id: orderId,
      garment,
      size: payload.selected_size,
      total_amount: garment.price,
      currency: garment.currency,
      status: 'dispatched',
      courier_eta: payload.delivery_tier === 'same_day_courier' ? 'Within 3 Hours (VIP White-Glove)' : 'Next Morning by 10 AM',
      tracking_code: trackingCode,
      delivery_tier: payload.delivery_tier,
      created_at: new Date().toISOString(),
      customer_name: payload.customer_name
    };

    this.inMemoryOrders.unshift(order);
    logger.info({ orderId, trackingCode, amount: order.total_amount }, 'Autonomous order created');
    return order;
  }

  async getOrders(): Promise<OrderRecord[]> {
    return [...this.inMemoryOrders];
  }

  async getMerchantAnalytics(): Promise<MerchantAnalytics> {
    return {
      return_rate_reduction: 84.4, // Down from 48% to 7.5%
      conversion_lift_multiplier: 3.24,
      total_spatial_tryons: 14820 + this.inMemoryScans.length,
      retained_revenue: 418290 + this.inMemoryOrders.reduce((sum, o) => sum + o.total_amount, 0),
      active_shopper_count: 128,
      top_silhouette_demand: [
        { name: 'Architectural Shoulders', percentage: 38 },
        { name: 'Fluid Bias-Cut Drapes', percentage: 29 },
        { name: 'Boxy Minimalist Cuts', percentage: 21 },
        { name: 'Hourglass Tailoring', percentage: 12 }
      ],
      size_distribution: [
        { size: 'XS', percentage: 14 },
        { size: 'S', percentage: 32 },
        { size: 'M', percentage: 36 },
        { size: 'L', percentage: 15 },
        { size: 'XL', percentage: 3 }
      ],
      live_sentiment_stream: [
        {
          id: 'ev-1',
          timestamp: 'Just now',
          sentiment: 'High Excitement (94%)',
          garment_name: 'Midnight Wool-Silk Tuxedo',
          size: 'M',
          action: 'Voice Checkout Dispatched',
          impact: '+$2,650 Retained'
        },
        {
          id: 'ev-2',
          timestamp: '3m ago',
          sentiment: 'Hesitation Resolved',
          garment_name: 'Fluid Emerald Satin Slip',
          size: 'S',
          action: 'Colorimetry Matched Undertone',
          impact: 'Return Averted'
        },
        {
          id: 'ev-3',
          timestamp: '7m ago',
          sentiment: 'Delighted Confidence',
          garment_name: 'Baby Cashmere Trench',
          size: 'L',
          action: 'Body Mesh Size Verified',
          impact: '+$4,400 Retained'
        }
      ]
    };
  }
}

export const dbRepository = new AuraDbRepository();
