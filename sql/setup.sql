-- ============================================================
-- WorkTrack — Setup SQL para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Tabla: projects ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  code        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla: documents ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  code        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabla: time_entries ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_entries (
  id          UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID           NOT NULL REFERENCES projects(id)  ON DELETE CASCADE,
  document_id UUID           NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  date        DATE           NOT NULL,
  activity    TEXT           NOT NULL,
  description TEXT,
  hours       NUMERIC(5,2)   NOT NULL CHECK (hours > 0 AND hours <= 24),
  created_at  TIMESTAMPTZ    DEFAULT NOW()
);

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_documents_project_id     ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id  ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_document_id ON time_entries(document_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date        ON time_entries(date);

-- ── Row Level Security (acceso público para MVP) ─────────────
ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access" ON projects;
DROP POLICY IF EXISTS "Public access" ON documents;
DROP POLICY IF EXISTS "Public access" ON time_entries;

CREATE POLICY "Public access" ON projects     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON documents    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON time_entries FOR ALL USING (true) WITH CHECK (true);

-- ── Datos de prueba ──────────────────────────────────────────
INSERT INTO projects (name, code, description) VALUES
  ('Diseño eléctrico Edificio ABC', 'PRO-001', 'Diseño eléctrico completo de edificio residencial de 5 pisos.'),
  ('Bodega Industrial Norte',       'PRO-002', 'Instalaciones eléctricas para bodega industrial de 2000 m².'),
  ('Centro Comercial Plaza Sur',    'PRO-003', 'Diseño y supervisión eléctrica de centro comercial.');

WITH proj AS (SELECT id, code FROM projects)
INSERT INTO documents (project_id, name, code, description)
SELECT p.id, d.name, d.code, d.description
FROM proj p
JOIN (VALUES
  ('PRO-001', 'Planta eléctrica',  'P-01', 'Planta general de instalaciones eléctricas'),
  ('PRO-001', 'Diagrama unifilar', 'P-02', 'Diagrama unifilar del sistema eléctrico'),
  ('PRO-001', 'Memoria técnica',   'M-01', 'Memoria descriptiva y de cálculo'),
  ('PRO-001', 'Cuadro de cargas',  'C-01', 'Cuadro de cargas y circuitos'),
  ('PRO-002', 'Planta eléctrica',  'P-01', 'Planta eléctrica principal bodega'),
  ('PRO-002', 'Tablero principal', 'T-01', 'Diseño tablero eléctrico principal'),
  ('PRO-003', 'Planta general',    'P-01', 'Planta general eléctrica centro comercial'),
  ('PRO-003', 'Informe técnico',   'I-01', 'Informe técnico de supervisión')
) AS d(proj_code, name, code, description) ON p.code = d.proj_code;

INSERT INTO time_entries (project_id, document_id, date, activity, description, hours)
SELECT p.id, d.id, te.date::DATE, te.activity, te.description, te.hours
FROM (VALUES
  ('PRO-001','P-01','2026-09-01','Diseño',        'Diseño inicial de planta eléctrica',    4.0),
  ('PRO-001','P-01','2026-09-03','Diseño',        'Continuación diseño circuitos',          3.0),
  ('PRO-001','P-01','2026-09-08','Revisión',      'Revisión con cliente',                   2.0),
  ('PRO-001','P-01','2026-09-10','Corrección',    'Corrección según observaciones cliente', 2.5),
  ('PRO-001','P-01','2026-09-12','Revisión',      'Segunda revisión interna',               1.0),
  ('PRO-001','P-02','2026-09-02','Diseño',        'Diseño diagrama unifilar',               3.0),
  ('PRO-001','P-02','2026-09-05','Diseño',        'Detalle de circuitos secundarios',       2.5),
  ('PRO-001','P-02','2026-09-09','Revisión',      'Revisión interna del diagrama',          1.5),
  ('PRO-001','P-02','2026-09-11','Corrección',    'Ajustes finales de alimentadores',       1.0),
  ('PRO-001','M-01','2026-09-04','Documentación', 'Redacción memoria técnica inicial',      4.0),
  ('PRO-001','M-01','2026-09-06','Documentación', 'Cálculos de demanda eléctrica',          3.0),
  ('PRO-001','M-01','2026-09-13','Revisión',      'Revisión y corrección memoria',          2.5),
  ('PRO-001','M-01','2026-09-14','Corrección',    'Ajuste de cálculos y fórmulas',          2.0),
  ('PRO-001','C-01','2026-09-07','Diseño',        'Diseño cuadro de cargas principal',      3.0),
  ('PRO-001','C-01','2026-09-10','Revisión',      'Verificación de cargas y balanceo',      1.5),
  ('PRO-001','C-01','2026-09-12','Corrección',    'Corrección cuadro según revisión',       1.5),
  ('PRO-002','P-01','2026-09-01','Diseño',        'Diseño planta bodega — zona A',          5.0),
  ('PRO-002','P-01','2026-09-03','Diseño',        'Detalle luminarias y tomacorrientes',    3.0),
  ('PRO-002','P-01','2026-09-08','Revisión',      'Revisión con ingeniero cliente',         2.0),
  ('PRO-002','T-01','2026-09-02','Diseño',        'Diseño tablero eléctrico principal',     4.0),
  ('PRO-002','T-01','2026-09-05','Revisión',      'Revisión tablero con cliente',           2.0),
  ('PRO-002','T-01','2026-09-09','Corrección',    'Ajuste de potencias y protecciones',     2.0),
  ('PRO-003','P-01','2026-09-01','Diseño',        'Diseño inicial planta general',          4.0),
  ('PRO-003','P-01','2026-09-04','Diseño',        'Ampliación diseño zona comercial',       3.0),
  ('PRO-003','I-01','2026-09-06','Documentación', 'Redacción informe técnico inicial',      3.0),
  ('PRO-003','I-01','2026-09-10','Revisión',      'Revisión y ajuste informe técnico',      2.0)
) AS te(proj_code, doc_code, date, activity, description, hours)
JOIN projects p ON p.code = te.proj_code
JOIN documents d ON d.project_id = p.id AND d.code = te.doc_code;
