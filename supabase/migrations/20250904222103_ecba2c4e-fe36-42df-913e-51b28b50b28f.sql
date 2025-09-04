-- Create sample users and profiles for demonstration
-- Note: These are example users with demo passwords

-- Insert sample admin user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@fretefacil.com',
    '$2a$10$rgl8KbXfxVr8E3Yh5DXPU.wO5yfPaQ2h8zLCRk5WTf1YhSY5k/Om6', -- password: admin123
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador Sistema", "role": "admin"}',
    false,
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample client user  
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'cliente@fretefacil.com',
    '$2a$10$rgl8KbXfxVr8E3Yh5DXPU.wO5yfPaQ2h8zLCRk5WTf1YhSY5k/Om6', -- password: cliente123
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "João Cliente", "role": "client"}',
    false,
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample carrier user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    role,
    aud
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'freteiro@fretefacil.com',
    '$2a$10$rgl8KbXfxVr8E3Yh5DXPU.wO5yfPaQ2h8zLCRk5WTf1YhSY5k/Om6', -- password: freteiro123
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Carlos Freteiro", "role": "carrier"}',
    false,
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profiles
INSERT INTO public.profiles (id, user_id, full_name, role, phone) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Administrador Sistema', 'admin', '(11) 99999-0001')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, user_id, full_name, role, phone) VALUES
    ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'João Cliente', 'client', '(11) 99999-0002')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.profiles (id, user_id, full_name, role, phone) VALUES
    ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Carlos Freteiro', 'carrier', '(11) 99999-0003')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample carrier data
INSERT INTO public.carriers (id, user_id, vehicle_type, vehicle_plate, driver_license, rating, is_active) VALUES
    ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Caminhão Toco', 'FRE-1234', '12345678901', 4.8, true)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample locations
INSERT INTO public.locations (id, name, address, city, state, zip_code, latitude, longitude, is_active) VALUES
    ('55555555-5555-5555-5555-555555555555', 'Centro de São Paulo', 'Praça da Sé, 1', 'São Paulo', 'SP', '01001-000', -23.5505, -46.6333, true),
    ('66666666-6666-6666-6666-666666666666', 'Centro de Campinas', 'Largo do Rosário, 1', 'Campinas', 'SP', '13010-100', -22.9056, -47.0608, true),
    ('77777777-7777-7777-7777-777777777777', 'Centro de Santos', 'Praça Mauá, 1', 'Santos', 'SP', '11010-900', -23.9395, -46.3293, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample routes
INSERT INTO public.routes (id, origin_id, destination_id, distance_km, estimated_time_hours, base_price, price_per_kg, is_active) VALUES
    ('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 95, 1.5, 150.00, 2.50, true),
    ('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 65, 1.2, 120.00, 3.00, true)
ON CONFLICT (id) DO NOTHING;