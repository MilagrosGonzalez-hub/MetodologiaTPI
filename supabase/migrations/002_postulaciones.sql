-- ============================================================
-- EDUCAR PARA TRANSFORMAR — Postulaciones (Empleo)
-- ============================================================

CREATE TABLE IF NOT EXISTS postulaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    puesto VARCHAR(120) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'REVISADO', 'CONTACTADO', 'DESCARTADO')),
    fecha_postulacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX IF NOT EXISTS idx_postulaciones_fecha ON postulaciones(fecha_postulacion DESC);

ALTER TABLE postulaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Postulaciones publicas insert" ON postulaciones
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo directores ven postulaciones" ON postulaciones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles p
            JOIN roles r ON p.rol_id = r.id
            WHERE p.user_id = auth.uid() AND r.nombre = 'DIRECTOR'
        )
    );

CREATE POLICY "Solo directores actualizan postulaciones" ON postulaciones
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM perfiles p
            JOIN roles r ON p.rol_id = r.id
            WHERE p.user_id = auth.uid() AND r.nombre = 'DIRECTOR'
        )
    );

GRANT INSERT ON postulaciones TO anon;
GRANT ALL ON postulaciones TO authenticated;
