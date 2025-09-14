CREATE SCHEMA IF NOT EXISTS reservations;
-- ================================
-- RESERVATIONS
-- ================================
CREATE TABLE IF NOT EXISTS reservations.reservations (
    id SERIAL PRIMARY KEY,              -- INT autoincremental
    user_id UUID NOT NULL,              -- viene de Auth
    reservation_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, PENDING_PAYMENT
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- RESERVATION_SLOTS (intermedia)
-- ================================
CREATE TABLE IF NOT EXISTS reservations.reservation_slots (
    reservation_id INT NOT NULL REFERENCES reservations.reservations(id) ON DELETE CASCADE,
    slot_id INT NOT NULL REFERENCES facilities.slots(id) ON DELETE CASCADE,
    PRIMARY KEY (reservation_id, slot_id),
    UNIQUE (slot_id)   -- un slot no puede pertenecer a dos reservas distintas
);