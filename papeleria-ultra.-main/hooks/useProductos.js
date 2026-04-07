"use client"
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Caché simple para evitar llamadas repetidas
const productosCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useProductos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar productos con caché
  const cargarProductos = useCallback(async (categoria = null) => {
    const cacheKey = categoria || 'todos'
    const cached = productosCache.get(cacheKey)

    // Verificar si el caché es válido
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setProductos(cached.data)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      let query = supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false })

      if (categoria && categoria !== 'todos') {
        query = query.eq('categoria', categoria)
      }

      const { data, error } = await query

      if (error) throw error

      const productosData = data || []

      // Guardar en caché
      productosCache.set(cacheKey, {
        data: productosData,
        timestamp: Date.now()
      })

      setProductos(productosData)
      setError(null)
    } catch (err) {
      // Intentar usar caché si hay error
      if (cached) {
        setProductos(cached.data)
        setError(null)
      } else {
        // Fallback a productos demo cuando no hay conexión a Supabase
        const demo = [
          { id: 1, nombre: 'Sticker Personalizado 7cm', precio: 1500, descripcion: 'Pack de stickers impresos en alta calidad, tamaño 7cm.', categoria: 'stickers', imagenes: [], activo: true },
          { id: 2, nombre: 'Sticker Personalizado 4cm', precio: 900, descripcion: 'Stickers pequeños ideales para packaging y regalos.', categoria: 'stickers', imagenes: [], activo: true },
          { id: 3, nombre: 'Invitación Impresa', precio: 2500, descripcion: 'Invitaciones de cumpleaños, bodas y eventos en papel premium.', categoria: 'invitaciones', imagenes: [], activo: true },
          { id: 4, nombre: 'Kit de Papelería', precio: 5500, descripcion: 'Set completo de papelería personalizada para tu negocio o evento.', categoria: 'papeleria', imagenes: [], activo: true },
          { id: 5, nombre: 'Laminado Brillante A4', precio: 1200, descripcion: 'Impresión A4 con laminado brillante de alta durabilidad.', categoria: 'impresion', imagenes: [], activo: true },
        ]
        setProductos(demo)
        setError(null)
      }
      console.error('Error cargando productos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Limpiar caché cuando se actualiza un producto
  const invalidateCache = useCallback(() => {
    productosCache.clear()
  }, [])

  // Agregar producto
  const agregarProducto = useCallback(async (producto) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select()

      if (error) throw error

      invalidateCache() // Limpiar caché
      setProductos(prev => [data[0], ...prev])
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [invalidateCache])

  // Actualizar producto
  const actualizarProducto = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      invalidateCache() // Limpiar caché
      setProductos(prev => prev.map(p => p.id === id ? data[0] : p))
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [invalidateCache])

  // Eliminar producto
  const eliminarProducto = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error

      invalidateCache() // Limpiar caché
      setProductos(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [invalidateCache])

  // Obtener categorías únicas
  const getCategorias = useCallback(() => {
    const categorias = [...new Set(productos.map(p => p.categoria))]
    return categorias
  }, [productos])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  return {
    productos,
    loading,
    error,
    cargarProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    getCategorias,
    invalidateCache
  }
}