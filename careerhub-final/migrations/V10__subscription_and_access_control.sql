-- =============================================================
-- V10__subscription_and_access_control.sql
-- Subscription plans, student access tiers, payment records
-- =============================================================

-- ─── Subscription Plans ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    price_rs    DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    features    TEXT,    -- JSON array of feature strings
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ─── Student Access Tiers ─────────────────────────────────────
-- GRAPHIX_STUDENT = free (enrolled at institute)
-- EXTERNAL_PAID   = outside student, paid ₹1099
CREATE TABLE IF NOT EXISTS student_access (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    access_tier         VARCHAR(50) NOT NULL DEFAULT 'EXTERNAL_PENDING'
                        CHECK (access_tier IN ('GRAPHIX_STUDENT','EXTERNAL_PAID','EXTERNAL_PENDING')),
    plan_id             BIGINT REFERENCES subscription_plans(id),
    payment_status      VARCHAR(50) DEFAULT 'FREE'
                        CHECK (payment_status IN ('FREE','PENDING','PAID','FAILED','REFUNDED')),
    payment_reference   VARCHAR(255),
    payment_method      VARCHAR(100),
    amount_paid         DECIMAL(10,2),
    access_valid_from   TIMESTAMP,
    access_valid_until  TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_access_student  ON student_access(student_id);
CREATE INDEX IF NOT EXISTS idx_access_tier     ON student_access(access_tier);
CREATE INDEX IF NOT EXISTS idx_access_payment  ON student_access(payment_status);

-- ─── Payment Transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_transactions (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES student_profiles(id),
    plan_id             BIGINT REFERENCES subscription_plans(id),
    amount_rs           DECIMAL(10,2) NOT NULL,
    currency            VARCHAR(10) DEFAULT 'INR',
    payment_gateway     VARCHAR(50),   -- RAZORPAY, PAYU, MANUAL
    gateway_order_id    VARCHAR(255),
    gateway_payment_id  VARCHAR(255),
    status              VARCHAR(50) NOT NULL DEFAULT 'CREATED'
                        CHECK (status IN ('CREATED','PENDING','SUCCESS','FAILED','REFUNDED')),
    failure_reason      TEXT,
    initiated_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_student ON payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status  ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payment_transactions(gateway_payment_id);

-- ─── Seed Plans ───────────────────────────────────────────────
INSERT INTO subscription_plans (name, price_rs, duration_days, description, features) VALUES
('Graphix Institute Student', 0.00, 99999,
 'Free lifetime access for enrolled Graphix Technologies Institute students',
 '["Full job portal access","Apply to all company jobs","Training programs","Resume scoring","Interview scheduling","Placement support","Career guidance"]'),
('External Student Plan', 1099.00, 365,
 'Full platform access for students outside Graphix Technologies Institute',
 '["Full job portal access","Apply to all company jobs","Resume scoring","Job recommendations","Application tracking","1 year validity"]')
ON CONFLICT DO NOTHING;

-- Trigger
CREATE TRIGGER student_access_updated_at
    BEFORE UPDATE ON student_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
