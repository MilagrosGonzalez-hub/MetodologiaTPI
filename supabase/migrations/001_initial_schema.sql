-- ============================================================
-- EDUCAR PARA TRANSFORMAR — Migración Inicial
-- Sistema de Gestión Educativa LAMA (UTN-FRRE)
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. ROLES DE USUARIO
-- ================================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
    -- 'DIRECTOR', 'DOCENTE', 'PADRE', 'ESTUDIANTE', 'PERSONAL'
);

-- Seed roles
INSERT INTO roles (nombre) VALUES
    ('DIRECTOR'), ('DOCENTE'), ('PADRE'), ('ESTUDIANTE'), ('PERSONAL')
ON CONFLICT (nombre) DO NOTHING;

-- ================================================================
-- 2. PERFILES (Legajos)
-- ================================================================
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
    rol_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    legajo_nro VARCHAR(50) UNIQUE,
    fecha_nacimiento DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 3. NIVELES EDUCATIVOS
-- ================================================================
CREATE TABLE IF NOT EXISTS niveles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

INSERT INTO niveles (nombre) VALUES ('INICIAL'), ('PRIMARIO'), ('SECUNDARIO')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 4. ACTIVIDADES (Materias, Deportes, Talleres)
-- ================================================================
CREATE TABLE IF NOT EXISTS actividades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('CURRICULAR', 'DEPORTE', 'TALLER')),
    cupo_maximo INTEGER DEFAULT 30 CHECK (cupo_maximo > 0),
    nivel_id INTEGER REFERENCES niveles(id) ON DELETE SET NULL
);

-- Seed actividades deportivas
INSERT INTO actividades (nombre, tipo, cupo_maximo) VALUES
    ('Fútbol', 'DEPORTE', 25),
    ('Natación', 'DEPORTE', 20),
    ('Atletismo', 'DEPORTE', 30),
    ('Artes Marciales', 'DEPORTE', 20),
    ('Vóley', 'DEPORTE', 18),
    ('Danza', 'TALLER', 25),
    ('Básquet', 'DEPORTE', 20),
    ('Ajedrez', 'TALLER', 30),
    ('Laboratorio de Ciencias', 'CURRICULAR', 25),
    ('Inglés Avanzado', 'CURRICULAR', 20)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 5. INSCRIPCIONES
-- ================================================================
CREATE TABLE IF NOT EXISTS inscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    actividad_id INTEGER REFERENCES actividades(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'BAJA')),
    UNIQUE(estudiante_id, actividad_id)
);

-- ================================================================
-- 6. ASISTENCIAS
-- ================================================================
CREATE TABLE IF NOT EXISTS asistencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PRESENTE', 'AUSENTE', 'JUSTIFICADO')),
    docente_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
    UNIQUE(estudiante_id, fecha)
);

-- ================================================================
-- 7. SOLICITUDES DE INSCRIPCIÓN WEB (JSONB)
-- ================================================================
CREATE TABLE IF NOT EXISTS solicitudes_inscripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    datos_aspirante JSONB NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'REVISADO', 'ACEPTADO')),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_inscripcion(estado);

-- ================================================================
-- 8. CONTENIDO WEB
-- ================================================================
CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    imagen_url TEXT,
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_escolar (
    id SERIAL PRIMARY KEY,
    dia_semana VARCHAR(20),
    descripcion TEXT,
    fecha_vigencia DATE
);

CREATE TABLE IF NOT EXISTS opiniones (
    id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(100) DEFAULT 'Anónimo',
    comentario TEXT NOT NULL CHECK (LENGTH(comentario) >= 10),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 9. GALERÍA DE IMÁGENES
-- ================================================================
CREATE TABLE IF NOT EXISTS galeria (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    descripcion VARCHAR(255),
    categoria VARCHAR(50) CHECK (categoria IN ('INSTALACIONES', 'EVENTOS'))
);

-- ================================================================
-- LÓGICA DE NEGOCIO: Función cálculo % de asistencia
-- ================================================================
CREATE OR REPLACE FUNCTION calcular_porcentaje_asistencia(p_estudiante_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_clases INTEGER;
    clases_presentes INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_clases
    FROM asistencias
    WHERE estudiante_id = p_estudiante_id;

    SELECT COUNT(*)
    INTO clases_presentes
    FROM asistencias
    WHERE estudiante_id = p_estudiante_id
      AND estado IN ('PRESENTE', 'JUSTIFICADO');

    IF total_clases = 0 THEN
        RETURN 0;
    END IF;

    RETURN ROUND((clases_presentes::NUMERIC / total_clases) * 100, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- ================================================================
-- LÓGICA DE NEGOCIO: Trigger control de cupo máximo
-- ================================================================
CREATE OR REPLACE FUNCTION verificar_cupo_actividad()
RETURNS TRIGGER AS $$
DECLARE
    inscriptos_actuales INTEGER;
    cupo_max INTEGER;
BEGIN
    SELECT cupo_maximo
    INTO cupo_max
    FROM actividades
    WHERE id = NEW.actividad_id;

    SELECT COUNT(*)
    INTO inscriptos_actuales
    FROM inscripciones
    WHERE actividad_id = NEW.actividad_id
      AND estado = 'ACTIVO';

    IF inscriptos_actuales >= cupo_max THEN
        RAISE EXCEPTION 'Cupo máximo alcanzado para la actividad. No se puede inscribir al alumno.'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verificar_cupo ON inscripciones;
CREATE TRIGGER trigger_verificar_cupo
    BEFORE INSERT ON inscripciones
    FOR EACH ROW
    EXECUTE FUNCTION verificar_cupo_actividad();

-- ================================================================
-- ÍNDICES de rendimiento
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_perfiles_user_id ON perfiles(user_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol_id ON perfiles(rol_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_estudiante ON asistencias(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_actividad ON inscripciones(actividad_id);
CREATE INDEX IF NOT EXISTS idx_noticias_fecha ON noticias(fecha_publicacion DESC);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
-- Habilitar RLS en todas las tablas del schema público
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_inscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_escolar ENABLE ROW LEVEL SECURITY;

-- Roles: Acceso completo para service_role (admin dashboard)
-- Perfiles: cada usuario ve el suyo; directores y docentes ven todos
CREATE POLICY "Perfil propio" ON perfiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Directores y docentes ven todos los perfiles" ON perfiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles p
            JOIN roles r ON p.rol_id = r.id
            WHERE p.user_id = auth.uid()
              AND r.nombre IN ('DIRECTOR', 'DOCENTE')
        )
    );

CREATE POLICY "Solo directores insertan perfiles" ON perfiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM perfiles p
            JOIN roles r ON p.rol_id = r.id
            WHERE p.user_id = auth.uid() AND r.nombre = 'DIRECTOR'
        )
    );

-- Asistencias: docentes y directores gestionan; alumnos/padres ven
CREATE POLICY "Docentes registran asistencias" ON asistencias
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles p
            JOIN roles r ON p.rol_id = r.id
            WHERE p.user_id = auth.uid()
              AND r.nombre IN ('DIRECTOR', 'DOCENTE')
        )
    );

