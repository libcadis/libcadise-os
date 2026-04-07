"use client"
import { useCart } from "./CartContext"
import { useState } from "react"
import Link from "next/link"

export default function Cart(){
  const { cart, removeItem, MIN_UNIDADES_COMPRA } = useCart()
  const [open,setOpen] = useState(false)

  const totalUnidades = cart.reduce((acc, p) => acc + (p.cantidad || 1), 0)
  const compraHabilitada = totalUnidades >= MIN_UNIDADES_COMPRA

  const total = cart.reduce((acc, p) => {
    const cantidad = p.cantidad || 1
    return acc + ((p.precio + (p.precioAdicional || 0)) * cantidad)
  }, 0)

  return(
    <>
      <button
        onClick={()=>setOpen(!open)}
        className="fixed bottom-24 right-6 bg-linear-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 group"
      >
        <div className="relative">
          🛒
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
              {cart.length}
            </span>
          )}
        </div>
        <div className="absolute bottom-14 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Carrito de compras
        </div>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={()=>setOpen(false)}
        ></div>
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 w-full md:w-96 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800">Tu Carrito</h3>
            <button
              onClick={()=>setOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-3xl font-light"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm mt-2">¡Agrega algunos productos!</p>
              </div>
            ) : (
              <ul>
                {cart.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <div className="font-semibold text-gray-800">{item.nombre}</div>
                      {item.tamañoSeleccionado && (
                        <div className="text-xs text-purple-600">📏 {item.tamañoSeleccionado}</div>
                      )}
                      {item.tipoPapelSeleccionado && (
                        <div className="text-xs text-blue-600">📄 {item.tipoPapelSeleccionado}</div>
                      )}
                      <div className="text-sm text-gray-500">${(item.precio + (item.precioAdicional || 0)) * (item.cantidad || 1)}</div>
                    </div>
                    <button
                      onClick={()=>removeItem(idx)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold px-2"
                      title="Quitar"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg text-gray-800">Total:</span>
              <span className="text-xl font-bold text-purple-600">${total}</span>
            </div>
            {!compraHabilitada && cart.length > 0 && (
              <p className="text-sm text-red-600 mb-3">
                Compra minima: {MIN_UNIDADES_COMPRA} unidades. Te faltan {MIN_UNIDADES_COMPRA - totalUnidades}.
              </p>
            )}
            <Link href="/checkout">
              <button
                className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold text-lg shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cart.length === 0 || !compraHabilitada}
              >
                Finalizar compra
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}