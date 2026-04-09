"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosHoy: 0,
    ingresoTotal: 0,
    ingresoHoy: 0,
    pedidosEnProceso: 0,
    pedidosEntregados: 0,
  })
  const [pedidosRecientes, setPedidosRecientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const [productosRes, pedidosRes] = await Promise.all([
        supabase.from('productos').select('id', { count: 'exact' }).eq('activo', true),
        supabase.from('pedidos').select('id, estado, total, created_at').order('created_at', { ascending: false }),
      ])

      const pedidos = pedidosRes.data || []
      const pedidosHoy = pedidos.filter(p => new Date(p.created_at) >= hoy)

      setStats({
        totalProductos: productosRes.count || 0,
        totalPedidos: pedidos.length,
        pedidosPendientes: pedidos.filter(p => p.estado === 'pendiente').length,
        pedidosHoy: pedidosHoy.length,
        ingresoTotal: pedidos.filter(p => p.estado !== 'cancelado').reduce((s, p) => s + Number(p.total), 0),
        ingresoHoy: pedidosHoy.filter(p => p.estado !== 'cancelado').reduce((s, p) => s + Number(p.total), 0),
        pedidosEnProceso: pedidos.filter(p => ['confirmado', 'en_proceso', 'enviado'].includes(p.estado)).length,
        pedidosEntregados: pedidos.filter(p => p.estado === 'entregado').length,
      })

      setPedidosRecientes(pedidos.slice(0, 5))
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    } finally {
      setLoading(false)
    }
  }

  const estadoColor = {
    pendiente: 'bg-yellow-100 text-yellow-700',
    confirmado: 'bg-blue-100 text-blue-700',
    en_proceso: 'bg-orange-100 text-orange-700',
    enviado: 'bg-purple-100 text-purple-700',
    entregado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700',
  }

  const estadoEmoji = {
    pendiente: '⏳', confirmado: '✅', en_proceso: '🔄',
    enviado: '📦', entregado: '🎉', cancelado: '❌',
  }

  const formatPeso = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  const CARDS = [
    { label: 'Productos activos', value: stats.totalProductos, icon: '📦', color: 'from-purple-500 to-violet-600', sub: 'en catálogo' },
    { label: 'Pedidos totales', value: stats.totalPedidos, icon: '🛒', color: 'from-pink-500 to-rose-600', sub: `${stats.pedidosHoy} hoy` },
    { label: 'Pendientes', value: stats.pedidosPendientes, icon: '⏳', color: 'from-yellow-400 to-orange-500', sub: 'requieren atención' },
    { label: 'En proceso', value: stats.pedidosEnProceso, icon: '🔄', color: 'from-blue-500 to-cyan-600', sub: 'confirmado · proceso · enviado' },
    { label: 'Entregados', value: stats.pedidosEntregados, icon: '🎉', color: 'from-green-500 to-emerald-600', sub: 'completados' },
    { label: 'Ingreso total', value: formatPeso(stats.ingresoTotal), icon: '💰', color: 'from-indigo-500 to-purple-600', sub: `${formatPeso(stats.ingresoHoy)} hoy` },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gradient">Panel General</h2>
        <p className="text-gray-500 mt-1">Resumen de tu tienda en tiempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{card.value}</div>
            <div className="text-sm font-semibold text-gray-700 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-lg">Últimos pedidos</h3>
          <button onClick={cargarEstadisticas} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
            🔄 Actualizar
          </button>
        </div>
        {pedidosRecientes.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>Aún no hay pedidos registrados.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pedidosRecientes.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                    #{p.id}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Pedido #{p.id}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoColor[p.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {estadoEmoji[p.estado]} {p.estado}
                  </span>
                  <span className="font-bold text-gray-800 text-sm">{formatPeso(p.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
