-- ============================================================
-- MIGRACIÓN: Sección homepage_sections
-- Ejecutar SÓLO ESTE ARCHIVO en Supabase SQL Editor
-- (no re-ejecutes el schema completo para evitar errores)
-- ============================================================

-- 1. Crear tabla si no existe
CREATE TABLE IF NOT EXISTS homepage_sections (
  section_key VARCHAR(100) PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  subtitle    TEXT,
  items       JSONB DEFAULT '[]',
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trigger para updated_at (usa la función que ya existe en tu DB)
DROP TRIGGER IF EXISTS update_homepage_sections_updated_at ON homepage_sections;
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Deshabilitar RLS para que el admin pueda leer y guardar
--    (igual que en tus otras tablas: productos, pedidos, etc.)
ALTER TABLE homepage_sections DISABLE ROW LEVEL SECURITY;

-- 4. Insertar / actualizar datos iniciales
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
  'Los más pedidos por nuestros clientes',
  'Una selección de los productos que más salen y que mejor funcionan para regalar, emprender o personalizar eventos.',
  '[
    {"icon":"🔥","titulo":"Stickers personalizados","descripcion":"La opción más elegida para souvenirs, packaging y regalos con identidad propia.","detalle":"4cm y 7cm con impresión mate o brillante."},
    {"icon":"🎁","titulo":"Souvenirs para eventos","descripcion":"Kits listos para cumpleaños, bautismos y celebraciones con estilo artesanal.","detalle":"Diseños coordinados y producción por pedido."},
    {"icon":"✨","titulo":"Papelería creativa","descripcion":"Etiquetas, tags y piezas impresas para marcas, emprendimientos y fechas especiales.","detalle":"Ideal para sumar presencia visual a tu producto."}
  ]'::jsonb
),
(
  'reviews',
  'Reseñas de nuestros clientes',
  'Lo que más valoran quienes ya compraron: calidad de impresión, tiempos de entrega y atención personalizada.',
  '[
    {"nombre":"Camila R.","texto":"Los stickers quedaron hermosos. La impresión salió super prolija y llegaron rapidísimo.","contexto":"Pedido para packaging de emprendimiento"},
    {"nombre":"Florencia G.","texto":"Encargué souvenirs para un cumple y todo vino tal como lo imaginé. Muy buena atención.","contexto":"Souvenirs personalizados"},
    {"nombre":"Mariana T.","texto":"Me encantó la calidad de la papelería. Los colores impresos se ven divinos y el acabado es excelente.","contexto":"Papelería creativa para evento"}
  ]'::jsonb
)
ON CONFLICT (section_key)
DO UPDATE SET
  title    = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  items    = EXCLUDED.items;
