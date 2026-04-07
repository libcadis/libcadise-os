-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100) NOT NULL,
  imagenes TEXT[], -- Array de URLs de imágenes
  descuento DECIMAL(5,2) DEFAULT 0, -- Porcentaje de descuento
  tamaños JSONB DEFAULT '[]', -- Array de objetos: [{nombre: "Pequeño", precio_adicional: 0}, {nombre: "Grande", precio_adicional: 500}]
  tipos_papel JSONB DEFAULT '[{"nombre":"Mate","activo":true,"precio_adicional":0},{"nombre":"Brillante","activo":true,"precio_adicional":0},{"nombre":"Ilustracion","activo":false,"precio_adicional":0}]', -- Opciones de papel configurables por producto
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evita duplicados de productos de ejemplo al re-ejecutar el script
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'productos_nombre_unique'
  ) THEN
    ALTER TABLE productos
    ADD CONSTRAINT productos_nombre_unique UNIQUE (nombre);
  END IF;
END
$$;

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_nombre VARCHAR(255),
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(50),
  cliente_direccion TEXT,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmado, en_proceso, enviado, entregado, cancelado
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de items de pedido
CREATE TABLE IF NOT EXISTS pedido_items (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id INTEGER REFERENCES productos(id),
  nombre_producto VARCHAR(255) NOT NULL,
  imagen TEXT,
  precio_unitario DECIMAL(10,2) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  tamaño_seleccionado VARCHAR(100), -- Si aplica
  precio_adicional DECIMAL(10,2) DEFAULT 0, -- Por el tamaño
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos de ejemplo
INSERT INTO productos (nombre, precio, descripcion, categoria, imagenes, descuento, tamaños) VALUES
('Stickers Personalizados', 200.00, 'Diseños únicos para tu estilo', 'stickers', ARRAY['🎨', '⭐', '💖'], 0, '[{"nombre": "Pequeño (5x5cm)", "precio_adicional": 0}, {"nombre": "Mediano (10x10cm)", "precio_adicional": 100}, {"nombre": "Grande (15x15cm)", "precio_adicional": 200}]'),
('Agendas Creativas', 3500.00, 'Organiza tus ideas con estilo', 'agendas', ARRAY['📓', '✏️', '🎯'], 10, '[{"nombre": "A5", "precio_adicional": 0}, {"nombre": "A4", "precio_adicional": 500}]'),
('Figuras 3D', 5000.00, 'Arte tridimensional personalizado', '3d', ARRAY['🎭', '🎪', '🎨'], 0, '[{"nombre": "Pequeño (10cm)", "precio_adicional": 0}, {"nombre": "Mediano (20cm)", "precio_adicional": 1500}, {"nombre": "Grande (30cm)", "precio_adicional": 3000}]'),
('Tarjetas de Visita', 1500.00, 'Profesionalismo en cada detalle', 'tarjetas', ARRAY['💼', '📋', '✨'], 5, '[{"nombre": "Estándar (50 unidades)", "precio_adicional": 0}, {"nombre": "Premium (100 unidades)", "precio_adicional": 1000}]'),
('Cuadernos Artísticos', 2800.00, 'Para tu creatividad ilimitada', 'cuadernos', ARRAY['📖', '🎨', '🌈'], 0, '[{"nombre": "A5 (100 hojas)", "precio_adicional": 0}, {"nombre": "A4 (100 hojas)", "precio_adicional": 300}, {"nombre": "A3 (50 hojas)", "precio_adicional": 800}]')
ON CONFLICT (nombre) DO NOTHING;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id ON pedido_items(pedido_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON pedidos;
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Extensión para hash de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Usuarios administradores (credenciales ocultas en Supabase)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_activo ON admin_users(activo);

-- Contenido editable de la home
CREATE TABLE IF NOT EXISTS homepage_sections (
  section_key VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  items JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_homepage_sections_updated_at ON homepage_sections;
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO homepage_sections (section_key, title, subtitle, items) VALUES
(
  'promos',
  '¡Promociones Especiales!',
  'Aprovecha estas ofertas limitadas',
  '[
    {"icon":"🔥","title":"2x1 en Stickers","description":"Personalizados unicos","highlight":"$200","button_text":"¡Aprovechar Ahora!","button_action":"none","button_variant":"primary"},
    {"icon":"🎨","title":"Envio Gratis","description":"En compras mayores a $1000","highlight":"🚚","button_text":"Ver Condiciones","button_action":"modal","button_variant":"secondary"},
    {"icon":"✨","title":"Pack Creativo","description":"Stickers + Agenda + Marcadores","highlight":"$1500","button_text":"Ver Pack","button_action":"scroll_productos","button_variant":"primary"}
  ]'::jsonb
),
(
  'top_pedidos',
  'Los mas pedidos por nuestros clientes',
  'Una seleccion con los productos que mas salen y que mejor funcionan para regalar, emprender o personalizar eventos.',
  '[
    {"icon":"🔥","titulo":"Stickers personalizados","descripcion":"La opcion mas elegida para souvenirs, packaging y regalos con identidad propia.","detalle":"4cm y 7cm con impresion mate o brillante."},
    {"icon":"🎁","titulo":"Souvenirs para eventos","descripcion":"Kits listos para cumpleaños, bautismos y celebraciones con estilo artesanal.","detalle":"Disenos coordinados y produccion por pedido."},
    {"icon":"✨","titulo":"Papeleria creativa","descripcion":"Etiquetas, tags y piezas impresas para marcas, emprendimientos y fechas especiales.","detalle":"Ideal para sumar presencia visual a tu producto."}
  ]'::jsonb
),
(
  'reviews',
  'Reseñas de nuestros clientes',
  'Lo que mas valoran quienes ya compraron: calidad de impresion, tiempos de entrega y atencion personalizada.',
  '[
    {"nombre":"Camila R.","texto":"Los stickers quedaron hermosos. La impresion salio super prolija y llegaron rapidisimo.","contexto":"Pedido para packaging de emprendimiento"},
    {"nombre":"Florencia G.","texto":"Encargue souvenirs para un cumple y todo vino tal como lo imagine. Muy buena atencion.","contexto":"Souvenirs personalizados"},
    {"nombre":"Mariana T.","texto":"Me encanto la calidad de la papeleria. Los colores impresos se ven divinos y el acabado es excelente.","contexto":"Papeleria creativa para evento"}
  ]'::jsonb
)
ON CONFLICT (section_key)
DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  items = EXCLUDED.items;

