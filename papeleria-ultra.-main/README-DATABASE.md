# Configuración de Base de Datos - Papelería Ultra

## 🚀 Configuración Inicial

### 1. Ejecutar el Schema SQL

Ve a [Supabase Dashboard](https://supabase.com/dashboard) y ejecuta el archivo `supabase-schema.sql` en el SQL Editor de tu proyecto.

### 2. Verificar las Tablas

Asegúrate de que se crearon las siguientes tablas:
- `productos`
- `pedidos`
- `pedido_items`

### 3. Verificar Storage para imágenes

El mismo `supabase-schema.sql` también crea/configura:
- Bucket público `productos`
- Políticas RLS sobre `storage.objects` para `SELECT`, `INSERT`, `UPDATE` y `DELETE` en ese bucket

Si al subir imágenes aparece el error `new row violates row-level security policy`, vuelve a ejecutar `supabase-schema.sql` completo en el SQL Editor.

### 4. Datos de Ejemplo

El schema incluye datos de ejemplo para que puedas probar la aplicación inmediatamente.

## 📊 Estructura de la Base de Datos

### Tabla `productos`
- `id`: SERIAL PRIMARY KEY
- `nombre`: VARCHAR(255) NOT NULL
- `precio`: DECIMAL(10,2) NOT NULL
- `descripcion`: TEXT
- `categoria`: VARCHAR(100) NOT NULL
- `imagenes`: TEXT[] (Array de URLs/emojis)
- `descuento`: DECIMAL(5,2) DEFAULT 0
- `tamaños`: JSONB (Array de objetos con nombre y precio_adicional)
- `activo`: BOOLEAN DEFAULT true
- `created_at`, `updated_at`: TIMESTAMPS

### Tabla `pedidos`
- `id`: SERIAL PRIMARY KEY
- `cliente_*`: Información del cliente
- `total`: DECIMAL(10,2)
- `estado`: VARCHAR(50) DEFAULT 'pendiente'
- `notas`: TEXT
- `created_at`, `updated_at`: TIMESTAMPS

### Tabla `pedido_items`
- `id`: SERIAL PRIMARY KEY
- `pedido_id`: FOREIGN KEY
- `producto_id`: FOREIGN KEY
- `detalles del item`: nombre, precio, cantidad, tamaño, etc.

## 🔧 Funcionalidades Implementadas

### ✅ Filtro de Categorías
- Botones para filtrar productos por categoría
- Opción "Todos" para ver todos los productos

### ✅ Gestión de Productos desde Supabase
- **Agregar**: Formulario completo para nuevos productos
- **Editar**: Modificar productos existentes
- **Eliminar**: Desactivar productos (soft delete)
- **Campos**: nombre, precio, descripción, categoría, imágenes, descuento, tamaños

### ✅ Sistema de Tamaños con Precios Dinámicos
- Selector desplegable de tamaños por producto
- Precio base + precio adicional por tamaño
- Cálculo automático del precio final

### ✅ Sistema de Pedidos Completo
- **Checkout**: Formulario completo de datos del cliente
- **Estados**: pendiente → confirmado → en_proceso → enviado → entregado
- **Historial**: Seguimiento completo de pedidos
- **Items detallados**: Cada item guarda tamaño y precio específico

### ✅ Panel de Administración
- **/admin**: Panel completo para gestionar productos y pedidos
- **Productos**: CRUD completo con formulario avanzado
- **Pedidos**: Vista de todos los pedidos con filtros por estado

## 🎨 Funcionalidades de UI/UX

### Filtros Visuales
- Botones de categoría con diseño moderno
- Estados de carga y errores
- Feedback visual en todas las acciones

### Carrito Inteligente
- Cálculo automático de precios con tamaños
- Visualización clara de items con detalles
- Integración completa con checkout

### Formularios Avanzados
- Validación de campos requeridos
- Campos dinámicos para imágenes y tamaños
- Interfaz intuitiva para gestión de productos

## 📱 URLs Importantes

- **Tienda**: `/` - Catálogo con filtros
- **Personalizar Sticker**: `/personalizar` - Editor de stickers
- **Checkout**: `/checkout` - Finalizar compra
- **Admin**: `/admin` - Panel de administración

## 🔐 Seguridad

- RLS (Row Level Security) configurado en Supabase
- Políticas de acceso para productos activos únicamente
- Validación de datos en el frontend

## 🚀 Próximos Pasos

1. **Subir imágenes reales** a Supabase Storage
2. **Configurar webhooks** para notificaciones de pedidos
3. **Implementar pasarelas de pago** (Mercado Pago, Stripe)
4. **Sistema de reseñas** para productos
5. **Dashboard de analytics** para el admin

---

¡Tu tienda de papelería está lista para recibir pedidos! 🎉