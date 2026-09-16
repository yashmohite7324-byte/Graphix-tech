-- =============================================================
-- V9__seed_companies_and_recruiters.sql
-- Seeds all 10 real companies from the institute Excel data
-- Each company gets a login account + recruiter profile
-- Default password for all: Company@1234 (BCrypt hash below)
-- =============================================================

-- Insert 10 Companies
INSERT INTO companies (name, industry, headquarters, verification_status, approved_at) VALUES
('LOGICA ENGINEERING & MANUFACTURING INDIA PVT. LTD.', 'Engineering & Manufacturing', 'Bhosari, Pune', 'APPROVED', NOW()),
('Manjushree fab', 'Fabrication & Manufacturing', 'Bhosari, Pune', 'APPROVED', NOW()),
('Avamdharma Consulting Solutions Pvt Ltd', 'IT Consulting', 'Pune', 'APPROVED', NOW()),
('Powermech', 'Engineering', 'Mumbai', 'APPROVED', NOW()),
('Buildnest', 'Construction & Real Estate', 'Bangalore', 'APPROVED', NOW()),
('KD Architecture and Structure', 'Architecture', 'Pune', 'APPROVED', NOW()),
('Grey Space Computing', 'IT / Software', 'Kodhwa, Pune', 'APPROVED', NOW()),
('ULTRA PRECISION INDUSTRIES', 'Manufacturing', 'Bhosari, Pune', 'APPROVED', NOW()),
('Sai Nath Engineering', 'Engineering', 'Kharadi, Pune', 'APPROVED', NOW()),
('ULC Plast', 'Plastics & Manufacturing', 'Bhosari, Pune', 'APPROVED', NOW())
ON CONFLICT DO NOTHING;

-- Insert Recruiter User Accounts (password = Company@1234)
-- BCrypt hash of 'Company@1234':
-- $2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG

INSERT INTO users (email, mobile, password_hash, role, status) VALUES
('hr@logicaengineering.com',    '9800000001', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('hr@manjushreefab.com',        '9800000002', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('cto@avamdharma.com',          '9800000003', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('hr@powermech.com',            '9800000004', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('ceo@buildnest.com',           '9800000005', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('hr@kdarchitecture.com',       '9800000006', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('hr@greyspacecomputing.com',   '9800000007', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('ceo@ultraprecision.com',      '9800000008', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('hr@sainathengineering.com',   '9800000009', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE'),
('hr@ulcplast.com',             '9800000010', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOe7v2pxN3lYzXKFpVT6NKvmWr9Hg5JKG', 'RECRUITER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Link Recruiter Users to Companies with their Designations
INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Logica HR Team', 'HR Executive'
FROM users u, companies c WHERE u.email='hr@logicaengineering.com' AND c.name LIKE 'LOGICA%' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Manjushree HR', 'HR Executive'
FROM users u, companies c WHERE u.email='hr@manjushreefab.com' AND c.name='Manjushree fab' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Avamdharma CTO', 'Chief Technology Officer'
FROM users u, companies c WHERE u.email='cto@avamdharma.com' AND c.name LIKE 'Avamdharma%' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Powermech HR', 'HR Executive'
FROM users u, companies c WHERE u.email='hr@powermech.com' AND c.name='Powermech' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Buildnest CEO', 'CEO'
FROM users u, companies c WHERE u.email='ceo@buildnest.com' AND c.name='Buildnest' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'KD Architecture HR', 'HR Executive'
FROM users u, companies c WHERE u.email='hr@kdarchitecture.com' AND c.name LIKE 'KD Arch%' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Grey Space HR', 'HR Generalist'
FROM users u, companies c WHERE u.email='hr@greyspacecomputing.com' AND c.name LIKE 'Grey Space%' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Ultra Precision CEO', 'CEO'
FROM users u, companies c WHERE u.email='ceo@ultraprecision.com' AND c.name LIKE 'ULTRA%' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'Sai Nath HR', 'HR Executive'
FROM users u, companies c WHERE u.email='hr@sainathengineering.com' AND c.name LIKE 'Sai%' LIMIT 1;

INSERT INTO recruiter_profiles (user_id, company_id, full_name, designation)
SELECT u.id, c.id, 'ULC Plast HR', 'HR Executive'
FROM users u, companies c WHERE u.email='hr@ulcplast.com' AND c.name='ULC Plast' LIMIT 1;

-- Audit log
INSERT INTO audit_logs (actor_email, action, entity_name, entity_id, details)
VALUES ('system', 'COMPANIES_SEEDED', 'Company', 'BULK',
        '10 companies seeded from Graphix Institute Excel data with recruiter accounts');
