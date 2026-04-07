"use client"
import { useState, useEffect } from 'react'
import { usePedidos } from '../hooks/usePedidos'

export default function AdminPedidos() {
  const { pedidos, loading, cargarPedidos, actualizarEstadoPedido } = usePedidos()
  const [filtroEstado, setFiltroEstado] = useState('todos')

  useEffect(() => {
    cargarPedidos()
  }, [])

  const enviarWhatsApp = (pedido, nuevoEstado) => {
    if (!pedido.cliente_telefono) return

    // Limpiar número: quitar espacios, guiones, paréntesis, +
    let tel = pedido.cliente_telefono.replace(/[\s\-\(\)\+]/g, '')
    // Formato Argentina: si tiene 10 dígitos → agregar 549
    if (tel.length === 10) tel = '549' + tel
    // Si empieza con 0 → reemplazar con 549
    else if (tel.startsWith('0')) tel = '549' + tel.substring(1)
    // Si tiene 54 pero no 549 → insertar 9
    else if (tel.startsWith('54') && !tel.startsWith('549')) tel = '549' + tel.substring(2)

    const nombre = pedido.cliente_nombre || 'cliente'
    const mensajes = {
      confirmado: `✅ Hola ${nombre}! Tu pedido #${pedido.id} fue *confirmado*. Ya estamos trabajando en él. ¡Gracias por elegirnos! 🎉`,
      en_proceso: `🔄 Hola ${nombre}! Tu pedido #${pedido.id} está *en proceso* de fabricación. Te avisamos cuando esté listo 😊`,
      enviado: `📦 Hola ${nombre}! Tu pedido #${pedido.id} fue *enviado*. Pronto lo recibirás en tu domicilio 🚚`,
      entregado: `🎉 Hola ${nombre}! Tu pedido #${pedido.id} fue *entregado* exitosamente. ¡Esperamos que te encante! Gracias por tu compra 💖`,
      cancelado: `❌ Hola ${nombre}, lamentamos informarte que tu pedido #${pedido.id} fue *cancelado*. Para más información contactanos 📞`
    }

    const mensaje = mensajes[nuevoEstado]
    if (!mensaje) return

    const url = `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  const cambiarEstado = async (pedido, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(pedido.id, nuevoEstado)
      // Abrir WhatsApp con mensaje automático al cliente
      enviarWhatsApp(pedido, nuevoEstado)
      alert('Estado actualizado. Se abrió WhatsApp para notificar al cliente.')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(pedido => pedido.estado === filtroEstado)

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'confirmado': return 'bg-blue-100 text-blue-800'
      case 'en_proceso': return 'bg-orange-100 text-orange-800'
      case 'enviado': return 'bg-purple-100 text-purple-800'
      case 'entregado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoEmoji = (estado) => {
    switch (estado) {
      case 'pendiente': return '⏳'
      case 'confirmado': return '✅'
      case 'en_proceso': return '🔄'
      case 'enviado': return '📦'
      case 'entregado': return '🎉'
      case 'cancelado': return '❌'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            📋 Administración de Pedidos
          </h1>
          <p className="text-xl text-gray-600">
            Gestiona todos los pedidos de tu tienda
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 text-center">
          <div className="inline-flex bg-white/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            {['todos', 'pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado'].map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filtroEstado === estado
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/80'
                }`}
              >
                {estado === 'todos' ? '📦 Todos' : `${getEstadoEmoji(estado)} ${estado.charAt(0).toUpperCase() + estado.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-gradient">{pedidos.length}</div>
            <div className="text-sm text-gray-600">Total Pedidos</div>
          </div>
          <div className="glass p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-yellow-500">{pedidos.filter(p => p.estado === 'pendiente').length}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="glass p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-blue-500">{pedidos.filter(p => p.estado === 'confirmado').length}</div>
            <div className="text-sm text-gray-600">Confirmados</div>
          </div>
          <div className="glass p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-green-500">{pedidos.filter(p => p.estado === 'entregado').length}</div>
            <div className="text-sm text-gray-600">Entregados</div>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="space-y-6">
          {pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className="glass p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Pedido #{pedido.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(pedido.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(pedido.estado)}`}>
                    {getEstadoEmoji(pedido.estado)} {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                  </span>
                  <p className="text-lg font-bold text-gradient mt-2">
                    ${pedido.total}
                  </p>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">👤 Cliente</h4>
                  <p className="text-sm text-gray-600">{pedido.cliente_nombre}</p>
                  <p className="text-sm text-gray-600">📧 {pedido.cliente_email}</p>
                  <p className="text-sm text-gray-600">📱 {pedido.cliente_telefono}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">📍 Dirección</h4>
                  <p className="text-sm text-gray-600">{pedido.cliente_direccion}</p>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">🛒 Productos</h4>
                <div className="space-y-2">
                  {pedido.pedido_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre_producto}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                            🖼️
                          </div>
                        )}
                        <div>
                        <p className="font-medium text-gray-800">{item.nombre_producto}</p>
                        {item.tamaño_seleccionado && (
                          <p className="text-sm text-gray-600">📏 {item.tamaño_seleccionado}</p>
                        )}
                        <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gradient">${item.subtotal}</p>
                        {item.precio_adicional > 0 && (
                          <p className="text-sm text-gray-600">+${item.precio_adicional} (tamaño)</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              {pedido.notas && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">📝 Notas</h4>
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">{pedido.notas}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2">
                {pedido.estado === 'pendiente' && (
                  <button
                    onClick={() => cambiarEstado(pedido, 'confirmado')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    ✅ Confirmar
                  </button>
                )}
                {pedido.estado === 'confirmado' && (
                  <button
                    onClick={() => cambiarEstado(pedido, 'en_proceso')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    🔄 En Proceso
                  </button>
                )}
                {pedido.estado === 'en_proceso' && (
                  <button
                    onClick={() => cambiarEstado(pedido, 'enviado')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    📦 Enviar
                  </button>
                )}
                {pedido.estado === 'enviado' && (
                  <button
                    onClick={() => cambiarEstado(pedido, 'entregado')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    🎉 Entregado
                  </button>
                )}
                {pedido.estado !== 'cancelado' && pedido.estado !== 'entregado' && (
                  <button
                    onClick={() => cambiarEstado(pedido, 'cancelado')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No hay pedidos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}