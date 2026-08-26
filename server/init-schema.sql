-- LifeLink AI - PostgreSQL Complete Database Schema & Seed Data
-- Environment: PostgreSQL 16+

-- 1. Create Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Table: USERS (Auth & Role RBAC)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'USER', -- 'ADMIN' | 'USER'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Table: MEDICAL_PROFILES (1-to-1 with User)
CREATE TABLE IF NOT EXISTS medical_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(10) DEFAULT 'O+',
    allergies TEXT DEFAULT 'Penicillin, Hải sản cá biển',
    pre_existing_conditions TEXT DEFAULT 'Huyết áp cao nhẹ, Tiểu đường type 2',
    current_medications TEXT DEFAULT 'Metformin 500mg, Amlodipine 5mg',
    emergency_contact_name VARCHAR(255) DEFAULT 'Nguyễn Văn B (Anh ruột)',
    emergency_contact_phone VARCHAR(50) DEFAULT '0908 123 456',
    insurance_number VARCHAR(100) DEFAULT 'DN4791234567890'
);

-- 4. Create Table: CHAT_SESSIONS (User Chat Threads)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Đoạn chat Y Tế',
    active_mode VARCHAR(50) DEFAULT 'triage_hospital', -- 'triage_hospital' | 'analyze_symptom' | 'first_aid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Table: CHAT_MESSAGES (AI Context History - Stores last 5 turns)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    session_id VARCHAR(36) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL, -- 'user' | 'ai'
    text TEXT NOT NULL,
    image_url TEXT,
    triage_result JSONB,
    recommended_hospitals JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Table: HOSPITALS (Bình Thạnh Hospitals Dataset)
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone VARCHAR(50) NOT NULL,
    is_emergency_247 BOOLEAN DEFAULT TRUE,
    specialties TEXT NOT NULL,
    accepts_insurance BOOLEAN DEFAULT TRUE,
    rating DOUBLE PRECISION DEFAULT 4.8,
    user_ratings_total INT DEFAULT 1000,
    image_url TEXT,
    working_hours VARCHAR(255) DEFAULT 'Mở cửa 24/7'
);

-- 7. Create Table: FEEDBACKS (Feature Requests & Support)
CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SEED DATA INSERTION (Bình Thạnh Hospitals & Default Accounts)
-- =========================================================

-- Seed Default Admin & User (Password: "123456" hashed with bcrypt)
INSERT INTO users (id, email, password, full_name, phone, role) VALUES
('usr-admin-01', 'admin@lifelink.ai', '$2b$10$E9V96Z160t4R8k6dGkZ1e.a6qK6o0kM7/51Ywz4u2e3H1y4K5m1Gy', 'Quản Trị Viên LifeLink', '0900000000', 'ADMIN'),
('usr-patient-01', 'user@lifelink.ai', '$2b$10$E9V96Z160t4R8k6dGkZ1e.a6qK6o0kM7/51Ywz4u2e3H1y4K5m1Gy', 'Bệnh Nhân Nguyễn Văn A', '0901234567', 'USER')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Medical Profile for User
INSERT INTO medical_profiles (id, user_id, blood_type, allergies, pre_existing_conditions, current_medications, emergency_contact_name, emergency_contact_phone, insurance_number) VALUES
('med-prof-01', 'usr-patient-01', 'O+', 'Penicillin, Hải sản cá biển', 'Huyết áp cao nhẹ, Tiểu đường type 2', 'Metformin 500mg, Amlodipine 5mg', 'Nguyễn Văn B (Anh ruột)', '0908 123 456', 'DN4791234567890')
ON CONFLICT (id) DO NOTHING;

-- Seed 8 Hospitals in Bình Thạnh District
INSERT INTO hospitals (id, name, address, latitude, longitude, phone, is_emergency_247, specialties, accepts_insurance, rating, user_ratings_total, image_url, working_hours) VALUES
('hosp-giadinh', 'Bệnh viện Nhân dân Gia Định', 'Số 01 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.802778, 106.694722, '028 3841 2697', true, 'Cấp cứu, Tim mạch, Đột quỵ, Chấn thương chỉnh hình, Nội tổng hợp, Tiêu hóa', true, 4.8, 12800, 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7 (Khoa Cấp cứu)'),
('hosp-vinmec-cpr', 'Bệnh viện Đa khoa Quốc tế Vinmec Central Park', '208 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.793264, 106.720815, '028 3622 1166', true, 'Tim mạch, Cấp cứu 24/7, Sản phụ khoa, Nhi khoa, Ung bướu, Đột quỵ', false, 4.9, 4200, 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7'),
('hosp-ungbuou-bt', 'Bệnh viện Ung Bướu TP.HCM (Cơ sở 1)', 'Số 03 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.803512, 106.695248, '028 3843 3022', true, 'Ung bướu, Tầm soát ung thư, Cấp cứu, Phẫu thuật U bướu, Hóa trị - Xạ trị', true, 4.7, 9600, 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7 (Cấp cứu Ung bướu)'),
('hosp-quan-binhthanh', 'Bệnh viện Quận Bình Thạnh', '112 Bùi Hữu Nghĩa, Phường 1, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.796541, 106.696839, '028 3510 8966', true, 'Đa khoa, Cấp cứu 24/7, Nội khoa, Nhi khoa, Tai Mũi Họng, Cơ xương khớp', true, 4.6, 5400, 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7'),
('hosp-giaothongvantai', 'Bệnh viện Giao Thông Vận Tải TP.HCM', '136 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.817235, 106.711542, '028 3553 0303', true, 'Cấp cứu, Ngoại chấn thương, Khám tổng quát, Y học cổ truyền, Nội soi', true, 4.5, 3100, 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80', 'Mở cửa 24/7'),
('hosp-ttyte-binhthanh-1', 'Trung tâm Y tế Quận Bình Thạnh (Cơ sở 1)', '99 Văn Cao, Phường 14, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.808215, 106.698532, '028 3551 2307', true, 'Y tế dự phòng, Khám sức khỏe, Tiêm chủng, Nội khoa, Nhi khoa', true, 4.5, 2200, NULL, '07:30 - 17:00 (Cấp cứu trực 24/7)'),
('hosp-ttyte-binhthanh-2', 'Trung tâm Y tế Quận Bình Thạnh (Cơ sở Vũ Tùng)', '04 Vũ Tùng, Phường 2, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.798214, 106.696125, '028 3841 2308', true, 'Y tế cộng đồng, Cấp cứu ban đầu, Khám Nội, Nhi khoa', true, 4.4, 1800, NULL, '07:30 - 17:00 (Cấp cứu trực 24/7)'),
('hosp-pkdk-binhthanh', 'Phòng khám Đa khoa Quốc tế Bình Thạnh', '364 Điện Biên Phủ, Phường 17, Quận Bình Thạnh, TP. Hồ Chí Minh', 10.797825, 106.708912, '028 3514 1122', true, 'Đa khoa, Cấp cứu 24/7, Nhi khoa, Tai Mũi Họng, Xét nghiệm', true, 4.6, 2900, NULL, 'Mở cửa 24/7')
ON CONFLICT (id) DO NOTHING;
