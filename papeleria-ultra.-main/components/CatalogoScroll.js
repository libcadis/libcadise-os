"use client"
import { useMemo, useState } from "react"
import Card from "./Card"
import { useProductos } from "../hooks/useProductos"

const CATEGORIAS_UI = [
  { id: 'todos', label: 'Todos' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'papeleria-creativa', label: 'Papelería creativa' },
  { id: '3d', label: '3D' },
  { id: 'souvenirs', label: 'Souvenirs' },
  { id: 'invitaciones-digitales', label: 'Invitaciones digitales' },
]

const normalizarCategoria = (categoria) => (categoria || '').trim().toLowerCase()

const categoriaProductoToUI = (categoriaRaw) => {
  const categoria = normalizarCategoria(categoriaRaw)

  if (categoria === 'stickers') return 'stickers'
  if (['agendas', 'cuadernos', 'papeleria', 'impresion'].includes(categoria)) return 'papeleria-creativa'
  if (categoria === '3d') return '3d'
  if (['souvenirs', 'souvenir'].includes(categoria)) return 'souvenirs'
  if (['invitaciones', 'tarjetas', 'invitaciones-digitales'].includes(categoria)) return 'invitaciones-digitales'

  return categoria
}

const PRODUCTOS_DEMO = [
  {
    id: 1,
    nombre: "Sticker Personalizado 7cm",
    precio: 1500,
    descripcion: "Pack de stickers impresos en alta calidad, tamaño 7cm.",
    categoria: "stickers",
    imagenes: [],
    activo: true,
  },
  {
    id: 2,
    nombre: "Sticker Personalizado 4cm",
    precio: 900,
    descripcion: "Stickers pequeños ideales para packaging y regalos.",
    categoria: "stickers",
    imagenes: [],
    activo: true,
  },
  {
    id: 3,
    nombre: "Invitación Impresa",
    precio: 2500,
    descripcion: "Invitaciones de cumpleaños, bodas y eventos en papel premium.",
    categoria: "invitaciones",
    imagenes: [],
    activo: true,
  },
  {
    id: 4,
    nombre: "Kit de Papelería",
    precio: 5500,
    descripcion: "Set completo de papelería personalizada para tu negocio o evento.",
    categoria: "papeleria",
    imagenes: [],
    activo: true,
  },
  {
    id: 5,
    nombre: "Laminado Brillante A4",
    precio: 1200,
    descripcion: "Impresión A4 con laminado brillante de alta durabilidad.",
    categoria: "impresion",
    imagenes: [],
    activo: true,
  },
]

const CatalogoScroll = () => {
  const { productos, loading } = useProductos()
  const lista = productos.length > 0 ? productos : PRODUCTOS_DEMO
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [orden, setOrden] = useState('relevancia')

  const parsePrecio = (valor) => {
    if (typeof valor === 'number') return valor
    return parseFloat(String(valor || '').replace(/[^0-9.]/g, '')) || 0
  }

  const { minLista, maxLista } = useMemo(() => {
    const precios = lista.map((p) => parsePrecio(p.precio)).filter((v) => Number.isFinite(v))
    if (precios.length === 0) return { minLista: 0, maxLista: 0 }
    return {
      minLista: Math.min(...precios),
      maxLista: Math.max(...precios),
    }
  }, [lista])

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const min = precioMin === '' ? null : Number(precioMin)
    const max = precioMax === '' ? null : Number(precioMax)

    const filtrados = lista.filter((prod) => {
      const precioProd = parsePrecio(prod.precio)
      const categoriaUI = categoriaProductoToUI(prod.categoria)
      const coincideCategoria = categoriaActiva === 'todos' || categoriaUI === categoriaActiva
      const coincideMin = min === null || precioProd >= min
      const coincideMax = max === null || precioProd <= max

      if (!coincideCategoria || !coincideMin || !coincideMax) return false

      if (!q) return true

      const nombre = (prod.nombre || '').toLowerCase()
      const descripcion = (prod.descripcion || '').toLowerCase()
      const categoria = (prod.categoria || '').toLowerCase()
      return nombre.includes(q) || descripcion.includes(q) || categoria.includes(q)
    })

    if (orden === 'precio_asc') {
      return [...filtrados].sort((a, b) => parsePrecio(a.precio) - parsePrecio(b.precio))
    }
    if (orden === 'precio_desc') {
      return [...filtrados].sort((a, b) => parsePrecio(b.precio) - parsePrecio(a.precio))
    }
    if (orden === 'nombre_asc') {
      return [...filtrados].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
    }

    return filtrados
  }, [lista, categoriaActiva, busqueda, precioMin, precioMax, orden])

  const hasFiltrosActivos = categoriaActiva !== 'todos' || busqueda.trim() || precioMin !== '' || precioMax !== '' || orden !== 'relevancia'
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  const limpiarFiltros = () => {
    setCategoriaActiva('todos')
    setBusqueda('')
    setPrecioMin('')
    setPrecioMax('')
    setOrden('relevancia')
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-2xl" style={{ minWidth: '220px', height: '320px' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-4">
          {/* Mobile: toggle header */}
        <div className="flex items-center justify-between md:hidden">
          <span className="text-sm font-semibold text-gray-600">
            {hasFiltrosActivos ? `Filtros activos ✦` : 'Buscar y filtrar'}
          </span>
          <button
            type="button"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-purple-400 transition-all"
            aria-label="Filtros"
          >
            {filtrosAbiertos ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            )}
            Filtros
            {hasFiltrosActivos && (
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            )}
          </button>
        </div>

        {/* Filter panel: always visible on md+, toggleable on mobile */}
        <div className={`${filtrosAbiertos ? 'mt-4' : 'hidden'} md:block md:mt-0`}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, descripción o categoría..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={minLista}
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                placeholder={`Min $${minLista}`}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white"
              />
              <input
                type="number"
                min={minLista}
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                placeholder={`Max $${maxLista}`}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white"
              />
            </div>

            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white"
            >
              <option value="relevancia">Orden: Relevancia</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="nombre_asc">Nombre: A-Z</option>
            </select>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={limpiarFiltros}
                disabled={!hasFiltrosActivos}
                className="px-4 py-2 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Limpiar filtros
              </button>
            </div>
          </div>{/* end grid */}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-500">Categorías:</span>
            {CATEGORIAS_UI.map((cat) => {
              const isActive = categoriaActiva === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>{/* end collapsible */}
      </div>{/* end glass */}

      {productosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No encontramos productos con esos filtros.
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-4 px-2">
          {productosFiltrados.map((prod) => (
            <Card key={prod.id} producto={prod} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CatalogoScroll