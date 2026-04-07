"use client"
import AdminProductos from '../../components/AdminProductos'
import AdminPedidos from '../../components/AdminPedidos'
import AdminContenidoHome from '../../components/AdminContenidoHome'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('productos')
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      {/* Header de navegación */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gradient">Panel de Administración</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setActiveTab('productos')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'productos'
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📦 Productos
              </button>
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'pedidos'
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Pedidos
              </button>
              <button
                onClick={() => setActiveTab('contenido')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === 'contenido'
                    ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ✨ Contenido Home
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold text-red-500 hover:bg-red-50 transition-all border border-red-200"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="pt-8">
        {activeTab === 'productos' && <AdminProductos />}
        {activeTab === 'pedidos' && <AdminPedidos />}
        {activeTab === 'contenido' && <AdminContenidoHome />}
      </div>
    </div>
  )
}