'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
          Libca Diseños ✨
        </Link>
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Inicio</Link>
          <Link href="/personalizar" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Personalizar</Link>
          <Link href="/#productos" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Productos</Link>
        </div>
        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>
      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/personalizar" className="text-gray-700 hover:text-purple-600 transition-colors font-medium" onClick={() => setMenuOpen(false)}>Personalizar</Link>
          <Link href="/#productos" className="text-gray-700 hover:text-purple-600 transition-colors font-medium" onClick={() => setMenuOpen(false)}>Productos</Link>
        </div>
      )}
    </header>
  )
}