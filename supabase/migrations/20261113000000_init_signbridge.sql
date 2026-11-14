-- ==============================================================================
-- SIGNBRIDGE AI — Database Schema Migration
-- Production PostgreSQL DDL with RLS, Triggers, Indexes & Auditing
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en-US',
    accessibility_settings JSONB NOT NULL DEFAULT '{
        "highContrast": false,
        "reducedMotion": false,
        "fontSize": "normal",
        "hapticFeedback": false,
        "screenReaderOptimized": false
    }'::jsonb,
    speech_settings JSONB NOT NULL DEFAULT '{
        "rate": 1.0,
        "pitch": 1.0,
        "volume": 1.0,
        "autoSpeak": false
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. USER ROLES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Helper function to check admin role safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$;

-- ==============================================================================
-- 3. ASL ALPHABET LIBRARY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.asl_alphabet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter CHAR(1) NOT NULL UNIQUE CHECK (letter BETWEEN 'A' AND 'Z'),
    description TEXT NOT NULL,
    gesture_type TEXT NOT NULL CHECK (gesture_type IN ('static', 'dynamic')),
    media_url TEXT,
    thumbnail_url TEXT,
    media_source TEXT,
    attribution TEXT,
    license_name TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    similar_letters TEXT[] DEFAULT '{}',
    practice_tips TEXT[] DEFAULT '{}',
    common_mistakes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. RECOGNITION SESSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.recognition_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('recognition', 'practice')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    total_predictions INTEGER NOT NULL DEFAULT 0,
    confirmed_predictions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. RECOGNITION EVENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.recognition_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.recognition_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    predicted_letter CHAR(1) CHECK (predicted_letter BETWEEN 'A' AND 'Z' OR predicted_letter IS NULL),
    confidence NUMERIC(5,4) CHECK (confidence >= 0 AND confidence <= 1),
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    corrected_letter CHAR(1) CHECK (corrected_letter BETWEEN 'A' AND 'Z' OR corrected_letter IS NULL),
    model_version TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. SAVED MESSAGES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.recognition_sessions(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    character_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. LEARNING PROGRESS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    letter CHAR(1) NOT NULL CHECK (letter BETWEEN 'A' AND 'Z'),
    attempts INTEGER NOT NULL DEFAULT 0,
    correct_attempts INTEGER NOT NULL DEFAULT 0,
    mastered BOOLEAN NOT NULL DEFAULT FALSE,
    last_practiced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, letter),
    CONSTRAINT chk_correct_attempts CHECK (correct_attempts <= attempts)
);

-- ==============================================================================
-- 8. MODEL REGISTRY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL UNIQUE,
    model_path TEXT NOT NULL,
    framework TEXT NOT NULL,
    supported_letters TEXT[] NOT NULL DEFAULT '{}',
    accuracy NUMERIC(6,5),
    evaluation_metadata JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. UPDATED_AT TRIGGER FUNCTION & ATTACHMENTS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_asl_alphabet_updated_at ON public.asl_alphabet;
CREATE TRIGGER trg_asl_alphabet_updated_at
    BEFORE UPDATE ON public.asl_alphabet
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_saved_messages_updated_at ON public.saved_messages;
CREATE TRIGGER trg_saved_messages_updated_at
    BEFORE UPDATE ON public.saved_messages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_learning_progress_updated_at ON public.learning_progress;
CREATE TRIGGER trg_learning_progress_updated_at
    BEFORE UPDATE ON public.learning_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'SignBridge User'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. INDEXES FOR QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_recognition_sessions_user_id ON public.recognition_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_recognition_events_user_id ON public.recognition_events(user_id);
CREATE INDEX IF NOT EXISTS idx_recognition_events_session_id ON public.recognition_events(session_id);
CREATE INDEX IF NOT EXISTS idx_saved_messages_user_id ON public.saved_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_messages_created_at ON public.saved_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_model_registry_active ON public.model_registry(active);
CREATE INDEX IF NOT EXISTS idx_asl_alphabet_letter ON public.asl_alphabet(letter);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asl_alphabet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_registry ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- USER ROLES POLICIES (Users can view their role; only admins or service role can modify)
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin());

-- RECOGNITION SESSIONS POLICIES
CREATE POLICY "Users can view own sessions"
    ON public.recognition_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
    ON public.recognition_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON public.recognition_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON public.recognition_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- RECOGNITION EVENTS POLICIES
CREATE POLICY "Users can view own recognition events"
    ON public.recognition_events FOR SELECT
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.recognition_sessions s
            WHERE s.id = session_id AND s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own recognition events"
    ON public.recognition_events FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.recognition_sessions s
            WHERE s.id = session_id AND s.user_id = auth.uid()
        )
    );

-- SAVED MESSAGES POLICIES
CREATE POLICY "Users can view own saved messages"
    ON public.saved_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
    ON public.saved_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
    ON public.saved_messages FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
    ON public.saved_messages FOR DELETE
    USING (auth.uid() = user_id);

-- LEARNING PROGRESS POLICIES
CREATE POLICY "Users can view own progress"
    ON public.learning_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create or update own progress"
    ON public.learning_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ASL ALPHABET POLICIES (Public/authenticated can view verified; admins manage)
CREATE POLICY "Everyone can view verified alphabet"
    ON public.asl_alphabet FOR SELECT
    USING (verified = TRUE OR public.is_admin());

CREATE POLICY "Only admins can modify alphabet"
    ON public.asl_alphabet FOR ALL
    USING (public.is_admin());

-- MODEL REGISTRY POLICIES
CREATE POLICY "Users can view active models"
    ON public.model_registry FOR SELECT
    USING (active = TRUE OR public.is_admin());

CREATE POLICY "Only admins can modify models"
    ON public.model_registry FOR ALL
    USING (public.is_admin());
