import {
  GarmentItem,
  BodyAnalysisResult,
  StylistMessage,
  CheckoutPayload,
  OrderRecord,
  MerchantAnalytics
} from '@signbridge/shared-types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body?.error?.message || body?.error || 'API Request Failed');
  }
  return body.data as T;
}

export const api = {
  async getCatalog(filter?: { category?: string; vibe?: string; featured?: boolean }): Promise<GarmentItem[]> {
    const params = new URLSearchParams();
    if (filter?.category) params.set('category', filter.category);
    if (filter?.vibe) params.set('vibe', filter.vibe);
    if (filter?.featured !== undefined) params.set('featured', String(filter.featured));

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<GarmentItem[]>(`${API_BASE}/catalog${query}`);
  },

  async getGarment(id: string): Promise<GarmentItem> {
    return fetchJson<GarmentItem>(`${API_BASE}/catalog/${id}`);
  },

  async consultStylist(payload: {
    user_prompt: string;
    conversation_history?: Array<{ role: 'user' | 'stylist'; content: string }>;
    body_analysis?: Partial<BodyAnalysisResult>;
    current_vibe?: string;
    active_tryon_id?: string;
  }): Promise<StylistMessage> {
    return fetchJson<StylistMessage>(`${API_BASE}/stylist/consult`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async submitBodyScan(scan: BodyAnalysisResult): Promise<BodyAnalysisResult> {
    return fetchJson<BodyAnalysisResult>(`${API_BASE}/stylist/scan-body`, {
      method: 'POST',
      body: JSON.stringify(scan)
    });
  },

  async checkout(payload: CheckoutPayload): Promise<OrderRecord> {
    return fetchJson<OrderRecord>(`${API_BASE}/commerce/checkout`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getOrders(): Promise<OrderRecord[]> {
    return fetchJson<OrderRecord[]>(`${API_BASE}/commerce/orders`);
  },

  async getMerchantAnalytics(): Promise<MerchantAnalytics> {
    return fetchJson<MerchantAnalytics>(`${API_BASE}/merchant/analytics`);
  }
};
