"use client"
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const initializeDatabase = async () => {
    setLoading(true)
    setMessage('Inicializando base de datos...')

    try {
      // Verificar conexión
      const { data, error } = await supabase.from('productos').select('count').limit(1)
      if (error && error.code === 'PGRST116') {
        setMessage('Las tablas no existen. Creando estructura...')

        // Crear tablas usando SQL raw (esto requiere permisos elevados)
        // Nota: En producción, esto debería hacerse desde el dashboard de Supabase
        alert('Por favor, ejecuta el archivo supabase-schema.sql en el SQL Editor de Supabase Dashboard')
        setMessage('Revisa las instrucciones en README-DATABASE.md')
        return
      }

      setMessage('Base de datos ya inicializada correctamente! ✅')
    } catch (error) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="container max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gradient mb-8">
          🗄️ Configuración de Base de Datos
        </h1>

        <div className="glass p-8 rounded-3xl shadow-2xl">
          <p className="text-lg text-gray-600 mb-6">
            Para completar la configuración, necesitas ejecutar el schema SQL en Supabase.
          </p>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">📋 Instrucciones</h3>
            <ol className="text-left text-yellow-700 space-y-2">
              <li>1. Ve a <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
              <li>2. Abre el SQL Editor de tu proyecto</li>
              <li>3. Copia y pega el contenido del archivo <code>supabase-schema.sql</code></li>
              <li>4. Ejecuta el script</li>
            </ol>
          </div>

          <button
            onClick={initializeDatabase}
            disabled={loading}
            className="bg-linear-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Verificando...' : '🔍 Verificar Conexión'}
          </button>

          {message && (
            <div className="mt-6 p-4 bg-white/50 rounded-2xl">
              <p className="text-gray-800">{message}</p>
            </div>
          )}

          <div className="mt-8 text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Estructura que se creará:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/50 p-4 rounded-2xl">
                <h4 className="font-bold text-purple-600 mb-2">📦 productos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• nombre, precio, descripción</li>
                  <li>• categoría, imágenes</li>
                  <li>• descuento, tamaños</li>
                </ul>
              </div>
              <div className="bg-white/50 p-4 rounded-2xl">
                <h4 className="font-bold text-blue-600 mb-2">📋 pedidos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• datos del cliente</li>
                  <li>• total, estado</li>
                  <li>• fecha y notas</li>
                </ul>
              </div>
              <div className="bg-white/50 p-4 rounded-2xl">
                <h4 className="font-bold text-green-600 mb-2">🛒 pedido_items</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• productos del pedido</li>
                  <li>• cantidades y precios</li>
                  <li>• tamaños seleccionados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}