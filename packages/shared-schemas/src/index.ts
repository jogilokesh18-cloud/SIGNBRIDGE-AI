/**
 * AURA AI — Shared Zod Validation Schemas
 * Real-Time Spatial Commerce & Generative Luxury Styling Concierge
 */

import { z } from 'zod';

export const GarmentCategorySchema = z.enum([
  'outerwear',
  'formalwear',
  'evening_wear',
  'knitwear',
  'accessories',
  'footwear'
]);

export const AestheticVibeSchema = z.enum([
  'avant_garde',
  'quiet_luxury',
  'minimalist_chic',
  'black_tie',
  'resort_couture',
  'cyber_tailored'
]);

export const BodySilhouetteSchema = z.enum([
  'athletic',
  'slender',
  'hourglass',
  'rectangle',
  'inverted_triangle',
  'broad_shouldered'
]);

export const SkinUndertoneSchema = z.enum([
  'warm_golden',
  'cool_rosy',
  'neutral_olive',
  'deep_espresso',
  'porcelain_fair'
]);

export const GarmentItemSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  name: z.string().min(2),
  designer: z.string().min(2),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  category: GarmentCategorySchema,
  aesthetic_vibe: AestheticVibeSchema,
  description: z.string(),
  materials: z.array(z.string()),
  image_url: z.string().url().or(z.string().startsWith('/')),
  vton_overlay_url: z.string().url().or(z.string().startsWith('/')),
  color_hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  available_sizes: z.array(z.string()).min(1),
  fit_score: z.number().min(0).max(100).optional(),
  match_reason: z.string().optional(),
  in_stock: z.boolean().default(true),
  featured: z.boolean().optional()
});

export const BodyAnalysisSchema = z.object({
  detected: z.boolean(),
  shoulder_width_cm: z.number().positive(),
  chest_waist_ratio: z.number().positive(),
  estimated_size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'Custom Couture']),
  confidence: z.number().min(0).max(1),
  silhouette: BodySilhouetteSchema,
  skin_undertone: SkinUndertoneSchema,
  lighting_kelvin: z.number().positive(),
  landmarks: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        z: z.number().optional(),
        visibility: z.number().optional()
      })
    )
    .optional(),
  color_palette_recommendation: z.array(z.string()).optional()
});

export const StylistQuerySchema = z.object({
  user_prompt: z.string().min(1, 'Prompt cannot be empty'),
  conversation_history: z
    .array(
      z.object({
        role: z.enum(['user', 'stylist']),
        content: z.string()
      })
    )
    .default([]),
  body_analysis: BodyAnalysisSchema.partial().optional(),
  current_vibe: AestheticVibeSchema.optional(),
  active_tryon_id: z.string().optional()
});

export const CheckoutPayloadSchema = z.object({
  garment_id: z.string().min(1),
  selected_size: z.string().min(1),
  payment_method: z.enum(['apple_pay', 'card', 'concierge_billing']),
  delivery_tier: z.enum(['same_day_courier', 'express_concierge', 'boutique_pickup']),
  shipping_address: z.string().min(5, 'Valid shipping address required'),
  customer_name: z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Valid email is required')
});

export const TasteProfileSchema = z.object({
  user_id: z.string().uuid().or(z.string().min(1)),
  aesthetic_vibe: AestheticVibeSchema,
  preferred_palettes: z.array(z.string()),
  favorite_designers: z.array(z.string()),
  sizes: z.object({
    top: z.string(),
    bottom: z.string(),
    footwear: z.string()
  }),
  upcoming_occasions: z
    .array(
      z.object({
        name: z.string(),
        date: z.string(),
        formality: z.string()
      })
    )
    .default([])
});
