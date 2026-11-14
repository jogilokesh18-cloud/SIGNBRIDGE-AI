import { describe, it, expect } from 'vitest';
import {
  GarmentItemSchema,
  GarmentCategorySchema,
  BodyAnalysisSchema,
  StylistQuerySchema,
  CheckoutPayloadSchema
} from '@signbridge/shared-schemas';

describe('AURA AI — Unit Schema Validations', () => {
  it('should validate a luxury garment catalog item', () => {
    const validGarment = {
      id: 'garment-001',
      name: 'Midnight Wool-Silk Sculptural Tuxedo Jacket',
      designer: 'Atelier Saint Laurent',
      price: 2650,
      currency: 'USD',
      category: 'formalwear',
      aesthetic_vibe: 'black_tie',
      description: 'Super 180s virgin wool with silk peak lapels.',
      materials: ['Virgin Wool', 'Mulberry Silk'],
      image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
      vton_overlay_url: '/assets/garments/tuxedo_overlay.svg',
      color_hex: '#0b0f19',
      available_sizes: ['S', 'M', 'L'],
      in_stock: true
    };

    const parsed = GarmentItemSchema.parse(validGarment);
    expect(parsed.name).toBe('Midnight Wool-Silk Sculptural Tuxedo Jacket');
    expect(parsed.price).toBe(2650);
  });

  it('should reject invalid garment categories', () => {
    expect(() => GarmentCategorySchema.parse('casual_sneakers')).toThrow();
  });

  it('should validate 3D body analysis biometrics', () => {
    const validScan = {
      detected: true,
      shoulder_width_cm: 46.5,
      chest_waist_ratio: 1.32,
      estimated_size: 'M',
      confidence: 0.985,
      silhouette: 'broad_shouldered',
      skin_undertone: 'neutral_olive',
      lighting_kelvin: 3200
    };

    const parsed = BodyAnalysisSchema.parse(validScan);
    expect(parsed.estimated_size).toBe('M');
    expect(parsed.silhouette).toBe('broad_shouldered');
  });

  it('should reject empty stylist prompts', () => {
    expect(() =>
      StylistQuerySchema.parse({
        user_prompt: '',
        conversation_history: []
      })
    ).toThrow();
  });

  it('should validate zero-friction checkout payloads', () => {
    const validCheckout = {
      garment_id: 'garment-001',
      selected_size: 'M',
      payment_method: 'apple_pay',
      delivery_tier: 'same_day_courier',
      shipping_address: '450 West 14th St, Penthouse B, Soho, New York, NY',
      customer_name: 'Sophia Vance',
      customer_email: 'sophia.vance@soho-private.com'
    };

    const parsed = CheckoutPayloadSchema.parse(validCheckout);
    expect(parsed.delivery_tier).toBe('same_day_courier');
  });
});
