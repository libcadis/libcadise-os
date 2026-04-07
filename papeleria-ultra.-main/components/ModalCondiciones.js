"use client"
import { useState } from 'react'

export default function ModalCondiciones({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gradient">📋 Condiciones de Envío Gratis</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 text-gray-700">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-3">✅ Envío Gratis</h3>
              <p className="text-green-700">
                Disfruta de envío gratuito en todas las compras mayores a $1000.
                Esta promoción aplica para todo el territorio nacional.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">🚚 Tiempos de Entrega</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>CABA y GBA: 2-3 días hábiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Interior del país: 4-7 días hábiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Productos personalizados: +2 días de producción</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">💰 Formas de Pago</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Transferencia bancaria</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Mercado Pago</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Efectivo contra entrega</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">🔄 Cambios y Devoluciones</h3>
              <p className="mb-3">
                Aceptamos cambios y devoluciones dentro de los 7 días de recibido el producto,
                siempre y cuando el mismo se encuentre en perfectas condiciones.
              </p>
              <p>
                Los productos personalizados no tienen cambio, salvo defectos de fabricación.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">📞 Contacto</h3>
              <p>
                Para cualquier consulta, no dudes en contactarnos por WhatsApp o
                nuestras redes sociales. Estamos aquí para ayudarte! ✨
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="btn-primary px-8 py-3"
            >
              ¡Entendido! 🎉
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}