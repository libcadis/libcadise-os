"use client"
import { createContext, useContext, useState } from "react"
import { usePedidos } from "../hooks/usePedidos"

const CartContext = createContext()
const MIN_UNIDADES_COMPRA = 5

export function CartProvider({ children }){
  const [cart, setCart] = useState([])
  const { crearPedido } = usePedidos()

  function addToCart(product){
    setCart(prev => [...prev, product])
  }

  function removeItem(index){
    setCart(prev => prev.filter((_,i)=>i!==index))
  }

  function clearCart() {
    setCart([])
  }

  function getTotal() {
    return cart.reduce((total, item) => {
      const cantidad = item.cantidad || 1
      const unitario = (item.precio || 0) + (item.precioAdicional || 0)
      return total + (unitario * cantidad)
    }, 0)
  }

  function getTotalUnidades() {
    return cart.reduce((total, item) => total + (item.cantidad || 1), 0)
  }

  async function checkout(clienteData) {
    try {
      const totalUnidades = getTotalUnidades()
      if (totalUnidades < MIN_UNIDADES_COMPRA) {
        throw new Error(`La compra minima es de ${MIN_UNIDADES_COMPRA} unidades. Actualmente tienes ${totalUnidades}.`)
      }

      const items = cart.map(item => ({
        producto_id: item.id,
        nombre_producto: item.nombre,
        precio_unitario: item.precio,
        cantidad: item.cantidad || 1,
        tamaño_seleccionado: [item.tamañoSeleccionado, item.tipoPapelSeleccionado].filter(Boolean).join(' | ') || null,
        precio_adicional: item.precioAdicional || 0,
        imagen: (Array.isArray(item.imagenes) && item.imagenes[0]) || item.imagen || null,
        subtotal: ((item.precio + (item.precioAdicional || 0)) * (item.cantidad || 1))
      }))

      const pedidoData = {
        cliente_nombre: clienteData.nombre,
        cliente_email: clienteData.email,
        cliente_telefono: clienteData.telefono,
        cliente_direccion: clienteData.direccion,
        total: getTotal(),
        notas: clienteData.notas || ''
      }

      const result = await crearPedido(pedidoData, items)
      clearCart()
      return result
    } catch (error) {
      throw error
    }
  }

  return(
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeItem,
      clearCart,
      getTotal,
      getTotalUnidades,
      MIN_UNIDADES_COMPRA,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = ()=>useContext(CartContext)