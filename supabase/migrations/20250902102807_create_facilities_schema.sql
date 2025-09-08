CREATE SCHEMA IF NOT EXISTS facilities;
-- ================================
-- ESTABLISHMENTS
-- ================================
CREATE TABLE IF NOT EXISTS facilities.establishments (
    id SERIAL PRIMARY KEY,
    owner_id UUID NOT NULL,        -- usuario dueño (desde Auth/Profiles)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    tz TEXT NOT NULL DEFAULT 'Europe/Madrid',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- UNITS (reservable spaces, courts, rooms, ...)
-- ================================
CREATE TABLE IF NOT EXISTS facilities.units (
    id SERIAL PRIMARY KEY,
    establishment_id INT NOT NULL REFERENCES facilities.establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,          -- ej: "Court 1", "Room A"
    type VARCHAR(100) NOT NULL,          -- ej: football, tennis, paddle, gym, yoga room
    surface_type VARCHAR(100),           -- opcional, grass court, cement, parquet, ...
    indoor BOOLEAN DEFAULT FALSE,
    capacity INT,                         -- opcional
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- SLOTS (possible reservable time slots for each unit, actual reservations are handled in the reservations schema)
-- ================================
CREATE TABLE IF NOT EXISTS facilities.slots (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES facilities.units(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=sunday ... 6=saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CHECK (open_time < close_time)
);

-- ================================
-- TRIGGERS for updated_at
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_establishments_updated_at
BEFORE UPDATE ON facilities.establishments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_units_updated_at
BEFORE UPDATE ON facilities.units
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_slots_updated_at
BEFORE UPDATE ON facilities.slots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- USEFUL INDEXES
-- ================================
-- CREATE INDEX idx_establishments_owner ON establishments(owner_id);
-- CREATE INDEX idx_establishments_zip ON establishments(zip_code);
-- CREATE INDEX idx_units_establishment ON units(establishment_id);
-- CREATE INDEX idx_slots_unit ON slots(unit_id);
-- CREATE INDEX idx_slots_day_of_week ON slots(day_of_week);