import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-linear-to-r from-gray-50 to-pink-50 border-t border-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Libca Diseños ✨
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Diseños únicos y personalizados para expresar tu creatividad. Stickers y mucho más.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/libcadis/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors">Inicio</Link></li>
              <li><Link href="/personalizar" className="text-gray-600 hover:text-purple-600 transition-colors">Personalizar</Link></li>
              <li><Link href="#productos" className="text-gray-600 hover:text-purple-600 transition-colors">Productos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Contacto</h4>
            <p className="text-gray-600 text-sm">
              <a href="https://wa.me/5491156925501" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors">WhatsApp: +54 9 11 5692 5501</a><br/>
              <a href="mailto:libcadis@gmail.com" className="hover:text-purple-600 transition-colors">libcadis@gmail.com</a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">&copy; 2026 Libca Diseños. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}