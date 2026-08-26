-- ==============================================================================
-- LifeLink AI — PostgreSQL Database Schema for Neon PostgreSQL
-- Generated to match NestJS TypeORM Entities 100%
-- ==============================================================================

-- Enable UUID extension if not enabled (Neon supports gen_random_uuid out of the box)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT DEFAULT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone TEXT DEFAULT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, ADMIN
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, BANNED
    provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL', -- LOCAL, GOOGLE, BOTH
    google_id TEXT DEFAULT NULL,
    avatar TEXT DEFAULT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- ------------------------------------------------------------------------------
-- 2. MEDICAL PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(10) NOT NULL DEFAULT 'O+',
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    pre_existing_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_medications TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact_name TEXT DEFAULT NULL,
    emergency_contact_phone TEXT DEFAULT NULL,
    insurance_number TEXT DEFAULT NULL
);

-- ------------------------------------------------------------------------------
-- 3. CHAT SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Đoạn chat Y Tế',
    active_mode VARCHAR(100) NOT NULL DEFAULT 'triage_hospital',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- ------------------------------------------------------------------------------
-- 4. CHAT MESSAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL, -- 'user' | 'ai'
    text TEXT NOT NULL,
    image_url TEXT DEFAULT NULL,
    triage_result JSONB DEFAULT NULL,
    recommended_hospitals JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- ------------------------------------------------------------------------------
-- 5. HOSPITALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone VARCHAR(50) NOT NULL,
    is_emergency_247 BOOLEAN NOT NULL DEFAULT TRUE,
    specialties TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    accepts_insurance BOOLEAN NOT NULL DEFAULT TRUE,
    rating DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    user_ratings_total INTEGER NOT NULL DEFAULT 1000,
    image_url TEXT DEFAULT NULL,
    working_hours VARCHAR(255) NOT NULL DEFAULT 'Mở cửa 24/7'
);

-- ------------------------------------------------------------------------------
-- 6. FEEDBACKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. AUTH TOKENS TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    reset_session_token TEXT DEFAULT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- SEED DATA: INITIAL HOSPITALS (BÌNH THẠNH, HCMC)
-- ------------------------------------------------------------------------------
INSERT INTO hospitals (id, name, address, latitude, longitude, phone, is_emergency_247, specialties, accepts_insurance, rating, user_ratings_total, image_url, working_hours)
VALUES
('hosp-1', 'Bệnh viện Đa khoa Quốc tế Vinmec Central Park', '208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP.HCM', 10.7937, 106.7214, '02836221166', true, ARRAY['Cấp cứu', 'Tim mạch', 'Nhi khoa', 'Sản phụ khoa', 'Chấn thương chỉnh hình'], true, 4.9, 1280, 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7'),
('hosp-2', 'Bệnh viện Quận Bình Thạnh', '112 Đinh Tiên Hoàng, Phường 1, Bình Thạnh, TP.HCM', 10.7963, 106.6961, '02835108966', true, ARRAY['Cấp cứu 24/7', 'Nội tổng hợp', 'Ngoại khoa', 'Thần kinh', 'Tiêu hóa'], true, 4.5, 950, 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7'),
('hosp-3', 'Bệnh viện Nhân dân Gia Định', '1 Phan Đăng Lưu, Phường 3, Bình Thạnh, TP.HCM', 10.8014, 106.6937, '02838412697', true, ARRAY['Cấp cứu đột quỵ', 'Tim mạch can thiệp', 'Hồi sức tích cực', 'Ngoại lồng ngực'], true, 4.7, 2100, 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7'),
('hosp-4', 'Bệnh viện Ung Bướu TP.HCM (Cơ sở 1)', '3 Nơ Trang Long, Phường 7, Bình Thạnh, TP.HCM', 10.8049, 106.6953, '02838412637', false, ARRAY['Ung bướu', 'Phẫu thuật u u bướu', 'Hóa trị - Xạ trị', 'Tầm soát ung thư'], true, 4.6, 1850, 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80', '07:00 - 16:30 (Thứ 2 - Thứ 6)'),
('hosp-5', 'Bệnh viện Giao Thông Vận Tải TP.HCM', '136 Văn Cao, Phường 8, Bình Thạnh, TP.HCM', 10.8081, 106.7012, '02838992739', true, ARRAY['Cấp cứu', 'Đa khoa', 'Tai Mũi Họng', 'Mắt', 'Răng Hàm Mặt'], true, 4.4, 620, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7')
ON CONFLICT (id) DO NOTHING;
