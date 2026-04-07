"use client"
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Crear pedido
  const crearPedido = async (pedidoData, items) => {
    try {
      setLoading(true)

      // Crear el pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select()
        .single()

      if (pedidoError) throw pedidoError

      // Crear los items del pedido
      const itemsConPedidoId = items.map(item => ({
        ...item,
        pedido_id: pedido.id
      }))

      const { data: pedidoItems, error: itemsError } = await supabase
        .from('pedido_items')
        .insert(itemsConPedidoId)
        .select()

      if (itemsError) throw itemsError

      return { pedido, items: pedidoItems }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cargar pedidos
  const cargarPedidos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPedidos(data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estado del pedido
  const actualizarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ estado: nuevoEstado, updated_at: new Date() })
        .eq('id', id)
        .select()

      if (error) throw error

      setPedidos(prev => prev.map(p => p.id === id ? data[0] : p))
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    pedidos,
    loading,
    error,
    crearPedido,
    cargarPedidos,
    actualizarEstadoPedido
  }
}