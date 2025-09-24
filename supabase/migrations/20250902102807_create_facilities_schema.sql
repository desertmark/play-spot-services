CREATE SCHEMA IF NOT EXISTS "facilities";
-- ================================
-- ESTABLISHMENTS
-- ================================
CREATE TABLE IF NOT EXISTS "facilities"."establishments" (
    "id" SERIAL PRIMARY KEY,
    "ownerId" UUID NOT NULL,        -- usuario dueño (desde Auth/Profiles)
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "zipCode" VARCHAR(20),
    "tz" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ================================
-- UNITS (reservable spaces, courts, rooms, ...)
-- ================================
CREATE TABLE IF NOT EXISTS "facilities"."units" (
    "id" SERIAL PRIMARY KEY,
    "establishmentId" INT NOT NULL REFERENCES "facilities"."establishments"(id) ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,          -- ej: "Court 1", "Room A"
    "type" VARCHAR(100) NOT NULL,          -- ej: football, tennis, paddle, gym, yoga room
    "surfaceType" VARCHAR(100),           -- opcional, grass court, cement, parquet, ...
    "indoor" BOOLEAN DEFAULT FALSE,
    "capacity" INT,                         -- opcional
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ================================
-- SLOTS (possible reservable time slots for each unit, actual reservations are handled in the reservations schema)
-- ================================
CREATE TABLE IF NOT EXISTS "facilities"."slots" (
    "id" SERIAL PRIMARY KEY,
    "unitId" INT NOT NULL REFERENCES "facilities"."units"(id) ON DELETE CASCADE,
    "dayOfWeek" INT NOT NULL CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6), -- 0=sunday ... 6=saturday
    "openTime" TIME NOT NULL,
    "closeTime" TIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CHECK ("openTime" < "closeTime")
);

-- ================================
-- TRIGGERS for updatedAt
-- ================================
-- CREATE OR REPLACE FUNCTION update_updatedAt_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--    NEW.updatedAt = NOW();
--    RETURN NEW;
-- END;
-- $$ LANGUAGE 'plpgsql';

-- CREATE TRIGGER trg_establishments_updatedAt
-- BEFORE UPDATE ON facilities.establishments
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updatedAt_column();

-- CREATE TRIGGER trg_units_updatedAt
-- BEFORE UPDATE ON facilities.units
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updatedAt_column();

-- CREATE TRIGGER trg_slots_updatedAt
-- BEFORE UPDATE ON facilities.slots
-- FOR EACH ROW
-- EXECUTE FUNCTION update_updatedAt_column();

-- ================================
-- USEFUL INDEXES
-- ================================
-- CREATE INDEX idx_establishments_owner ON establishments(ownerId);
-- CREATE INDEX idx_establishments_zip ON establishments(zipCode);
-- CREATE INDEX idx_units_establishment ON units(establishmentId);
-- CREATE INDEX idx_slots_unit ON slots(unitId);
-- CREATE INDEX idx_slots_dayOfWeek ON slots(dayOfWeek);