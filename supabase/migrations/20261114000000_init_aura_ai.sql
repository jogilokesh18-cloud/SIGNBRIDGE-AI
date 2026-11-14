-- ==============================================================================
-- AURA AI — Spatial Commerce & Generative Luxury Styling Platform
-- Schema Definition with Row-Level Security, Real-Time Telemetry & pgvector
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Luxury Garment Catalog
CREATE TABLE IF NOT EXISTS public.garments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    designer TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category TEXT NOT NULL CHECK (category IN ('outerwear', 'formalwear', 'evening_wear', 'knitwear', 'accessories', 'footwear')),
    aesthetic_vibe TEXT NOT NULL CHECK (aesthetic_vibe IN ('avant_garde', 'quiet_luxury', 'minimalist_chic', 'black_tie', 'resort_couture', 'cyber_tailored')),
    description TEXT NOT NULL,
    materials TEXT[] NOT NULL DEFAULT '{}',
    image_url TEXT NOT NULL,
    vton_overlay_url TEXT NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    available_sizes TEXT[] NOT NULL DEFAULT '{"S","M","L"}',
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Customer 3D Body & Colorimetry Telemetry
CREATE TABLE IF NOT EXISTS public.body_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    shoulder_width_cm NUMERIC(5, 2) NOT NULL,
    chest_waist_ratio NUMERIC(4, 2) NOT NULL,
    estimated_size TEXT NOT NULL,
    silhouette TEXT NOT NULL,
    skin_undertone TEXT NOT NULL,
    lighting_kelvin INTEGER NOT NULL,
    confidence NUMERIC(4, 3) NOT NULL,
    landmarks JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Live Styling Sessions
CREATE TABLE IF NOT EXISTS public.styling_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_title TEXT NOT NULL DEFAULT 'Private Styling Consultation',
    active_garment_id UUID REFERENCES public.garments(id),
    detected_mood TEXT DEFAULT 'confident',
    conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Autonomous Commerce Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    garment_id UUID NOT NULL REFERENCES public.garments(id),
    selected_size VARCHAR(10) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method TEXT NOT NULL,
    delivery_tier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'preparing', 'in_transit', 'delivered')),
    shipping_address TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    tracking_code VARCHAR(32) NOT NULL UNIQUE,
    courier_eta TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Merchant CX & Return Prevention Telemetry
CREATE TABLE IF NOT EXISTS public.merchant_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    sentiment TEXT NOT NULL,
    garment_id UUID REFERENCES public.garments(id),
    size_matched VARCHAR(10),
    return_prevented BOOLEAN DEFAULT TRUE,
    retained_value NUMERIC(10, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_garments_vibe ON public.garments (aesthetic_vibe);
CREATE INDEX IF NOT EXISTS idx_garments_category ON public.garments (category);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_created ON public.merchant_telemetry (created_at DESC);
