import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../apps/server/src/app.js';

describe('AURA AI — REST API Integration Suite', () => {
  it('GET /api/health should return operational status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toContain('AURA AI');
    expect(res.body.data.version).toBe('2.0.0');
  });

  it('GET /api/v1/catalog should return curated luxury collection', async () => {
    const res = await request(app).get('/api/v1/catalog');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('price');
    expect(res.body.data[0]).toHaveProperty('designer');
  });

  it('GET /api/v1/catalog/garment-001 should return tuxedo jacket', async () => {
    const res = await request(app).get('/api/v1/catalog/garment-001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('garment-001');
    expect(res.body.data.price).toBe(2650);
  });

  it('POST /api/v1/stylist/consult should provide luxury fashion dialogue', async () => {
    const res = await request(app)
      .post('/api/v1/stylist/consult')
      .send({
        user_prompt: 'I need an evening jacket for a black-tie gallery opening in Soho',
        body_analysis: {
          estimated_size: 'M',
          skin_undertone: 'neutral_olive',
          silhouette: 'broad_shouldered'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sender).toBe('stylist');
    expect(typeof res.body.data.text).toBe('string');
    expect(res.body.data.text.length).toBeGreaterThan(20);
    expect(Array.isArray(res.body.data.recommended_garments)).toBe(true);
  });

  it('POST /api/v1/stylist/scan-body should record 3D biometric scan', async () => {
    const res = await request(app)
      .post('/api/v1/stylist/scan-body')
      .send({
        detected: true,
        shoulder_width_cm: 46.2,
        chest_waist_ratio: 1.28,
        estimated_size: 'M',
        confidence: 0.98,
        silhouette: 'broad_shouldered',
        skin_undertone: 'warm_golden',
        lighting_kelvin: 3200
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estimated_size).toBe('M');
  });

  it('POST /api/v1/commerce/checkout should execute autonomous order dispatch', async () => {
    const res = await request(app)
      .post('/api/v1/commerce/checkout')
      .send({
        garment_id: 'garment-001',
        selected_size: 'M',
        payment_method: 'apple_pay',
        delivery_tier: 'same_day_courier',
        shipping_address: '450 West 14th St, Penthouse B, Soho, New York, NY',
        customer_name: 'Sophia Vance',
        customer_email: 'sophia.vance@soho-private.com'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('tracking_code');
    expect(res.body.data.tracking_code).toContain('AURA-VIP-');
    expect(res.body.data.status).toBe('dispatched');
  });

  it('GET /api/v1/commerce/orders should return order history', async () => {
    const res = await request(app).get('/api/v1/commerce/orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/merchant/analytics should return CX return reduction metrics', async () => {
    const res = await request(app).get('/api/v1/merchant/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.return_rate_reduction).toBeGreaterThan(80);
    expect(res.body.data.conversion_lift_multiplier).toBeGreaterThan(3);
    expect(Array.isArray(res.body.data.top_silhouette_demand)).toBe(true);
  });
});
