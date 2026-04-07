"use client"
import { useEffect, useMemo, useState } from "react"
import { useCart } from "./CartContext"

export default function Card({ producto }) {
  const { addToCart, MIN_UNIDADES_COMPRA } = useCart()

  if (!producto) return null

  const imgSrc = producto.imagenes?.[0] || producto.imagen || null
  const precioNum = typeof producto.precio === 'number'
    ? producto.precio
    : parseFloat(String(producto.precio).replace(/[^0-9.]/g, '')) || 0

  const esSticker = (producto.categoria || '').toLowerCase().includes('sticker')

  const tamaños = useMemo(() => {
    if (!esSticker) return []
    return [
      { nombre: '4cm', precio_adicional: 0 },
      { nombre: '7cm', precio_adicional: 0 },
    ]
  }, [esSticker])

  const papelesActivos = useMemo(() => {
    if (!esSticker) return []
    const raw = producto.tipos_papel
    const DEFAULTS = [
      { nombre: 'Mate', activo: true, precio_adicional: 0 },
      { nombre: 'Brillante', activo: true, precio_adicional: 0 },
    ]
    if (!raw) return DEFAULTS

    const list = Array.isArray(raw)
      ? raw
      : (() => {
          try {
            return JSON.parse(raw)
          } catch {
            return []
          }
        })()

    const filtered = list
      .map((p) => ({
        nombre: p?.nombre || '',
        activo: Boolean(p?.activo),
        precio_adicional: Number(p?.precio_adicional || 0),
      }))
      .filter((p) => p.nombre.trim() !== '' && p.activo)

    // Always show at least Mate and Brillante by default
    if (filtered.length === 0) {
      return DEFAULTS
    }
    return filtered
  }, [esSticker, producto.tipos_papel])

  const [tamañoIndex, setTamañoIndex] = useState(0)
  const [papelIndex, setPapelIndex] = useState(0)
  const [opcionesAbiertas, setOpcionesAbiertas] = useState(false)

  const hasOpcionesSticker = tamaños.length > 0 || papelesActivos.length > 0

  useEffect(() => {
    if (papelIndex >= papelesActivos.length) {
      setPapelIndex(0)
    }
  }, [papelIndex, papelesActivos.length])

  const tamañoSeleccionado = tamaños[tamañoIndex] || null
  const papelSeleccionado = papelesActivos[papelIndex] || null

  const precioAdicionalTamano = Number(tamañoSeleccionado?.precio_adicional || 0)
  const precioAdicionalPapel = Number(papelSeleccionado?.precio_adicional || 0)
  const precioAdicional = precioAdicionalTamano + precioAdicionalPapel
  const precioFinal = precioNum + precioAdicional

  function handleAdd() {
    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: precioNum,
      precioAdicional,
      precioAdicionalTamano,
      precioAdicionalPapel,
      tamañoSeleccionado: tamañoSeleccionado?.nombre || null,
      tipoPapelSeleccionado: papelSeleccionado?.nombre || null,
      imagenes: producto.imagenes || (imgSrc ? [imgSrc] : []),
      descripcion: producto.descripcion || '',
      categoria: producto.categoria || '',
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col" style={{ minWidth: "220px", maxWidth: "260px" }}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={producto.nombre}
          className="w-full h-48 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <div className="w-full h-48 bg-linear-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl">
          🛍️
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-base mb-1 leading-snug">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{producto.descripcion}</p>
        )}

        {hasOpcionesSticker && (
          <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50/80">
            <button
              type="button"
              onClick={() => setOpcionesAbiertas((prev) => !prev)}
              className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
              <div>
                <p className="text-xs font-semibold text-gray-700">Opciones del sticker</p>
                <p className="text-[11px] text-gray-500">
                  {tamañoSeleccionado?.nombre || tamaños[0]?.nombre || 'Sin medida'} · {papelSeleccionado?.nombre || papelesActivos[0]?.nombre || 'Sin impresión'}
                </p>
              </div>
              <span className="text-sm text-gray-500">{opcionesAbiertas ? '▲' : '▼'}</span>
            </button>

            {opcionesAbiertas && (
              <div className="border-t border-gray-200 px-3 py-3">
                {tamaños.length > 0 && (
                  <div className="mb-3 last:mb-0">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Medida</label>
                    <div className="flex flex-wrap gap-2">
                      {tamaños.map((tamaño, idx) => {
                        const activo = idx === tamañoIndex
                        const extra = Number(tamaño?.precio_adicional || 0)
                        return (
                          <button
                            key={`${tamaño?.nombre || 'tam'}-${idx}`}
                            type="button"
                            onClick={() => setTamañoIndex(idx)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              activo
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                            }`}
                          >
                            {tamaño?.nombre || `Opción ${idx + 1}`}{extra > 0 ? ` (+$${extra.toLocaleString('es-AR')})` : ''}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {papelesActivos.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de impresión</label>
                    <div className="flex flex-wrap gap-2">
                      {papelesActivos.map((papel, idx) => {
                        const activo = idx === papelIndex
                        const extra = Number(papel.precio_adicional || 0)
                        return (
                          <button
                            key={`${papel.nombre}-${idx}`}
                            type="button"
                            onClick={() => setPapelIndex(idx)}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              activo
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                            }`}
                          >
                            {papel.nombre}{extra > 0 ? ` (+$${extra.toLocaleString('es-AR')})` : ''}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-purple-600 font-bold text-xl mt-auto mb-3">
          ${precioFinal.toLocaleString('es-AR')}
        </p>
        <button
          onClick={handleAdd}
          className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-xl font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow hover:shadow-md active:scale-95"
        >
          🛒 Agregar al carrito
        </button>
        <p className="text-[11px] text-gray-500 mt-2 text-center">
          Pedido minimo total: {MIN_UNIDADES_COMPRA} unidades
        </p>
      </div>
    </div>
  )
}