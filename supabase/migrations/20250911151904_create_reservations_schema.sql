CREATE SCHEMA IF NOT EXISTS "reservations";
-- ================================
-- RESERVATIONS
-- ================================
CREATE TABLE IF NOT EXISTS "reservations"."reservations" (
    "id" SERIAL PRIMARY KEY,              -- INT autoincremental
    "userId" UUID NOT NULL,               -- viene de Auth
    "reservationDate" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, PENDING_PAYMENT
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ================================
-- RESERVATION_SLOTS (intermedia)
-- ================================
CREATE TABLE IF NOT EXISTS "reservations"."reservationSlots" (
    "reservationId" INT NOT NULL REFERENCES "reservations"."reservations"(id) ON DELETE CASCADE,
    "slotId" INT NOT NULL REFERENCES "facilities"."slots"(id) ON DELETE CASCADE,
    PRIMARY KEY ("reservationId", "slotId")
);