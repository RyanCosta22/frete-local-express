-- Create sample data for demonstration with correct UUIDs
-- Insert sample locations
INSERT INTO public.locations (id, name, address, city, state, zip_code, latitude, longitude, is_active) VALUES
    ('55555555-5555-5555-5555-555555555555', 'Centro de São Paulo', 'Praça da Sé, 1', 'São Paulo', 'SP', '01001-000', -23.5505, -46.6333, true),
    ('66666666-6666-6666-6666-666666666666', 'Centro de Campinas', 'Largo do Rosário, 1', 'Campinas', 'SP', '13010-100', -22.9056, -47.0608, true),
    ('77777777-7777-7777-7777-777777777777', 'Centro de Santos', 'Praça Mauá, 1', 'Santos', 'SP', '11010-900', -23.9395, -46.3293, true),
    ('88888888-8888-8888-8888-888888888888', 'Aeroporto de Guarulhos', 'Rod. Hélio Smidt, s/n', 'Guarulhos', 'SP', '07190-100', -23.4324, -46.4695, true),
    ('99999999-9999-9999-9999-999999999999', 'Porto de Santos', 'Av. Cândido Gaffrée, 1', 'Santos', 'SP', '11013-160', -23.9616, -46.3052, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample routes
INSERT INTO public.routes (id, origin_id, destination_id, distance_km, estimated_time_hours, base_price, price_per_kg, is_active) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 95, 1.5, 150.00, 2.50, true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 65, 1.2, 120.00, 3.00, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 25, 0.5, 80.00, 4.00, true),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999', 5, 0.2, 50.00, 5.00, true)
ON CONFLICT (id) DO NOTHING;