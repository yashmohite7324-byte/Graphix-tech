-- =============================================================
-- V11__seed_10_graphix_students.sql
-- 10 real-looking Graphix Technologies Institute student accounts
-- All get GRAPHIX_STUDENT tier (free access)
-- Default password: Student@1234
-- BCrypt: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a
-- =============================================================

-- Insert 10 student user accounts
INSERT INTO users (email, mobile, password_hash, role, status) VALUES
('aditya.sharma@graphix.edu',   '9876540001', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('priya.patel@graphix.edu',     '9876540002', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('rohan.mehta@graphix.edu',     '9876540003', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('sneha.kulkarni@graphix.edu',  '9876540004', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('arjun.nair@graphix.edu',      '9876540005', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('kavya.reddy@graphix.edu',     '9876540006', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('dev.singh@graphix.edu',       '9876540007', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('ananya.joshi@graphix.edu',    '9876540008', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('vishal.desai@graphix.edu',    '9876540009', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE'),
('pooja.iyer@graphix.edu',      '9876540010', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HqttskZjklHN4rPMJeS5a', 'STUDENT', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Insert student profiles
INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Aditya Sharma', 'GT2024CSE001', 'CSE', 2026, 8.5, 0
FROM users u WHERE u.email = 'aditya.sharma@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Priya Patel', 'GT2024IT001', 'IT', 2026, 7.9, 0
FROM users u WHERE u.email = 'priya.patel@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Rohan Mehta', 'GT2024CSE002', 'CSE', 2026, 8.1, 0
FROM users u WHERE u.email = 'rohan.mehta@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Sneha Kulkarni', 'GT2024MECH001', 'MECH', 2026, 7.5, 1
FROM users u WHERE u.email = 'sneha.kulkarni@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Arjun Nair', 'GT2024ECE001', 'ECE', 2026, 8.8, 0
FROM users u WHERE u.email = 'arjun.nair@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Kavya Reddy', 'GT2024CSE003', 'CSE', 2026, 9.1, 0
FROM users u WHERE u.email = 'kavya.reddy@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Dev Singh', 'GT2024IT002', 'IT', 2026, 7.2, 0
FROM users u WHERE u.email = 'dev.singh@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Ananya Joshi', 'GT2024CSE004', 'CSE', 2025, 8.3, 0
FROM users u WHERE u.email = 'ananya.joshi@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Vishal Desai', 'GT2024MECH002', 'MECH', 2026, 6.9, 2
FROM users u WHERE u.email = 'vishal.desai@graphix.edu' ON CONFLICT DO NOTHING;

INSERT INTO student_profiles (user_id, full_name, roll_number, branch, batch_year, cgpa, backlog_count)
SELECT u.id, 'Pooja Iyer', 'GT2024ECE002', 'ECE', 2026, 8.6, 0
FROM users u WHERE u.email = 'pooja.iyer@graphix.edu' ON CONFLICT DO NOTHING;

-- Give all 10 Graphix students FREE access (GRAPHIX_STUDENT tier)
INSERT INTO student_access (student_id, access_tier, payment_status, plan_id, access_valid_from, access_valid_until)
SELECT sp.id, 'GRAPHIX_STUDENT', 'FREE',
       (SELECT id FROM subscription_plans WHERE price_rs = 0 LIMIT 1),
       NOW(), NOW() + INTERVAL '10 years'
FROM student_profiles sp
JOIN users u ON sp.user_id = u.id
WHERE u.email LIKE '%@graphix.edu'
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO audit_logs (actor_email, action, entity_name, details)
VALUES ('system', 'STUDENTS_SEEDED', 'StudentProfile', '10 Graphix Institute students created with free access');
