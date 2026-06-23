-- ============================================================
-- LA CASA DEL HELADO — Supabase Database Setup
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- 1. Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id          BIGSERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  precio      NUMERIC(10,2) NOT NULL,
  imagen      TEXT,
  categoria   TEXT NOT NULL CHECK (categoria IN ('helados','batidas','jugos','tostadas','otros')),
  disponible  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice por categoría
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_disponible ON productos(disponible);

-- 2. Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id         BIGSERIAL PRIMARY KEY,
  cliente    TEXT NOT NULL,
  telefono   TEXT,
  direccion  TEXT,
  notas      TEXT,
  productos  JSONB NOT NULL DEFAULT '[]',
  total      NUMERIC(10,2) DEFAULT 0,
  estado     TEXT NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente','preparando','entregado')),
  fecha      TIMESTAMPTZ DEFAULT NOW()
);

-- Índice por estado y fecha
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha  ON pedidos(fecha DESC);


-- 3. Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos   ENABLE ROW LEVEL SECURITY;

-- Productos: lectura pública, escritura solo autenticados
CREATE POLICY "Productos lectura pública"
  ON productos FOR SELECT
  USING (true);

CREATE POLICY "Productos escritura admin"
  ON productos FOR ALL
  USING (auth.role() = 'authenticated');

-- Pedidos: inserción pública, lectura/edición solo admin
CREATE POLICY "Pedidos inserción pública"
  ON pedidos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Pedidos gestión admin"
  ON pedidos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Pedidos update admin"
  ON pedidos FOR UPDATE
  USING (auth.role() = 'authenticated');


-- 4. Storage bucket para imágenes (ejecutar en Storage UI o via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('productos', 'productos', true);
-- O créalo manualmente desde Supabase > Storage > New bucket: "productos" (público)


-- 5. Datos iniciales de muestra
INSERT INTO productos (nombre, descripcion, precio, categoria, disponible) VALUES
  ('Helado de Vainilla',       'Clásico cremoso con esencia de vainilla natural.',             150, 'helados',  true),
  ('Helado de Chocolate',      'Intenso y cremoso, hecho con cacao premium.',                  150, 'helados',  true),
  ('Helado de Fresa',          'Fresco y afrutado con fresas naturales.',                       150, 'helados',  true),
  ('Helado de Coco',           'Tropical y cremoso con coco fresco rallado.',                  160, 'helados',  true),
  ('Helado de Mango',          'Sabor tropical intenso con mango dominicano.',                 160, 'helados',  true),
  ('Helado de Nutella',        'La combinación perfecta de avellanas y chocolate.',            175, 'helados',  true),
  ('Batida de Fresa',          'Cremosa batida con fresas frescas y leche entera.',            200, 'batidas',  true),
  ('Batida de Vainilla',       'Suave y dulce, perfecta para cualquier momento.',              200, 'batidas',  true),
  ('Batida de Oreo',           'Galletas Oreo trituradas con helado y leche fría.',            220, 'batidas',  true),
  ('Batida de Guanábana',      'Exótica batida con guanábana natural dominicana.',             210, 'batidas',  true),
  ('Batida de Chinola',        'Refrescante batida de maracuyá con un toque cítrico.',         210, 'batidas',  true),
  ('Jugo de Naranja Natural',  'Naranjas exprimidas al momento, sin azúcar añadida.',          120, 'jugos',    true),
  ('Jugo de Limón',            'Refrescante limonada natural con menta.',                      120, 'jugos',    true),
  ('Jugo de Melón',            'Suave y dulce, ideal para el calor caribeño.',                 130, 'jugos',    true),
  ('Jugo de Piña',             'Piña tropical fresca exprimida al instante.',                  130, 'jugos',    true),
  ('Tostada con Mantequilla',  'Pan tostado dorado con mantequilla fresca.',                   80,  'tostadas', true),
  ('Tostada con Queso',        'Crujiente tostada con queso derretido al gusto.',              100, 'tostadas', true),
  ('Tostada con Mermelada',    'Pan tostado con mermelada de fresa o guayaba.',                90,  'tostadas', true),
  ('Tostada Completa',         'Pan tostado, queso, jamón y aguacate. Todo incluido.',         150, 'tostadas', true),
  ('Brownie con Helado',       'Brownie tibio de chocolate con una bola de helado de vainilla.', 250, 'otros', true),
  ('Sundae de Chocolate',      'Helado con salsa de chocolate, crema y topping de cereal.',   220, 'otros',    true),
  ('Waffle con Helado',        'Waffle crujiente con dos bolas de helado a elegir.',           280, 'otros',    true),
  ('Copa Especial',            'Copa con tres sabores de helado y toppings variados.',         300, 'otros',    true)
ON CONFLICT DO NOTHING;
