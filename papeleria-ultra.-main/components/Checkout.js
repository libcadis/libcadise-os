"use client"
import { useState } from 'react'
import { useCart } from '../components/CartContext'

export default function Checkout() {
  const { cart, getTotal, getTotalUnidades, MIN_UNIDADES_COMPRA, checkout } = useCart()
  const [clienteData, setClienteData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: ''
  })
  const [loading, setLoading] = useState(false)
  const totalUnidades = getTotalUnidades()
  const compraHabilitada = totalUnidades >= MIN_UNIDADES_COMPRA

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!compraHabilitada) {
      alert(`La compra minima es de ${MIN_UNIDADES_COMPRA} unidades. Actualmente tienes ${totalUnidades}.`)
      return
    }

    setLoading(true)

    try {
      await checkout(clienteData)
      alert('¡Pedido realizado exitosamente! Te contactaremos pronto.')
      // Aquí podrías redirigir a una página de confirmación
    } catch (error) {
      alert('Error al procesar el pedido: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setClienteData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gradient mb-8">Carrito Vacío</h1>
          <p className="text-xl text-gray-600 mb-8">No tienes productos en tu carrito</p>
          <a href="/" className="btn-primary">Volver a la tienda</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            🛒 Finalizar Compra
          </h1>
          <p className="text-xl text-gray-600">
            Completa tu información para procesar el pedido
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Resumen del pedido */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Resumen del Pedido</h2>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/50 rounded-lg p-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                      <p className="text-sm text-gray-600">${item.precio}</p>
                      {item.tamañoSeleccionado && (
                        <p className="text-xs text-purple-600">📏 {item.tamañoSeleccionado}</p>
                      )}
                      {item.tipoPapelSeleccionado && (
                        <p className="text-xs text-blue-600">📄 {item.tipoPapelSeleccionado}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gradient">
                        ${(item.precio + (item.precioAdicional || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span>Unidades:</span>
                  <span className="font-semibold">{totalUnidades}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-gradient">${getTotal().toFixed(2)}</span>
                </div>
                {!compraHabilitada && (
                  <p className="text-sm text-red-600 mt-3">
                    Compra minima: {MIN_UNIDADES_COMPRA} unidades. Te faltan {MIN_UNIDADES_COMPRA - totalUnidades}.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Formulario de datos del cliente */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Información de Envío</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={clienteData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={clienteData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📱 Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={clienteData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 Dirección de Envío
                  </label>
                  <textarea
                    name="direccion"
                    value={clienteData.direccion}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Dirección completa, ciudad, código postal..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Notas Adicionales (Opcional)
                  </label>
                  <textarea
                    name="notas"
                    value={clienteData.notas}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Instrucciones especiales de entrega, personalización, etc."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !compraHabilitada}
                    className="w-full bg-linear-to-r from-green-400 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando...
                      </span>
                    ) : (
                      '✅ Confirmar Pedido'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Información de pago y envío */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💳 Información de Pago</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>💰 <strong>Formas de Pago:</strong> Transferencia bancaria, Mercado Pago, Efectivo</p>
                <p>🚚 <strong>Envío:</strong> A coordinar según ubicación</p>
                <p>⏰ <strong>Tiempo de Producción:</strong> 3-7 días hábiles</p>
                <p>📞 <strong>Contacto:</strong> Te contactaremos para coordinar el pago y envío</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}