-- Compatibilidad para bases ya creadas: agrega columna de imagen si no existe
ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS imagen TEXT;

-- Compatibilidad para bases ya creadas: agrega tipos de papel si no existe
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tipos_papel JSONB DEFAULT '[{"nombre":"Mate","activo":true,"precio_adicional":0},{"nombre":"Brillante","activo":true,"precio_adicional":0},{"nombre":"Ilustracion","activo":false,"precio_adicional":0}]';

-- Función para validar login admin sin exponer password
CREATE OR REPLACE FUNCTION verify_admin_credentials(p_user TEXT, p_pass TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE username = p_user
      AND activo = true
      AND password_hash = crypt(p_pass, password_hash)
  );
$$;

-- ==============================
-- Supabase Storage (imágenes)
-- ==============================

-- Crea/actualiza el bucket público para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'productos',
  'productos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id)
DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas RLS para permitir operaciones sobre el bucket "productos"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Productos bucket public read'
  ) THEN
    EXECUTE 'CREATE POLICY "Productos bucket public read" ON storage.objects FOR SELECT TO public USING (bucket_id = ''productos'')';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Productos bucket public insert'
  ) THEN
    EXECUTE 'CREATE POLICY "Productos bucket public insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = ''productos'')';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Productos bucket public update'
  ) THEN
    EXECUTE 'CREATE POLICY "Productos bucket public update" ON storage.objects FOR UPDATE TO public USING (bucket_id = ''productos'') WITH CHECK (bucket_id = ''productos'')';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Productos bucket public delete'
  ) THEN
    EXECUTE 'CREATE POLICY "Productos bucket public delete" ON storage.objects FOR DELETE TO public USING (bucket_id = ''productos'')';
  END IF;
END
$$;