CREATE POLICY "Alumnos y padres ven sus propias asistencias" ON asistencias
    FOR SELECT USING (
        estudiante_id IN (
            SELECT id FROM perfiles WHERE user_id = auth.uid()
        )
    );

-- Noticias, galería, menú: lectura pública
CREATE POLICY "Noticias son públicas" ON noticias FOR SELECT USING (true);
CREATE POLICY "Galería es pública" ON galeria FOR SELECT USING (true);
CREATE POLICY "Menú es público" ON menu_escolar FOR SELECT USING (true);

-- Opiniones: insert público, lectura pública
CREATE POLICY "Opiniones son públicas" ON opiniones FOR SELECT USING (true);
CREATE POLICY "Cualquiera puede dejar una opinión" ON opiniones FOR INSERT WITH CHECK (true);

-- Solicitudes: insert público (desde el formulario web); gestión solo para directores
CREATE POLICY "Formulario de inscripción público" ON solicitudes_inscripcion
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo directores ven solicitudes" ON solicitudes_inscripcion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles p
            JOIN roles r ON p.rol_id = r.id
            WHERE p.user_id = auth.uid() AND r.nombre = 'DIRECTOR'
        )
    );

CREATE POLICY "Solo directores actualizan solicitudes" ON solicitudes_inscripcion
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM perfiles p
            JOIN roles r ON p.rol_id = r.id
            WHERE p.user_id = auth.uid() AND r.nombre = 'DIRECTOR'
        )
    );

-- Conceder acceso a las tablas del schema a los roles anon y authenticated
GRANT SELECT ON noticias, galeria, menu_escolar, opiniones TO anon;
GRANT INSERT ON opiniones TO anon;
GRANT INSERT ON solicitudes_inscripcion TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- DATOS DE DEMO (noticias y galería)
-- ================================================================
INSERT INTO noticias (titulo, contenido, imagen_url) VALUES
    ('Bienvenidos al Centro Educativo Educar para Transformar',
     'Con enorme alegría anunciamos la apertura de nuestras inscripciones para el ciclo lectivo 2027. Somos un centro educativo comprometido con la formación integral de niños y jóvenes de la región.',
     'https://picsum.photos/seed/noticia1/800/450'),
    ('Habilitación de actividades deportivas 2027',
     'Este año ofrecemos 8 disciplinas deportivas con cupos limitados: Fútbol, Natación, Atletismo, Artes Marciales, Vóley, Danza, Básquet y Ajedrez. Las inscripciones están abiertas.',
     'https://picsum.photos/seed/noticia2/800/450'),
    ('Jornada extendida en el nivel Secundario',
     'El nivel Secundario contará con jornada extendida de 8:00 a 17:00 hs, con talleres interdisciplinarios, refuerzo académico y actividades culturales incluidas.',
     'https://picsum.photos/seed/noticia3/800/450')
ON CONFLICT DO NOTHING;

INSERT INTO galeria (url, descripcion, categoria) VALUES
    ('https://picsum.photos/seed/gal1/600/400', 'Aulas modernas equipadas', 'INSTALACIONES'),
    ('https://picsum.photos/seed/gal2/600/400', 'Laboratorio de ciencias', 'INSTALACIONES'),
    ('https://picsum.photos/seed/gal3/600/400', 'Cancha deportiva', 'INSTALACIONES'),
    ('https://picsum.photos/seed/gal4/600/400', 'Inauguración del proyecto', 'EVENTOS'),
    ('https://picsum.photos/seed/gal5/600/400', 'Primer encuentro comunitario', 'EVENTOS'),
    ('https://picsum.photos/seed/gal6/600/400', 'Biblioteca digital', 'INSTALACIONES')
ON CONFLICT DO NOTHING;
