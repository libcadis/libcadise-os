"use client"
import AdminProductos from '../../components/AdminProductos'
import AdminPedidos from '../../components/AdminPedidos'
import AdminContenidoHome from '../../components/AdminContenidoHome'
import AdminDashboard from '../../components/AdminDashboard'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Panel general', emoji: '📊' },
  { id: 'productos', label: 'Productos', emoji: '📦' },
  { id: 'pedidos', label: 'Pedidos', emoji: '🛒' },
  { id: 'contenido', label: 'Contenido home', emoji: '✨' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const currentNav = NAV_ITEMS.find(n => n.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ─────────────────────────────────── */}
      <>
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-lg z-30
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}>
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow">
                P
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm leading-tight">Papelería Ultra</div>
                <div className="text-xs text-gray-400">Panel Admin</div>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer del sidebar */}
          <div className="px-3 py-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <span className="text-lg">🚪</span>
              Cerrar sesión
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-gray-800">
                {currentNav?.emoji} {currentNav?.label}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Tabs responsive en topbar */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'productos' && <AdminProductos />}
          {activeTab === 'pedidos' && <AdminPedidos />}
          {activeTab === 'contenido' && <AdminContenidoHome />}
        </main>
      </div>
    </div>
  )
}